'use client'

import { useState, useEffect } from 'react'

interface OCRError {
  id: string
  documentId: string
  filename: string
  customer: string
  errorType: 'low_quality' | 'unclear_text' | 'complex_layout' | 'corrupted_file' | 'unsupported_format'
  errorMessage: string
  confidence: number
  uploadDate: string
  retryCount: number
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'new' | 'in_progress' | 'resolved' | 'ignored'
  assignedTo?: string
  notes?: string
}

const mockOCRErrors: OCRError[] = [
  {
    id: 'error_001',
    documentId: 'doc_789',
    filename: 'invoice_acme_corp_2025.pdf',
    customer: 'Acme Corporation',
    errorType: 'low_quality',
    errorMessage: 'Image quality too low for accurate OCR processing',
    confidence: 23,
    uploadDate: '2025-11-11T08:45:00Z',
    retryCount: 2,
    priority: 'high',
    status: 'new',
    assignedTo: 'admin',
  },
  {
    id: 'error_002',
    documentId: 'doc_456',
    filename: 'receipt_techsolutions_789.pdf',
    customer: 'Tech Solutions Oy',
    errorType: 'complex_layout',
    errorMessage: 'Multiple columns detected, manual review required',
    confidence: 45,
    uploadDate: '2025-11-11T07:30:00Z',
    retryCount: 1,
    priority: 'medium',
    status: 'in_progress',
    assignedTo: 'admin',
    notes: 'Complex invoice layout with multiple vendors'
  },
  {
    id: 'error_003',
    documentId: 'doc_123',
    filename: 'contract_globex_2025.pdf',
    customer: 'Globex Corporation',
    errorType: 'corrupted_file',
    errorMessage: 'File appears to be corrupted or incomplete',
    confidence: 0,
    uploadDate: '2025-11-11T06:15:00Z',
    retryCount: 3,
    priority: 'critical',
    status: 'new'
  },
  {
    id: 'error_004',
    documentId: 'doc_654',
    filename: 'receipt_globex_office.pdf',
    customer: 'Globex Corporation',
    errorType: 'unclear_text',
    errorMessage: 'Text too small or unclear for reliable OCR',
    confidence: 34,
    uploadDate: '2025-11-11T05:45:00Z',
    retryCount: 1,
    priority: 'medium',
    status: 'resolved',
    assignedTo: 'admin',
    notes: 'Manually processed - receipt details confirmed'
  }
]

