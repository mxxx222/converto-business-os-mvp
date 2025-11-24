'use client';

/**
 * CameraCapture Component - Mobile-First Receipt Scanner
 * 
 * Features:
 * - Native camera access (iOS/Android)
 * - Auto-focus and flash control
 * - Real-time preview
 * - Instant upload to AI processing
 * - Offline support
 * - Guide overlay for receipt alignment
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, X, Zap, ZapOff, RotateCw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CameraCaptureProps {
  onCapture: (imageBlob: Blob, imageUrl: string) => void;
  onCancel?: () => void;
  maxSize?: number; // Max file size in bytes (default 5MB)
  quality?: number; // JPEG quality 0-1 (default 0.85)
  language?: string; // For UI translations
}

export function CameraCapture({
  onCapture,
  onCancel,
  maxSize = 5 * 1024 * 1024, // 5MB
  quality = 0.85,
  language = 'fi'
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasFlash, setHasFlash] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Translations
  const t = translations[language] || translations.fi;

  // Initialize camera
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      setError(null);
      
      // Request camera permissions
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsStreaming(true);
      }

      // Check if device has flash/torch
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as any;
      setHasFlash(capabilities.torch === true);

    } catch (err: any) {
      console.error('Camera access error:', err);
      setError(err.message || t.errorCamera);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  };

  const toggleFlash = async () => {
    if (!streamRef.current || !hasFlash) return;

    try {
      const track = streamRef.current.getVideoTracks()[0];
      await track.applyConstraints({
        // @ts-ignore - torch is not in TypeScript types yet
        advanced: [{ torch: !flashEnabled }]
      });
      setFlashEnabled(!flashEnabled);
    } catch (err) {
      console.error('Flash toggle error:', err);
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError(t.errorCapture);
          return;
        }

        // Check file size
        if (blob.size > maxSize) {
          setError(t.errorFileSize);
          return;
        }

        // Create preview URL
        const imageUrl = URL.createObjectURL(blob);
        setCapturedImage(imageUrl);

        // Stop camera
        stopCamera();

      },
      'image/jpeg',
      quality
    );
  }, [quality, maxSize, t]);

  const retake = () => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
    }
    setCapturedImage(null);
    startCamera();
  };

  const confirmCapture = () => {
    if (!capturedImage || !canvasRef.current) return;

    canvasRef.current.toBlob(
      (blob) => {
        if (blob) {
          onCapture(blob, capturedImage);
        }
      },
      'image/jpeg',
      quality
    );
  };

  const handleCancel = () => {
    stopCamera();
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
    }
    onCancel?.();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
        <h1 className="text-white text-lg font-semibold">
          {t.title}
        </h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          className="text-white hover:bg-white/20"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Camera View or Preview */}
      <div className="relative w-full h-full flex items-center justify-center">
        {!capturedImage ? (
          <>
            {/* Video Stream */}
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              autoPlay
              muted
            />

            {/* Receipt Guide Overlay */}
            {isStreaming && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-[85%] max-w-md aspect-[3/4] border-2 border-white/60 rounded-lg">
                  {/* Corner guides */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />
                  
                  {/* Guide text */}
                  <div className="absolute -bottom-12 left-0 right-0 text-center">
                    <p className="text-white text-sm bg-black/50 px-4 py-2 rounded-full inline-block">
                      {t.alignReceipt}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="absolute top-20 left-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg">
                <p className="text-sm">{error}</p>
              </div>
            )}
          </>
        ) : (
          /* Preview Captured Image */
          <img
            src={capturedImage}
            alt="Captured receipt"
            className="w-full h-full object-contain"
          />
        )}
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Bottom Controls */}
      {!capturedImage ? (
        /* Camera Controls */
        <div className="absolute bottom-0 left-0 right-0 z-10 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {/* Flash Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFlash}
              disabled={!hasFlash}
              className={cn(
                "text-white hover:bg-white/20",
                !hasFlash && "opacity-30"
              )}
            >
              {flashEnabled ? (
                <Zap className="h-6 w-6" fill="currentColor" />
              ) : (
                <ZapOff className="h-6 w-6" />
              )}
            </Button>

            {/* Capture Button */}
            <Button
              size="lg"
              onClick={capturePhoto}
              disabled={!isStreaming}
              className="w-20 h-20 rounded-full bg-white hover:bg-gray-200 shadow-2xl"
            >
              <div className="w-16 h-16 rounded-full border-4 border-black" />
            </Button>

            {/* Switch Camera */}
            <Button
              variant="ghost"
              size="icon"
              onClick={switchCamera}
              className="text-white hover:bg-white/20"
            >
              <RotateCw className="h-6 w-6" />
            </Button>
          </div>

          {/* Help Text */}
          <p className="text-white/80 text-xs text-center mt-4">
            {t.helpText}
          </p>
        </div>
      ) : (
        /* Preview Controls */
        <div className="absolute bottom-0 left-0 right-0 z-10 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
            {/* Retake */}
            <Button
              variant="outline"
              size="lg"
              onClick={retake}
              className="flex-1 bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              <RotateCw className="mr-2 h-5 w-5" />
              {t.retake}
            </Button>

            {/* Use Photo */}
            <Button
              size="lg"
              onClick={confirmCapture}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Check className="mr-2 h-5 w-5" />
              {t.usePhoto}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Translations
const translations: Record<string, any> = {
  fi: {
    title: 'Skannaa kuitti',
    alignReceipt: 'Kohdista kuitti kehykseen',
    helpText: 'Varmista että kuitti on selkeä ja hyvin valaistu',
    retake: 'Ota uusi',
    usePhoto: 'Käytä kuvaa',
    errorCamera: 'Kameraan pääsy epäonnistui. Tarkista luvat.',
    errorCapture: 'Kuvan ottaminen epäonnistui.',
    errorFileSize: 'Kuva on liian suuri. Yritä uudelleen.',
  },
  en: {
    title: 'Scan Receipt',
    alignReceipt: 'Align receipt in frame',
    helpText: 'Make sure receipt is clear and well-lit',
    retake: 'Retake',
    usePhoto: 'Use Photo',
    errorCamera: 'Failed to access camera. Check permissions.',
    errorCapture: 'Failed to capture image.',
    errorFileSize: 'Image is too large. Try again.',
  },
  ru: {
    title: 'Сканировать чек',
    alignReceipt: 'Выровняйте чек в рамке',
    helpText: 'Убедитесь, что чек чёткий и хорошо освещён',
    retake: 'Переснять',
    usePhoto: 'Использовать',
    errorCamera: 'Не удалось получить доступ к камере.',
    errorCapture: 'Не удалось сделать снимок.',
    errorFileSize: 'Изображение слишком большое.',
  },
  et: {
    title: 'Skanni kviitung',
    alignReceipt: 'Joonda kviitung raamiga',
    helpText: 'Veendu, et kviitung on selge ja hästi valgustatud',
    retake: 'Tee uuesti',
    usePhoto: 'Kasuta fotot',
    errorCamera: 'Kaamerale ligipääs ebaõnnestus.',
    errorCapture: 'Pildi tegemine ebaõnnestus.',
    errorFileSize: 'Pilt on liiga suur.',
  }
};

