/** @fileoverview Queue Manager - Shows real-time document processing queue with actions */

'use client';

import { useEffect, useState, useMemo } from 'react';
import { useTenantFeed } from '@/lib/admin/hooks/useTenantFeed';
import { useAuthedFetch } from '@/lib/admin/hooks/useAuthedFetch';
import { useToast } from '@/components/admin/ui/useToast';
import { EmptyState, ErrorState, LoadingState, Button } from '@/components/admin/ui/CommonStates';

interface AIEnrichment {
  type: 'invoice' | 'receipt' | 'contract' | 'other';
  confidence: number;
  tags: string[];
  summary: string;
}

interface QueueItem {
  id: string;
  type: 'upload' | 'queued' | 'processing' | 'completed' | 'failed';
  ts: string;
  details: {
    docId?: string;
    filename?: string;
    fileSize?: string;
    status?: string;
    error?: string;
    tenantId?: string;
    requeued?: boolean;
    retrying?: boolean;
    [key: string]: unknown; // Allow additional fields for optimistic updates
  };
  ai?: AIEnrichment;
  priority: 'low' | 'normal' | 'high';
}

interface QueueStats {
  total: number;
  queued: number;
  processing: number;
  failed: number;
  avgProcessTime: number;
}

interface QueueManagerProps {
  adminToken: string;
  tenantId: string;
}

