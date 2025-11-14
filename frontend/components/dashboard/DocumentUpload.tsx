'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, X, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { uploadDocument, pollDocumentStatus, type Document } from '@/lib/api/documents';
import VATAnalysisCard from '../documents/VATAnalysisCard';

interface UploadedFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  document?: Document;
  vatAnalysis?: any;
  error?: string;
}

interface DocumentUploadProps {
  onUploadComplete?: (result: any) => void;
  onUploadError?: (error: string) => void;
  className?: string;
}

export default function DocumentUpload({ 
  onUploadComplete, 
  onUploadError, 
  className = '' 
}: DocumentUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateFileId = () => Math.random().toString(36).substring(2, 15);

  const uploadFile = useCallback(async (uploadedFile: UploadedFile) => {
    setFiles(prev => prev.map(f => 
      f.id === uploadedFile.id 
        ? { ...f, status: 'uploading', progress: 50 }
        : f
    ));

    try {
      // Upload file
      const uploadResult = await uploadDocument(uploadedFile.file);
      
      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id 
          ? { ...f, status: 'processing', progress: 75 }
          : f
      ));
      
      // Poll for processing completion
      const statusResult = await pollDocumentStatus(
        uploadResult.document.id,
        (status) => {
          // Update progress during processing
          setFiles(prev => prev.map(f => 
            f.id === uploadedFile.id 
              ? { ...f, progress: status.is_completed ? 100 : 85 }
              : f
          ));
        }
      );
      
      if (statusResult.is_completed) {
        // Get full document with VAT analysis
        const response = await fetch(`/api/documents/${uploadResult.document.id}`);
        const data = await response.json();
        
        setFiles(prev => prev.map(f => 
          f.id === uploadedFile.id 
            ? { 
                ...f, 
                status: 'completed', 
                progress: 100, 
                document: data.document,
                vatAnalysis: data.vat_analysis 
              }
            : f
        ));
        
        onUploadComplete?.(data.document);
      } else {
        throw new Error('Processing failed');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Odottamaton virhe';
      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id 
          ? { ...f, status: 'error', error: errorMessage }
          : f
      ));
      onUploadError?.(errorMessage);
    }
  }, [onUploadComplete, onUploadError]);

  const addFile = useCallback((file: File) => {
    // Validate file
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    
    if (file.size > MAX_SIZE) {
      onUploadError?.('Tiedosto on liian suuri (max 10MB)');
      return;
    }
    
    if (!ALLOWED_TYPES.includes(file.type)) {
      onUploadError?.('Virheellinen tiedostotyyppi. Sallitut: JPG, PNG, PDF');
      return;
    }

    const uploadedFile: UploadedFile = {
      file,
      id: generateFileId(),
      status: 'pending',
      progress: 0,
    };

    setFiles(prev => [...prev, uploadedFile]);
    
    // Start upload immediately
    uploadFile(uploadedFile);
  }, [onUploadError, uploadFile]);

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    droppedFiles.forEach(addFile);
  }, [addFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    selectedFiles.forEach(addFile);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [addFile]);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'uploading':
      case 'processing':
        return (
          <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        );
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type: string): string => {
    if (type.startsWith('image/')) return '🖼️';
    if (type === 'application/pdf') return '📄';
    return '📎';
  };

  const getStatusText = (file: UploadedFile) => {
    switch (file.status) {
      case 'pending':
        return 'Odottaa...';
      case 'uploading':
        return `Ladataan... ${Math.round(file.progress)}%`;
      case 'processing':
        return 'Käsitellään...';
      case 'completed':
        return 'Valmis';
      case 'error':
        return file.error || 'Virhe';
      default:
        return '';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-900">
            Pudota tiedostot tähän tai
          </p>
          <button
            onClick={openFileDialog}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Valitse tiedostot
          </button>
        </div>
        
        <p className="mt-2 text-sm text-gray-500">
          Tuetut tiedostotyypit: JPG, PNG, PDF (max 10MB)
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900">Ladatut tiedostot</h3>
          
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
            >
              <div className="flex items-center space-x-3 flex-1">
                <div className="text-2xl">
                  {getFileIcon(file.file.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.file.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(file.file.size)} • {getStatusText(file)}
                  </p>
                  
                  {/* Progress Bar */}
                  {(file.status === 'uploading' || file.status === 'processing') && (
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                  )}
                  
                  {/* Error Message */}
                  {file.status === 'error' && file.error && (
                    <p className="mt-1 text-sm text-red-600">
                      {file.error}
                    </p>
                  )}

                  {/* VAT Analysis */}
                  {file.status === 'completed' && file.vatAnalysis && (
                    <div className="mt-3">
                      <VATAnalysisCard analysis={file.vatAnalysis} />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {getStatusIcon(file.status)}
                
                <button
                  onClick={() => removeFile(file.id)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="Poista tiedosto"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
