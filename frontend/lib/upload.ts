import { getAuthHeaders } from "./auth";

// File validation constants
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// File validation functions
export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Tiedostotyyppi ei ole tuettu. Sallitut tyypit: JPG, PNG, PDF'
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: 'Tiedosto on liian suuri. Maksimikoko: 10MB'
    };
  }

  return { isValid: true };
};

// Upload progress callback type
export type UploadProgressCallback = (progress: number) => void;

// Upload file to backend OCR endpoint
export const uploadFileForOCR = async (
  file: File,
  onProgress?: UploadProgressCallback
): Promise<{ success: boolean; data?: any; error?: string }> => {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_API_URL || '';

  try {
    const authHeaders = await getAuthHeaders();

    const formData = new FormData();
    formData.append('file', file);
    formData.append('tenant_id', 'default'); // TODO: Get from auth context
    formData.append('device_hint', 'document'); // Generic document hint

    const xhr = new XMLHttpRequest();
    
    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve({ success: true, data: response });
          } catch (error) {
            resolve({ success: false, error: 'Virhe vastauksen käsittelyssä' });
          }
        } else {
          resolve({ success: false, error: `HTTP ${xhr.status}: ${xhr.statusText}` });
        }
      });

      xhr.addEventListener('error', () => {
        resolve({ success: false, error: 'Verkkovirhe' });
      });

      const url = API_BASE
        ? `${API_BASE.replace(/\/$/, '')}/api/v1/documents/process`
        : '/api/v1/documents/process';

      xhr.open('POST', url);

      Object.entries(authHeaders).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });

      xhr.send(formData);
    });
  } catch (error) {
    return { success: false, error: 'Odottamaton virhe' };
  }
};

// Helper to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper to get file icon based on type
export const getFileIcon = (fileType: string): string => {
  if (fileType.startsWith('image/')) return '🖼️';
  if (fileType === 'application/pdf') return '📄';
  return '📎';
};
