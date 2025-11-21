'use client'

import { useState, useMemo } from 'react'
import { useDocuments, useDocumentsMutation, useDocumentsRealtime, useDeleteDocument } from '@/hooks/useDocuments'
import type { Document as APIDocument } from '@/lib/api-client'
import { LoadingState } from './LoadingState'
import { ErrorState } from './ErrorState'
import { EmptyState } from './EmptyState'

interface Document {
  id: string
  filename: string
  customer: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  uploadDate: string
  priority: 'low' | 'medium' | 'high'
  size: string
  type: 'invoice' | 'receipt' | 'contract' | 'other'
  errorMessage?: string
}

// Map API document to component document
function mapAPIDocumentToComponent(doc: APIDocument): Document {
  return {
    id: doc.id,
    filename: doc.filename,
    customer: doc.customer_name || doc.customer_id || 'Unknown',
    status: doc.status,
    uploadDate: doc.upload_date || doc.created_at,
    priority: doc.priority || 'medium',
    size: doc.size || 'Unknown',
    type: doc.type || 'other',
    errorMessage: doc.error_message
  }
}

export default function DocumentQueueManager() {
  const [selectedDocs, setSelectedDocs] = useState<string[]>([])
  const [filterStatus, setFilterStatus] = useState<'pending' | 'processing' | 'completed' | 'error' | 'all'>('all')
  const [sortBy, setSortBy] = useState<'uploadDate' | 'priority' | 'customer'>('uploadDate')

  // Fetch documents with filters
  const filters = filterStatus !== 'all' ? { status: filterStatus } : undefined
  const { data: apiDocuments, isLoading, error } = useDocuments(filters)
  const updateDocument = useDocumentsMutation()
  const deleteDocument = useDeleteDocument()

  // Enable real-time updates
  useDocumentsRealtime()

  // Map API documents to component format
  const documents = useMemo(() => {
    return (apiDocuments || []).map(mapAPIDocumentToComponent)
  }, [apiDocuments])

  const filteredDocuments = documents
    .filter(doc => filterStatus === 'all' || doc.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      if (sortBy === 'customer') {
        return a.customer.localeCompare(b.customer)
      }
      return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
    })

  const handleSelectDoc = (docId: string) => {
    setSelectedDocs(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    )
  }

  const handleSelectAll = () => {
    if (selectedDocs.length === filteredDocuments.length) {
      setSelectedDocs([])
    } else {
      setSelectedDocs(filteredDocuments.map(doc => doc.id))
    }
  }

  const handleBulkAction = async (action: 'requeue' | 'delete' | 'priority_high' | 'priority_low') => {
    if (selectedDocs.length === 0) return

    try {
      for (const docId of selectedDocs) {
        switch (action) {
          case 'requeue':
            await updateDocument.mutateAsync({
              id: docId,
              updates: { status: 'pending', error_message: null }
            })
            break
          case 'delete':
            await deleteDocument.mutateAsync(docId)
            break
          case 'priority_high':
            await updateDocument.mutateAsync({
              id: docId,
              updates: { priority: 'high' }
            })
            break
          case 'priority_low':
            await updateDocument.mutateAsync({
              id: docId,
              updates: { priority: 'low' }
            })
            break
        }
      }
      setSelectedDocs([])
    } catch (error) {
      console.error('Error performing bulk action:', error)
    }
  }

  const handleReprocess = async (docId: string) => {
    try {
      await updateDocument.mutateAsync({
        id: docId,
        updates: { status: 'pending' }
      })
    } catch (error) {
      console.error('Error reprocessing document:', error)
    }
  }

  const getStatusBadge = (status: Document['status']) => {
    const styles = {
      pending: 'badge-warning',
      processing: 'badge-secondary',
      completed: 'badge-success',
      error: 'badge-destructive'
    }
    return <span className={`badge ${styles[status]}`}>{status}</span>
  }

  const getPriorityBadge = (priority: Document['priority']) => {
    const styles = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    }
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${styles[priority]}`}>
        {priority}
      </span>
    )
  }

  const getTypeIcon = (type: Document['type']) => {
    const icons = {
      invoice: '📋',
      receipt: '🧾',
      contract: '📄',
      other: '📎'
    }
    return icons[type]
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingState message="Loading documents..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState 
          message="Failed to load documents" 
          error={error instanceof Error ? error : new Error('Unknown error')}
        />
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="p-6">
        <EmptyState message="No documents found" />
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div>
            <h3 className="text-lg font-medium">Document Queue</h3>
            <p className="text-sm text-gray-500">
              {filteredDocuments.length} documents • {selectedDocs.length} selected
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            className="input text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="error">Error</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="input text-sm"
          >
            <option value="uploadDate">Sort by Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="customer">Sort by Customer</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedDocs.length > 0 && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedDocs.length} document(s) selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction('requeue')}
                className="btn btn-outline text-xs"
              >
                Requeue
              </button>
              <button
                onClick={() => handleBulkAction('priority_high')}
                className="btn btn-outline text-xs"
              >
                Set High Priority
              </button>
              <button
                onClick={() => handleBulkAction('priority_low')}
                className="btn btn-outline text-xs"
              >
                Set Low Priority
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="btn btn-destructive text-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Table */}
      <div className="overflow-x-auto">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-cell w-12">
                <input
                  type="checkbox"
                  checked={selectedDocs.length === filteredDocuments.length && filteredDocuments.length > 0}
                  onChange={handleSelectAll}
                  className="rounded"
                />
              </th>
              <th className="table-cell">Document</th>
              <th className="table-cell">Customer</th>
              <th className="table-cell">Status</th>
              <th className="table-cell">Priority</th>
              <th className="table-cell">Size</th>
              <th className="table-cell">Upload Date</th>
              <th className="table-cell">Actions</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {filteredDocuments.map((doc) => (
              <tr key={doc.id} className="table-row">
                <td className="table-cell">
                  <input
                    type="checkbox"
                    checked={selectedDocs.includes(doc.id)}
                    onChange={() => handleSelectDoc(doc.id)}
                    className="rounded"
                  />
                </td>
                <td className="table-cell">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getTypeIcon(doc.type)}</span>
                    <div>
                      <div className="font-medium">{doc.filename}</div>
                      <div className="text-sm text-gray-500">{doc.type}</div>
                    </div>
                  </div>
                </td>
                <td className="table-cell">{doc.customer}</td>
                <td className="table-cell">
                  {getStatusBadge(doc.status)}
                  {doc.errorMessage && (
                    <div className="text-xs text-red-600 mt-1">
                      {doc.errorMessage}
                    </div>
                  )}
                </td>
                <td className="table-cell">
                  {getPriorityBadge(doc.priority)}
                </td>
                <td className="table-cell text-sm text-gray-600">{doc.size}</td>
                <td className="table-cell text-sm text-gray-600">
                  {new Date(doc.uploadDate).toLocaleDateString('fi-FI')}
                </td>
                <td className="table-cell">
                  <div className="flex space-x-1">
                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                      View
                    </button>
                    <button 
                      onClick={() => handleReprocess(doc.id)}
                      className="text-green-600 hover:text-green-800 text-sm"
                      disabled={updateDocument.isPending}
                    >
                      {updateDocument.isPending ? 'Processing...' : 'Process'}
                    </button>
                    {doc.status === 'error' && (
                      <button 
                        onClick={() => handleReprocess(doc.id)}
                        className="text-orange-600 hover:text-orange-800 text-sm"
                        disabled={updateDocument.isPending}
                      >
                        Retry
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Queue Statistics */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="metric-card">
          <div className="metric-value">{documents.filter(d => d.status === 'pending').length}</div>
          <div className="metric-label">Pending</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{documents.filter(d => d.status === 'processing').length}</div>
          <div className="metric-label">Processing</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{documents.filter(d => d.status === 'completed').length}</div>
          <div className="metric-label">Completed Today</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{documents.filter(d => d.status === 'error').length}</div>
          <div className="metric-label">Errors</div>
        </div>
      </div>
    </div>
  )
}