export default function QueueManager({ adminToken, tenantId }: QueueManagerProps) {
  const { status, getEventsByType } = useTenantFeed(
    process.env.NEXT_PUBLIC_WS_URL,
    adminToken,
    tenantId
  );
  
  const fetcher = useAuthedFetch(adminToken);
  const { show, Toast } = useToast();

  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [stats, setStats] = useState<QueueStats>({
    total: 0,
    queued: 0,
    processing: 0,
    failed: 0,
    avgProcessTime: 0
  });
  const [isRequeueing, setIsRequeueing] = useState<Set<string>>(new Set());
  const [isRetrying, setIsRetrying] = useState<Set<string>>(new Set());
  const [isCancelling, setIsCancelling] = useState<Set<string>>(new Set());
  const [aiTypeFilter, setAiTypeFilter] = useState<'all' | 'invoice' | 'receipt' | 'contract' | 'other'>('all');

  // Filter queue-related events from real-time feed
  const queueEvents = useMemo(() => {
    return getEventsByType(['upload', 'queued', 'processing', 'completed', 'failed']);
  }, [getEventsByType]);

  // Load initial queue data
  useEffect(() => {
    const loadQueue = async () => {
      try {
        setLoading(true);
        const response = await fetcher('/api/admin/queue');
        setQueueItems(response.data || []);
        setError(null);
      } catch (err) {
        setError(err as Error);
        console.error('Failed to load queue:', err);
      } finally {
        setLoading(false);
      }
    };

    if (adminToken) {
      loadQueue();
    }
  }, [adminToken, fetcher]);

  // Process real-time events and add to queue
  useEffect(() => {
    queueEvents.forEach((event: { id: string; type: string; ts: string; details: Record<string, unknown> }) => {
      const newItem: QueueItem = {
        id: event.id,
        type: event.type as QueueItem['type'],
        ts: event.ts,
        details: event.details,
        priority: (event.details?.priority as QueueItem['priority']) || 'normal'
      };

      setQueueItems(current => {
        // Remove existing item with same ID, then add new one
        const filtered = current.filter(item => item.id !== newItem.id);
        return [newItem, ...filtered].slice(0, 100); // Keep last 100 items
      });
    });
  }, [queueEvents]);

  // Calculate stats
  useEffect(() => {
    const newStats: QueueStats = {
      total: queueItems.length,
      queued: queueItems.filter(item => ['upload', 'queued'].includes(item.type)).length,
      processing: queueItems.filter(item => item.type === 'processing').length,
      failed: queueItems.filter(item => item.type === 'failed').length,
      avgProcessTime: 2.3 // Mock data - would calculate from completed items
    };
    setStats(newStats);
  }, [queueItems]);

  const requeue = async (docId: string) => {
    if (isRequeueing.has(docId)) return;
    
    setIsRequeueing(prev => new Set(prev).add(docId));
    const originalItems = [...queueItems];
    
    // Optimistic update: remove original item, add optimistic one
    const optimisticItem: QueueItem = {
      id: `temp-${Date.now()}`,
      type: 'queued',
      ts: new Date().toISOString(),
      details: { docId, requeued: true, filename: `Requeueing ${docId.slice(-6)}...` },
      priority: 'normal'
    };
    
    setQueueItems(current => [optimisticItem, ...current.filter(item => item.details.docId !== docId)]);

    try {
      await fetcher('/api/admin/queue', {
        method: 'POST',
        body: JSON.stringify({ action: 'requeue', docId })
      });
      show('Document requeued successfully', 'success');
    } catch (err) {
      // Rollback on error
      setQueueItems(originalItems);
      show((err as Error).message || 'Failed to requeue document', 'error');
    } finally {
      setIsRequeueing(prev => {
        const newSet = new Set(prev);
        newSet.delete(docId);
        return newSet;
      });
    }
  };

  const retry = async (docId: string) => {
    if (isRetrying.has(docId)) return;
    
    setIsRetrying(prev => new Set(prev).add(docId));
    const originalItems = [...queueItems];
    
    // Optimistic update: change status to processing
    const optimisticItem: QueueItem = {
      id: `temp-retry-${Date.now()}`,
      type: 'processing',
      ts: new Date().toISOString(),
      details: { docId, retrying: true, filename: `Retrying ${docId.slice(-6)}...` },
      priority: 'normal'
    };
    
    setQueueItems(current => [optimisticItem, ...current.filter(item => item.details.docId !== docId)]);

    try {
      await fetcher('/api/admin/queue', {
        method: 'POST',
        body: JSON.stringify({ action: 'retry', docId })
      });
      show('Document retry started', 'success');
    } catch (err) {
      // Rollback on error
      setQueueItems(originalItems);
      show((err as Error).message || 'Failed to retry document', 'error');
    } finally {
      setIsRetrying(prev => {
        const newSet = new Set(prev);
        newSet.delete(docId);
        return newSet;
      });
    }
  };

  const cancel = async (docId: string) => {
    if (isCancelling.has(docId)) return;
    
    if (!confirm(`Cancel processing for document ${docId}?`)) {
      return;
    }

    setIsCancelling(prev => new Set(prev).add(docId));
    const originalItems = [...queueItems];
    
    // Optimistic update: remove item immediately
    setQueueItems(current => current.filter(item => item.details.docId !== docId));

    try {
      await fetcher('/api/admin/queue', {
        method: 'POST',
        body: JSON.stringify({ action: 'cancel', docId })
      });
      show('Document cancelled', 'success');
    } catch (err) {
      // Rollback on error
      setQueueItems(originalItems);
      show((err as Error).message || 'Failed to cancel document', 'error');
    } finally {
      setIsCancelling(prev => {
        const newSet = new Set(prev);
        newSet.delete(docId);
        return newSet;
      });
    }
  };

  const getStatusBadge = (type: QueueItem['type']) => {
    const badges = {
      upload: { text: 'Upload', className: 'bg-blue-100 text-blue-800' },
      queued: { text: 'Queued', className: 'bg-yellow-100 text-yellow-800' },
      processing: { text: 'Processing', className: 'bg-purple-100 text-purple-800' },
      completed: { text: 'Completed', className: 'bg-green-100 text-green-800' },
      failed: { text: 'Failed', className: 'bg-red-100 text-red-800' }
    };
    return badges[type] || badges.queued;
  };

  const getAITypeBadge = (aiType: AIEnrichment['type'], confidence: number) => {
    const badges = {
      invoice: { text: 'Invoice', className: 'bg-emerald-100 text-emerald-800' },
      receipt: { text: 'Receipt', className: 'bg-blue-100 text-blue-800' },
      contract: { text: 'Contract', className: 'bg-purple-100 text-purple-800' },
      other: { text: 'Other', className: 'bg-gray-100 text-gray-800' }
    };
    const badge = badges[aiType];
    const confidenceText = `${Math.round(confidence * 100)}%`;
    return {
      ...badge,
      text: `${badge.text} (${confidenceText})`
    };
  };

  // Filter queue items by AI type
  const filteredQueueItems = useMemo(() => {
    if (aiTypeFilter === 'all') return queueItems;
    return queueItems.filter(item => item.ai?.type === aiTypeFilter);
  }, [queueItems, aiTypeFilter]);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('fi-FI');
  };

  const formatFileSize = (size?: string) => {
    if (!size) return '-';
    return size;
  };

  if (loading) {
    return (
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Queue Manager</h2>
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
        <LoadingState count={5} message="Loading queue data..." />
        <Toast />
      </section>
    );
  }

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Queue Manager</h2>
          <p className="text-sm text-gray-600 mt-1">
            Real-time document processing queue with actions
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
            value={aiTypeFilter} 
            onChange={(e) => setAiTypeFilter(e.target.value as typeof aiTypeFilter)}
            className="text-xs border border-gray-300 rounded px-2 py-1"
          >
            <option value="all">All Types</option>
            <option value="invoice">AI suggests: Invoice</option>
            <option value="receipt">AI suggests: Receipt</option>
            <option value="contract">AI suggests: Contract</option>
            <option value="other">AI suggests: Other</option>
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-xs text-gray-600">Total</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.queued}</div>
          <div className="text-xs text-gray-600">Queued</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.processing}</div>
          <div className="text-xs text-gray-600">Processing</div>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          <div className="text-xs text-gray-600">Failed</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.avgProcessTime.toFixed(1)}s</div>
          <div className="text-xs text-gray-600">Avg Time</div>
        </div>
      </div>

      {error && (
        <ErrorState 
          error={error} 
          onRetry={() => window.location.reload()} 
        />
      )}

      {!loading && filteredQueueItems.length === 0 && !error && (
        <EmptyState 
          icon="📋"
          title={aiTypeFilter === 'all' ? "No Items in Queue" : `No ${aiTypeFilter} documents found`}
          description={aiTypeFilter === 'all' ? "Queue is empty. New documents will appear here when uploaded." : `No documents match the AI filter: ${aiTypeFilter}`}
        />
      )}

      {filteredQueueItems.length > 0 && (
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    AI Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File Size
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
                {filteredQueueItems.map((item) => {
                  const badge = getStatusBadge(item.type);
                  const aiBadge = item.ai ? getAITypeBadge(item.ai.type, item.ai.confidence) : null;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${badge.className}`}>
                          {badge.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.details.filename || item.details.docId || 'Unknown Document'}
                          </div>
                          {item.ai?.summary && (
                            <div className="text-xs text-gray-500 mt-1">{item.ai.summary}</div>
                          )}
                          {item.details.error && (
                            <div className="text-sm text-red-600">{item.details.error}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {aiBadge ? (
                          <div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${aiBadge.className}`}>
                              {aiBadge.text}
                            </span>
                            {item.ai?.tags && item.ai.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.ai.tags.slice(0, 2).map((tag, idx) => (
                                  <span key={idx} className="inline-flex px-1 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                                    {tag}
                                  </span>
                                ))}
                                {item.ai.tags.length > 2 && (
                                  <span className="inline-flex px-1 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                                    +{item.ai.tags.length - 2}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">No AI data</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatFileSize(item.details.fileSize)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTimestamp(item.ts)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {item.type === 'failed' && (
                            <Button
                              size="sm"
                              onClick={() => retry(item.details.docId || '')}
                              variant="primary"
                              disabled={isRetrying.has(item.details.docId || '')}
                            >
                              {isRetrying.has(item.details.docId || '') ? '⏳ Retrying...' : '🔄 Retry'}
                            </Button>
                          )}
                          {['upload', 'queued'].includes(item.type) && (
                            <Button
                              size="sm"
                              onClick={() => requeue(item.details.docId || '')}
                              variant="secondary"
                              disabled={isRequeueing.has(item.details.docId || '')}
                            >
                              {isRequeueing.has(item.details.docId || '') ? '⏳ Requeueing...' : '↻ Requeue'}
                            </Button>
                          )}
                          {!['completed'].includes(item.type) && (
                            <Button
                              size="sm"
                              onClick={() => cancel(item.details.docId || '')}
                              variant="danger"
                              disabled={isCancelling.has(item.details.docId || '')}
                            >
                              {isCancelling.has(item.details.docId || '') ? '⏳ Cancelling...' : '⏹️ Cancel'}
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