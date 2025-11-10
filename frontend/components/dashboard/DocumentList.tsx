'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Search, Filter, Download, Trash2, RefreshCw, Eye, 
  ChevronLeft, ChevronRight, MoreVertical, CheckSquare, Square,
  FileText, Calendar, Building, DollarSign, AlertCircle
} from 'lucide-react';
import {
  DocumentOcrResult,
  DocumentType,
  DocumentStatus,
  formatCurrency,
  formatDate,
  getConfidenceColor,
  getConfidenceText
} from '../../lib/ocr-validation';

interface DocumentListProps {
  onDocumentSelect?: (document: DocumentOcrResult) => void;
  onDocumentUpdate?: (documentId: string, updates: any) => void;
  onDocumentDelete?: (documentId: string) => void;
  onBulkAction?: (action: string, documentIds: string[]) => void;
  className?: string;
}

interface FilterState {
  search: string;
  status: string;
  documentType: string;
  dateFrom: string;
  dateTo: string;
}

interface PaginationState {
  page: number;
  perPage: number;
  total: number;
}

// Mock data for development - replace with API calls
const mockDocuments: DocumentOcrResult[] = [
  {
    id: '1',
    tenant_id: 'default',
    file_name: 'kuitti_kauppa_2024.jpg',
    storage_path: '/documents/1.jpg',
    content_type: 'image/jpeg',
    file_size: 1024000,
    document_type: 'receipt',
    status: 'processed',
    ocr_confidence: 0.95,
    extracted_data: {},
    raw_ocr_text: 'KAUPPA OY\nKuitti\nYhteensä: 45.50€',
    vendor: 'Kauppa Oy',
    total_amount: 45.50,
    vat_amount: 8.77,
    vat_rate: 24,
    currency: 'EUR',
    document_date: '2024-11-10',
    due_date: null,
    processed_at: '2024-11-10T10:30:00Z',
    created_at: '2024-11-10T10:25:00Z',
    updated_at: '2024-11-10T10:30:00Z',
  },
  {
    id: '2',
    tenant_id: 'default',
    file_name: 'lasku_toimittaja.pdf',
    storage_path: '/documents/2.pdf',
    content_type: 'application/pdf',
    file_size: 2048000,
    document_type: 'invoice',
    status: 'pending',
    ocr_confidence: 0.78,
    extracted_data: {},
    raw_ocr_text: 'TOIMITTAJA AB\nLasku 12345\nSumma: 1250.00€',
    vendor: 'Toimittaja AB',
    total_amount: 1250.00,
    vat_amount: 240.32,
    vat_rate: 24,
    currency: 'EUR',
    document_date: '2024-11-09',
    due_date: '2024-12-09',
    processed_at: null,
    created_at: '2024-11-09T14:20:00Z',
    updated_at: '2024-11-09T14:20:00Z',
  }
];

