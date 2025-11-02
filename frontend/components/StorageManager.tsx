/**
 * Advanced Storage Manager Component
 * Phase 2: Storage & AI Implementation
 * File upload, processing, and collaboration interface
 */

'use client';

import { useState, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface FileMetadata {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  processed: boolean;
  created_at: string;
}

interface ProcessingResult {
  processing_type: string;
  result: any;
  processing_time: number;
  created_at: string;
}

export default function StorageManager() {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploading, setUploading] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [results, setResults] = useState<ProcessingResult[]>([]);
  const [collaborations, setCollaborations] = useState<any[]>([]);

  const supabase = createClientComponentClient();

  // File upload with AI processing
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', 'current-user-id'); // Get from auth
      formData.append('fileType', getFileType(file));

      // Upload with progress tracking
      const response = await fetch('/api/storage/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setFiles(prev => [data.data.metadata, ...prev]);
        setUploadProgress(100);

        // Trigger AI processing
        await processFile(data.data.metadata.id, 'analysis');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, []);

  // Process file with AI
  const processFile = async (fileId: string, processingType: string) => {
    setProcessing(true);
    try {
      const response = await fetch('/api/processing/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId,
          processingType
        })
      });

      const data = await response.json();
      if (data.success) {
        // Update file status
        setFiles(prev => prev.map(file =>
          file.id === fileId
            ? { ...file, processed: false }
            : file
        ));
      }
    } catch (error) {
      console.error('Processing failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  // Create collaboration session
  const createCollaboration = async (documentId: string) => {
    try {
      const response = await fetch('/api/storage/collaboration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_session',
          documentId,
          sessionName: `Collaboration - ${Date.now()}`,
          userId: 'current-user-id'
        })
      });

      const data = await response.json();
      if (data.success) {
        setCollaborations(prev => [...prev, data.data]);
      }
    } catch (error) {
      console.error('Collaboration creation failed:', error);
    }
  };

  // Real-time subscription for processing updates
  const subscribeToUpdates = useCallback(() => {
    const channel = supabase
      .channel('processing-updates')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'ai_processing_queue'
      }, (payload) => {
        // Handle real-time processing updates
        console.log('Processing update:', payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <div className="storage-manager">
      <h2>📁 Advanced File Storage & AI Processing</h2>

      {/* Upload Section */}
      <div className="upload-section">
        <h3>📤 Upload Documents</h3>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          onChange={handleFileUpload}
          disabled={uploading}
          className="file-input"
        />
        {uploading && (
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* Files Grid */}
      <div className="files-grid">
        <h3>📋 Your Files</h3>
        <div className="grid">
          {files.map((file) => (
            <div key={file.id} className="file-card">
              <h4>{file.file_name}</h4>
              <p>Size: {formatFileSize(file.file_size)}</p>
              <p>Type: {file.mime_type}</p>

              <div className="file-actions">
                <button
                  onClick={() => setSelectedFile(file.id)}
                  className="btn-secondary"
                >
                  View Details
                </button>

                <button
                  onClick={() => processFile(file.id, 'ocr')}
                  disabled={processing}
                  className="btn-primary"
                >
                  🔍 Extract Text
                </button>

                <button
                  onClick={() => processFile(file.id, 'analysis')}
                  disabled={processing}
                  className="btn-primary"
                >
                  🤖 AI Analysis
                </button>

                <button
                  onClick={() => createCollaboration(file.id)}
                  className="btn-secondary"
                >
                  👥 Collaborate
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Processing Results */}
      {results.length > 0 && (
        <div className="results-section">
          <h3>🧠 AI Processing Results</h3>
          {results.map((result, index) => (
            <div key={index} className="result-card">
              <h4>{result.processing_type.toUpperCase()}</h4>
              <pre>{JSON.stringify(result.result, null, 2)}</pre>
              <small>Processing time: {result.processing_time}ms</small>
            </div>
          ))}
        </div>
      )}

      {/* Collaboration Sessions */}
      {collaborations.length > 0 && (
        <div className="collaboration-section">
          <h3>🤝 Active Collaborations</h3>
          {collaborations.map((session) => (
            <div key={session.id} className="session-card">
              <h4>{session.session_name}</h4>
              <p>Participants: {session.participants?.length || 1}</p>
              <p>Status: {session.is_active ? '🟢 Active' : '🔴 Inactive'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper functions
function getFileType(file: File): string {
  const mime = file.type;
  if (mime.includes('pdf')) return 'pdf';
  if (mime.includes('image')) return 'image';
  if (mime.includes('document')) return 'document';
  return 'other';
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
