'use client';

import { useState, useCallback } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import DocumentUpload from '../../components/dashboard/DocumentUpload';
import OCRResults from '../../components/dashboard/OCRResults';
import DocumentList from '../../components/dashboard/DocumentList';
import DashboardStats from '../../components/dashboard/DashboardStats';
import { DocumentOcrResult, EditableDocument } from '../../lib/ocr-validation';

interface DashboardState {
  selectedDocument: DocumentOcrResult | null;
  showUpload: boolean;
  refreshTrigger: number;
}

export default function DashboardPage() {
  const [state, setState] = useState<DashboardState>({
    selectedDocument: null,
    showUpload: false,
    refreshTrigger: 0
  });

  const handleUploadComplete = useCallback((result: any) => {
    console.log('Upload completed:', result);
    // Refresh the dashboard
    setState(prev => ({ 
      ...prev, 
      refreshTrigger: prev.refreshTrigger + 1,
      showUpload: false 
    }));
  }, []);

  const handleUploadError = useCallback((error: string) => {
    console.error('Upload error:', error);
    // TODO: Show error notification
  }, []);

  const handleDocumentSelect = useCallback((document: DocumentOcrResult) => {
    setState(prev => ({ ...prev, selectedDocument: document }));
  }, []);

  const handleDocumentUpdate = useCallback(async (updates: Partial<EditableDocument>) => {
    if (!state.selectedDocument) return;
    
    console.log('Updating document:', state.selectedDocument.id, updates);
    
    // TODO: Call API to update document
    // const response = await fetch(`/api/v1/documents/${state.selectedDocument.id}`, {
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(updates)
    // });
    
    // Simulate successful update
    setState(prev => ({
      ...prev,
      selectedDocument: prev.selectedDocument ? {
        ...prev.selectedDocument,
        ...updates,
        updated_at: new Date().toISOString()
      } : null,
      refreshTrigger: prev.refreshTrigger + 1
    }));
  }, [state.selectedDocument]);

  const handleDocumentApprove = useCallback(async () => {
    if (!state.selectedDocument) return;
    
    await handleDocumentUpdate({ status: 'approved' });
  }, [state.selectedDocument, handleDocumentUpdate]);

  const handleDocumentReject = useCallback(async () => {
    if (!state.selectedDocument) return;
    
    await handleDocumentUpdate({ status: 'rejected' });
  }, [state.selectedDocument, handleDocumentUpdate]);

  const handleDocumentDelete = useCallback(async (documentId: string) => {
    console.log('Deleting document:', documentId);
    
    // TODO: Call API to delete document
    // await fetch(`/api/v1/documents/${documentId}`, { method: 'DELETE' });
    
    // Clear selection if deleted document was selected
    if (state.selectedDocument?.id === documentId) {
      setState(prev => ({ ...prev, selectedDocument: null }));
    }
    
    // Refresh the list
    setState(prev => ({ ...prev, refreshTrigger: prev.refreshTrigger + 1 }));
  }, [state.selectedDocument]);

  const handleBulkAction = useCallback(async (action: string, documentIds: string[]) => {
    console.log('Bulk action:', action, documentIds);
    
    // TODO: Implement bulk actions
    switch (action) {
      case 'approve':
        // Bulk approve documents
        break;
      case 'reject':
        // Bulk reject documents
        break;
      case 'delete':
        // Bulk delete documents
        break;
      case 'export':
        // Export documents
        break;
    }
    
    // Refresh the list
    setState(prev => ({ ...prev, refreshTrigger: prev.refreshTrigger + 1 }));
  }, []);

  const handleRefresh = useCallback(() => {
    setState(prev => ({ ...prev, refreshTrigger: prev.refreshTrigger + 1 }));
  }, []);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Hallitse dokumenttejasi ja seuraa OCR-käsittelyn tuloksia
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <div className="flex space-x-3">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Päivitä
            </button>
            <button
              onClick={() => setState(prev => ({ ...prev, showUpload: !prev.showUpload }))}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Lataa dokumentti
            </button>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      {state.showUpload && (
        <div className="mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Lataa uusi dokumentti</h2>
              <button
                onClick={() => setState(prev => ({ ...prev, showUpload: false }))}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Sulje</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <DocumentUpload
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
            />
          </div>
        </div>
      )}

      {/* Dashboard Stats */}
      <DashboardStats 
        className="mb-8" 
        refreshTrigger={state.refreshTrigger}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Document List */}
        <div className="lg:col-span-2">
          <DocumentList
            onDocumentSelect={handleDocumentSelect}
            onDocumentDelete={handleDocumentDelete}
            onBulkAction={handleBulkAction}
          />
        </div>

        {/* Document Details */}
        <div className="lg:col-span-1">
          {state.selectedDocument ? (
            <div className="space-y-6">
              <OCRResults
                result={state.selectedDocument}
                onUpdate={handleDocumentUpdate}
                onApprove={handleDocumentApprove}
                onReject={handleDocumentReject}
                isEditable={true}
              />
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c0 .621-.504 1.125-1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Valitse dokumentti
              </h3>
              <p className="text-sm text-gray-500">
                Klikkaa dokumenttia vasemmalta nähdäksesi sen tiedot ja muokataksesi niitä.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Kuinka käyttää dashboardia
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Lataa dokumentteja klikkaamalla "Lataa dokumentti" -painiketta</li>
                <li>Seuraa käsittelyn edistymistä reaaliajassa</li>
                <li>Tarkista ja muokkaa OCR-tuloksia tarvittaessa</li>
                <li>Hyväksy tai hylkää dokumentteja käsittelyn jälkeen</li>
                <li>Käytä suodattimia löytääksesi tietyt dokumentit nopeasti</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
