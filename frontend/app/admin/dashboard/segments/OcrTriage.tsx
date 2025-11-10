/** @fileoverview OCR Error Triage - Monitor and manage OCR processing errors */

'use client';

import { useEffect, useState, useMemo } from 'react';
import { useTenantFeed } from '@/lib/admin/hooks/useTenantFeed';
import { useAuthedFetch } from '@/lib/admin/hooks/useAuthedFetch';
import { useToast } from '@/components/admin/ui/useToast';
import { EmptyState, ErrorState, LoadingState, Button } from '@/components/admin/ui/CommonStates';

interface OcrError {
  id: string;
  type: 'error';
  ts: string;
  details: {
    docId?: string;
    filename?: string;
    errorCode?: string;
    errorMessage?: string;
    fileSize?: string;
    ocrEngine?: string;
    confidence?: number;
    retryCount?: number;
    tenantId?: string;
    retrying?: boolean;
    [key: string]: unknown; // Allow additional fields for optimistic updates
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface ErrorStats {
  total: number;
  bySeverity: Record<string, number>;
  byErrorCode: Record<string, number>;
  avgRetryCount: number;
  resolvedToday: number;
}

interface OcrTriageProps {
  adminToken: string;
  tenantId: string;
}

export default function OcrTriage({ adminToken, tenantId }: OcrTriageProps) {
  const { status, events, getEventsByType } = useTenantFeed(
    process.env.NEXT_PUBLIC_WS_URL,
    adminToken,
    tenantId
  );
  
  const fetcher = useAuthedFetch(adminToken);
  const { show, Toast } = useToast();

  const [errorItems, setErrorItems] = useState<OcrError[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [stats, setStats] = useState<ErrorStats>({
    total: 0,
    bySeverity: {},
    byErrorCode: {},
    avgRetryCount: 0,
    resolvedToday: 0
  });
  const [filter, setFilter] = useState<'all' | 'critical' | 'unresolved'>('all');
  const [isRetrying, setIsRetrying] = useState<Set<string>>(new Set());
  const [isAcknowledging, setIsAcknowledging] = useState<Set<string>>(new Set());
  const [isEscalating, setIsEscalating] = useState<Set<string>>(new Set());

  // Filter OCR error events from real-time feed
  const errorEvents = useMemo(() => {
    return getEventsByType(['ocr_error', 'error', 'vision_error', 'processing_failed']);
  }, [getEventsByType]);

  // Load initial error data
  useEffect(() => {
    const loadErrors = async () => {
      try {
        setLoading(true);
        const response = await fetcher('/api/admin/ocr/errors');
        setErrorItems(response.data || []);
        setError(null);
      } catch (err) {
        setError(err as Error);
        console.error('Failed to load OCR errors:', err);
      } finally {
        setLoading(false);
      }
    };

    if (adminToken) {
      loadErrors();
    }
  }, [adminToken, fetcher]);

  // Process real-time events and add to error list
  useEffect(() => {
    errorEvents.forEach((event: { id: string; type: string; ts: string; details: Record<string, unknown>; tenant_id?: string }) => {
      const newError: OcrError = {
        id: event.id,
        type: 'error',
        ts: event.ts,
        details: {
          docId: event.details?.docId as string | undefined,
          filename: event.details?.filename as string | undefined,
          errorCode: (event.details?.errorCode || event.details?.code) as string | undefined,
          errorMessage: (event.details?.errorMessage || event.details?.message) as string | undefined,
          fileSize: event.details?.fileSize as string | undefined,
          ocrEngine: event.details?.ocrEngine as string | undefined,
          confidence: event.details?.confidence as number | undefined,
          retryCount: (event.details?.retryCount as number) || 0,
          tenantId: event.tenant_id
        },
        severity: getSeverityFromError(event.details)
      };

      setErrorItems(current => {
        // Remove existing error with same ID, then add new one
        const filtered = current.filter(item => item.id !== newError.id);
        return [newError, ...filtered].slice(0, 200); // Keep last 200 errors
      });
    });
  }, [errorEvents]);

  // Calculate stats
  useEffect(() => {
    const newStats: ErrorStats = {
      total: errorItems.length,
      bySeverity: errorItems.reduce((acc, item) => {
        acc[item.severity] = (acc[item.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byErrorCode: errorItems.reduce((acc, item) => {
        const code = item.details.errorCode || 'UNKNOWN';
        acc[code] = (acc[code] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      avgRetryCount: errorItems.length > 0 
        ? errorItems.reduce((sum, item) => sum + (item.details.retryCount || 0), 0) / errorItems.length
        : 0,
      resolvedToday: 0 // Would track from API
    };
    setStats(newStats);
  }, [errorItems]);

  const getSeverityFromError = (details: any): OcrError['severity'] => {
    const errorCode = details?.errorCode || details?.code || '';
    const message = details?.errorMessage || details?.message || '';
    
    if (errorCode.includes('timeout') || message.includes('timeout')) return 'critical';
    if (errorCode.includes('memory') || message.includes('memory')) return 'high';
    if (errorCode.includes('format') || message.includes('format')) return 'medium';
    if (errorCode.includes('confidence') && (details?.confidence || 0) < 0.5) return 'medium';
    
    return 'low';
  };

  const retry = async (docId: string) => {
    if (isRetrying.has(docId)) return;
    
    setIsRetrying(prev => new Set(prev).add(docId));
    const originalItems = [...errorItems];
    
    // Optimistic update: add retrying item
    const optimisticItem: OcrError = {
      id: `temp-retry-${Date.now()}`,
      type: 'error',
      ts: new Date().toISOString(),
      details: { 
        docId, 
        retrying: true, 
        filename: `Retrying ${docId.slice(-6)}...`,
        retryCount: (originalItems.find(item => item.details.docId === docId)?.details.retryCount || 0) + 1
      },
      severity: 'low'
    };
    
    setErrorItems(current => [optimisticItem, ...current.filter(item => item.details.docId !== docId)]);

    try {
      await fetcher('/api/admin/ocr/errors', {
        method: 'POST',
        body: JSON.stringify({ action: 'retry', docId })
      });
      show('OCR retry started successfully', 'success');
    } catch (err) {
      // Rollback on error
      setErrorItems(originalItems);
      show((err as Error).message || 'Failed to retry OCR', 'error');
    } finally {
      setIsRetrying(prev => {
        const newSet = new Set(prev);
        newSet.delete(docId);
        return newSet;
      });
    }
  };

  const acknowledge = async (errorId: string, docId: string) => {
    if (isAcknowledging.has(errorId)) return;
    
    setIsAcknowledging(prev => new Set(prev).add(errorId));
    const originalItems = [...errorItems];
    
    // Optimistic update: remove item immediately
    setErrorItems(current => current.filter(item => item.id !== errorId));

    try {
      await fetcher('/api/admin/ocr/errors', {
        method: 'POST',
        body: JSON.stringify({ action: 'acknowledge', errorId, docId })
      });
      show('Error acknowledged', 'success');
    } catch (err) {
      // Rollback on error
      setErrorItems(originalItems);
      show((err as Error).message || 'Failed to acknowledge error', 'error');
    } finally {
      setIsAcknowledging(prev => {
        const newSet = new Set(prev);
        newSet.delete(errorId);
        return newSet;
      });
    }
  };

  const escalate = async (docId: string, errorId: string) => {
    if (isEscalating.has(errorId)) return;
    
    setIsEscalating(prev => new Set(prev).add(errorId));
    
    try {
      await fetcher('/api/admin/ocr/errors', {
        method: 'POST',
        body: JSON.stringify({ action: 'escalate', docId, errorId })
      });
      show('Error escalated to support team', 'warning');
    } catch (err) {
      show((err as Error).message || 'Failed to escalate error', 'error');
    } finally {
      setIsEscalating(prev => {
        const newSet = new Set(prev);
        newSet.delete(errorId);
        return newSet;
      });
    }
  };

  const getSeverityBadge = (severity: OcrError['severity']) => {
    const badges = {
      low: { text: 'Low', className: 'bg-gray-100 text-gray-800' },
      medium: { text: 'Medium', className: 'bg-yellow-100 text-yellow-800' },
      high: { text: 'High', className: 'bg-orange-100 text-orange-800' },
      critical: { text: 'Critical', className: 'bg-red-100 text-red-800' }
    };
    return badges[severity];
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('fi-FI');
  };

  const formatFileSize = (size?: string) => {
    if (!size) return '-';
    return size;
  };

  const filteredErrors = errorItems.filter(item => {
    if (filter === 'critical') return item.severity === 'critical';
    if (filter === 'unresolved') return true; // Would check resolved status
    return true;
  });

  if (loading) {
    return (
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">OCR Error Triage</h2>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              status.status === 'connected' ? 'bg-green-500' :
              status.status === 'connecting' ? 'bg-yellow-500' :
              status.status === 'error' ? 'bg-red-500' : 'bg-gray-500'
            }`}></div>
            <span className="text-xs text-gray-500">
              {status.status === 'connected' ? '🟢 Live' : 
               status.status === 'connecting' ? '🟡 Connecting...' :
               status.status === 'error' ? '🔴 Error' : '⚪ Offline'}
            </span>
          </div>
        </div>
        <LoadingState count={5} message="Loading OCR errors..." />
        <Toast />
      </section>
    );
  }

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">OCR Error Triage</h2>
          <p className="text-sm text-gray-600 mt-1">
            Monitor and resolve OCR processing errors
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              status.status === 'connected' ? 'bg-green-500' :
              status.status === 'connecting' ? 'bg-yellow-500' :
              status.status === 'error' ? 'bg-red-500' : 'bg-gray-500'
            }`}></div>
            <span className="text-xs text-gray-500">
              {status.status === 'connected' ? '🟢 Live' : 
               status.status === 'connecting' ? '🟡 Connecting...' :
               status.status === 'error' ? '🔴 Error' : '⚪ Offline'}
            </span>
          </div>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as any)}
            className="text-xs border border-gray-300 rounded px-2 py-1"
          >
            <option value="all">All Errors</option>
            <option value="critical">Critical Only</option>
            <option value="unresolved">Unresolved Only</option>
          </select>
          <Button 
            onClick={() => window.location.reload()} 
            size="sm" 
            variant="secondary"
          >
            🔄 Refresh
          </Button>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.total}</div>
          <div className="text-xs text-gray-600">Total Errors</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {(stats.bySeverity.critical || 0) + (stats.bySeverity.high || 0)}
          </div>
          <div className="text-xs text-gray-600">High Priority</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.avgRetryCount.toFixed(1)}</div>
          <div className="text-xs text-gray-600">Avg Retries</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.resolvedToday}</div>
          <div className="text-xs text-gray-600">Resolved Today</div>
        </div>
      </div>

      {error && (
        <ErrorState 
          error={error} 
          onRetry={() => window.location.reload()} 
        />
      )}

      {!loading && filteredErrors.length === 0 && !error && (
        <EmptyState 
          icon="✅"
          title="No OCR Errors"
          description={filter === 'all' 
            ? "No OCR errors found. All documents processed successfully." 
            : `No ${filter} errors found.`
          }
        />
      )}

      {filteredErrors.length > 0 && (
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Error Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Error Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Retries
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredErrors.map((item) => {
                  const severityBadge = getSeverityBadge(item.severity);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${severityBadge.className}`}>
                          {severityBadge.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.details.filename || item.details.docId || 'Unknown Document'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatFileSize(item.details.fileSize)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-mono bg-gray-100 text-gray-800 rounded">
                          {item.details.errorCode || 'UNKNOWN'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={item.details.errorMessage}>
                          {item.details.errorMessage || 'No message available'}
                        </div>
                        {item.details.ocrEngine && (
                          <div className="text-xs text-gray-500">
                            Engine: {item.details.ocrEngine}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.details.retryCount || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTimestamp(item.ts)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => retry(item.details.docId || '')}
                            variant="primary"
                            disabled={isRetrying.has(item.details.docId || '')}
                          >
                            {isRetrying.has(item.details.docId || '') ? '⏳ Retrying...' : '🔄 Retry'}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => acknowledge(item.id, item.details.docId || '')}
                            variant="secondary"
                            disabled={isAcknowledging.has(item.id)}
                          >
                            {isAcknowledging.has(item.id) ? '⏳ Acking...' : '✓ Ack'}
                          </Button>
                          {['critical', 'high'].includes(item.severity) && (
                            <Button
                              size="sm"
                              onClick={() => escalate(item.details.docId || '', item.id)}
                              variant="danger"
                              disabled={isEscalating.has(item.id)}
                            >
                              {isEscalating.has(item.id) ? '⏳ Escalating...' : '🚨 Escalate'}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Toast />
    </section>
  );
}