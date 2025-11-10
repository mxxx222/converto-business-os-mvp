'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, X, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { validateFile, uploadFileForOCR, formatFileSize, getFileIcon, type UploadProgressCallback } from '../../lib/upload';

interface UploadedFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  result?: any;
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

  const addFile = useCallback((file: File) => {
    const validation = validateFile(file);
    if (!validation.isValid) {
      onUploadError?.(validation.error || 'Tiedosto ei ole kelvollinen');
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
  }, [onUploadError]);

  const uploadFile = async (uploadedFile: UploadedFile) => {
    setFiles(prev => prev.map(f => 
      f.id === uploadedFile.id 
        ? { ...f, status: 'uploading', progress: 0 }
        : f
    ));

    const onProgress: UploadProgressCallback = (progress) => {
      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id 
          ? { ...f, progress }
          : f
      ));
    };

    try {
      const result = await uploadFileForOCR(uploadedFile.file, onProgress);
      
      if (result.success) {
        setFiles(prev => prev.map(f => 
          f.id === uploadedFile.id 
            ? { ...f, status: 'completed', progress: 100, result: result.data }
            : f
        ));
        onUploadComplete?.(result.data);
      } else {
        setFiles(prev => prev.map(f => 
          f.id === uploadedFile.id 
            ? { ...f, status: 'error', error: result.error }
            : f
        ));
        onUploadError?.(result.error || 'Lataus epäonnistui');
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
  };

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