export default function OCRErrorTriage() {
  const [errors, setErrors] = useState<OCRError[]>(mockOCRErrors)
  const [selectedErrors, setSelectedErrors] = useState<string[]>([])
  const [filterStatus, setFilterStatus] = useState<OCRError['status'] | 'all'>('all')
  const [filterPriority, setFilterPriority] = useState<OCRError['priority'] | 'all'>('all')
  const [showNotes, setShowNotes] = useState<string | null>(null)

  const filteredErrors = errors
    .filter(error => filterStatus === 'all' || error.status === filterStatus)
    .filter(error => filterPriority === 'all' || error.priority === filterPriority)
    .sort((a, b) => {
      // Sort by priority (critical > high > medium > low), then by retry count
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      return b.retryCount - a.retryCount
    })

  const handleSelectError = (errorId: string) => {
    setSelectedErrors(prev => 
      prev.includes(errorId) 
        ? prev.filter(id => id !== errorId)
        : [...prev, errorId]
    )
  }

  const handleBulkAction = (action: 'retry' | 'resolve' | 'ignore' | 'assign') => {
    if (selectedErrors.length === 0) return

    setErrors(prev => prev.map(error => {
      if (selectedErrors.includes(error.id)) {
        switch (action) {
          case 'retry':
            return { 
              ...error, 
              retryCount: error.retryCount + 1, 
              status: 'in_progress' as const,
              errorMessage: `Retry attempt ${error.retryCount + 1}`
            }
          case 'resolve':
            return { ...error, status: 'resolved' as const, assignedTo: 'admin' }
          case 'ignore':
            return { ...error, status: 'ignored' as const }
          case 'assign':
            return { ...error, status: 'in_progress' as const, assignedTo: 'admin' }
          default:
            return error
        }
      }
      return error
    }))
    setSelectedErrors([])
  }

  const getPriorityBadge = (priority: OCRError['priority']) => {
    const styles = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    }
    return (
      <span className={`px-2 py-1 text-xs rounded-full border ${styles[priority]}`}>
        {priority}
      </span>
    )
  }

  const getStatusBadge = (status: OCRError['status']) => {
    const styles = {
      new: 'badge-warning',
      in_progress: 'badge-secondary',
      resolved: 'badge-success',
      ignored: 'badge-destructive'
    }
    return <span className={`badge ${styles[status]}`}>{status}</span>
  }

  const getErrorTypeIcon = (type: OCRError['errorType']) => {
    const icons = {
      low_quality: '📷',
      unclear_text: '👁️',
      complex_layout: '📊',
      corrupted_file: '💥',
      unsupported_format: '📁'
    }
    return icons[type]
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600'
    if (confidence >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
        <div>
          <h3 className="text-lg font-medium">OCR Error Triage</h3>
          <p className="text-sm text-gray-500">
            {filteredErrors.length} errors • {selectedErrors.length} selected
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as OCRError['status'] | 'all')}
            className="input text-sm"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="ignored">Ignored</option>
          </select>
          
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as OCRError['priority'] | 'all')}
            className="input text-sm"
          >
            <option value="all">All Priority</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedErrors.length > 0 && (
        <div className="mb-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedErrors.length} error(s) selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction('assign')}
                className="btn btn-outline text-xs"
              >
                Assign to Me
              </button>
              <button
                onClick={() => handleBulkAction('retry')}
                className="btn btn-outline text-xs"
              >
                Retry OCR
              </button>
              <button
                onClick={() => handleBulkAction('resolve')}
                className="btn btn-primary text-xs"
              >
                Mark Resolved
              </button>
              <button
                onClick={() => handleBulkAction('ignore')}
                className="btn btn-destructive text-xs"
              >
                Ignore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error List */}
      <div className="space-y-3">
        {filteredErrors.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No OCR errors to display
          </div>
        ) : (
          filteredErrors.map((error) => (
            <div
              key={error.id}
              className={`border rounded-lg p-4 transition-colors ${
                error.priority === 'critical' ? 'border-red-200 bg-red-50' :
                error.priority === 'high' ? 'border-orange-200 bg-orange-50' :
                'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start space-x-4">
                <input
                  type="checkbox"
                  checked={selectedErrors.includes(error.id)}
                  onChange={() => handleSelectError(error.id)}
                  className="mt-1"
                />
                
                <div className="text-2xl">{getErrorTypeIcon(error.errorType)}</div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-gray-900">{error.filename}</h4>
                    {getPriorityBadge(error.priority)}
                    {getStatusBadge(error.status)}
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">{error.customer}</span> • 
                    Document ID: {error.documentId} • 
                    Uploaded: {new Date(error.uploadDate).toLocaleDateString('fi-FI')}
                  </div>
                  
                  <div className="text-sm text-red-600 mb-2">
                    {error.errorMessage}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Confidence: <span className={getConfidenceColor(error.confidence)}>{error.confidence}%</span></span>
                    <span>Retries: {error.retryCount}</span>
                    {error.assignedTo && <span>Assigned to: {error.assignedTo}</span>}
                  </div>
                  
                  {error.notes && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                      <div className="font-medium text-gray-700">Notes:</div>
                      <div className="text-gray-600">{error.notes}</div>
                    </div>
                  )}
                  
                  {error.status === 'new' && (
                    <div className="mt-3 flex space-x-2">
                      <button
                        onClick={() => setShowNotes(error.id === showNotes ? null : error.id)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Add Notes
                      </button>
                      <button
                        onClick={() => handleBulkAction('assign')}
                        className="text-sm text-green-600 hover:text-green-800"
                      >
                        Assign
                      </button>
                      <button
                        onClick={() => {
                          setErrors(prev => prev.map(e => 
                            e.id === error.id ? { ...e, retryCount: e.retryCount + 1 } : e
                          ))
                        }}
                        className="text-sm text-orange-600 hover:text-orange-800"
                      >
                        Retry OCR
                      </button>
                    </div>
                  )}
                  
                  {showNotes === error.id && (
                    <div className="mt-3">
                      <textarea
                        className="w-full p-2 border rounded text-sm"
                        rows={3}
                        placeholder="Add notes for this error..."
                        onBlur={() => setShowNotes(null)}
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Error Statistics */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="metric-card">
          <div className="metric-value text-red-600">{errors.filter(e => e.status === 'new').length}</div>
          <div className="metric-label">New</div>
        </div>
        <div className="metric-card">
          <div className="metric-value text-yellow-600">{errors.filter(e => e.status === 'in_progress').length}</div>
          <div className="metric-label">In Progress</div>
        </div>
        <div className="metric-card">
          <div className="metric-value text-green-600">{errors.filter(e => e.status === 'resolved').length}</div>
          <div className="metric-label">Resolved</div>
        </div>
        <div className="metric-card">
          <div className="metric-value text-orange-600">{errors.filter(e => e.priority === 'critical' || e.priority === 'high').length}</div>
          <div className="metric-label">High Priority</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{errors.reduce((sum, e) => sum + e.retryCount, 0)}</div>
          <div className="metric-label">Total Retries</div>
        </div>
      </div>
    </div>
  )
}