export default function DocumentList({
  onDocumentSelect,
  onDocumentUpdate,
  onDocumentDelete,
  onBulkAction,
  className = ''
}: DocumentListProps) {
  const [documents, setDocuments] = useState<DocumentOcrResult[]>(mockDocuments);
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentOcrResult[]>(mockDocuments);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    documentType: '',
    dateFrom: '',
    dateTo: ''
  });
  
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    perPage: 10,
    total: mockDocuments.length
  });

  // Filter documents based on current filters
  const applyFilters = useCallback(() => {
    let filtered = [...documents];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.file_name.toLowerCase().includes(searchTerm) ||
        doc.vendor?.toLowerCase().includes(searchTerm) ||
        doc.raw_ocr_text?.toLowerCase().includes(searchTerm)
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(doc => doc.status === filters.status);
    }

    // Document type filter
    if (filters.documentType) {
      filtered = filtered.filter(doc => doc.document_type === filters.documentType);
    }

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(doc => 
        doc.document_date && doc.document_date >= filters.dateFrom
      );
    }
    
    if (filters.dateTo) {
      filtered = filtered.filter(doc => 
        doc.document_date && doc.document_date <= filters.dateTo
      );
    }

    setFilteredDocuments(filtered);
    setPagination(prev => ({ ...prev, total: filtered.length, page: 1 }));
  }, [documents, filters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Pagination
  const paginatedDocuments = filteredDocuments.slice(
    (pagination.page - 1) * pagination.perPage,
    pagination.page * pagination.perPage
  );

  const totalPages = Math.ceil(pagination.total / pagination.perPage);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      documentType: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  const handleSelectDocument = (documentId: string) => {
    setSelectedDocuments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(documentId)) {
        newSet.delete(documentId);
      } else {
        newSet.add(documentId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedDocuments.size === paginatedDocuments.length) {
      setSelectedDocuments(new Set());
    } else {
      setSelectedDocuments(new Set(paginatedDocuments.map(doc => doc.id)));
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedDocuments.size === 0) return;
    
    onBulkAction?.(action, Array.from(selectedDocuments));
    setSelectedDocuments(new Set());
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Odottaa' },
      processing: { color: 'bg-blue-100 text-blue-800', text: 'Käsitellään' },
      processed: { color: 'bg-green-100 text-green-800', text: 'Käsitelty' },
      error: { color: 'bg-red-100 text-red-800', text: 'Virhe' },
      approved: { color: 'bg-green-100 text-green-800', text: 'Hyväksytty' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Hylätty' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'receipt':
        return '🧾';
      case 'invoice':
        return '📄';
      case 'contract':
        return '📋';
      default:
        return '📎';
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Dokumentit</h3>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                showFilters ? 'bg-gray-50' : ''
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Suodattimet
            </button>
            
            <button
              onClick={() => setIsLoading(true)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Päivitä
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Hae dokumentteja..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tila
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Kaikki tilat</option>
                  <option value="pending">Odottaa</option>
                  <option value="processing">Käsitellään</option>
                  <option value="processed">Käsitelty</option>
                  <option value="approved">Hyväksytty</option>
                  <option value="rejected">Hylätty</option>
                  <option value="error">Virhe</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tyyppi
                </label>
                <select
                  value={filters.documentType}
                  onChange={(e) => handleFilterChange('documentType', e.target.value)}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Kaikki tyypit</option>
                  <option value="receipt">Kuitit</option>
                  <option value="invoice">Laskut</option>
                  <option value="contract">Sopimukset</option>
                  <option value="unknown">Tuntematon</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alkaen
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Päättyen
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Tyhjennä suodattimet
              </button>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedDocuments.size > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800">
                {selectedDocuments.size} dokumenttia valittu
              </span>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkAction('approve')}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200"
                >
                  Hyväksy
                </button>
                <button
                  onClick={() => handleBulkAction('reject')}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
                >
                  Hylkää
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Poista
                </button>
                <button
                  onClick={() => handleBulkAction('export')}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Vie
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={handleSelectAll}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {selectedDocuments.size === paginatedDocuments.length && paginatedDocuments.length > 0 ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dokumentti
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Myyjä
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Summa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Päivämäärä
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tila
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Luotettavuus
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Toiminnot</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedDocuments.map((document) => (
              <tr
                key={document.id}
                className={`hover:bg-gray-50 ${selectedDocuments.has(document.id) ? 'bg-blue-50' : ''}`}
              >
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleSelectDocument(document.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {selectedDocuments.has(document.id) ? (
                      <CheckSquare className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <span className="text-lg mr-3">
                      {getDocumentTypeIcon(document.document_type)}
                    </span>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {document.file_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {document.document_type}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {document.vendor || '-'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(document.total_amount, document.currency)}
                  </div>
                  {document.vat_amount && (
                    <div className="text-xs text-gray-500">
                      ALV: {formatCurrency(document.vat_amount, document.currency)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {formatDate(document.document_date)}
                  </div>
                  {document.due_date && (
                    <div className="text-xs text-gray-500">
                      Eräpäivä: {formatDate(document.due_date)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(document.status)}
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(document.ocr_confidence)}`}>
                    {document.ocr_confidence ? `${Math.round(document.ocr_confidence * 100)}%` : '-'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onDocumentSelect?.(document)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Näytä tiedot"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDocumentDelete?.(document.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Poista"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Ei dokumentteja</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filters.search || filters.status || filters.documentType
              ? 'Hakuehdoilla ei löytynyt dokumentteja.'
              : 'Lataa ensimmäinen dokumentti aloittaaksesi.'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Näytetään {(pagination.page - 1) * pagination.perPage + 1}-{Math.min(pagination.page * pagination.perPage, pagination.total)} / {pagination.total} dokumenttia
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <span className="text-sm text-gray-700">
                Sivu {pagination.page} / {totalPages}
              </span>
              
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === totalPages}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
