'use client';

/**
 * Camera Page - Receipt Scanning Flow
 * 
 * Flow:
 * 1. User opens camera
 * 2. Captures receipt photo
 * 3. Instant AI processing (OCR + VAT)
 * 4. Auto-approve or manual review
 * 5. Save to database
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CameraCapture } from '@/components/camera/CameraCapture';
import { ProcessingAnimation } from '@/components/camera/ProcessingAnimation';
import { ReceiptReview } from '@/components/receipts/ReceiptReview';
import { useAI } from '@/hooks/useAI';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';

export default function CameraPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { language } = useLanguage();
  const { processReceipt, saveReceipt, loading } = useAI();
  
  const [step, setStep] = useState<'camera' | 'processing' | 'review'>('camera');
  const [receiptData, setReceiptData] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState<string>('');

  const handleCapture = async (imageBlob: Blob, capturedImageUrl: string) => {
    setImageUrl(capturedImageUrl);
    setStep('processing');

    try {
      // Convert blob to base64
      const base64 = await blobToBase64(imageBlob);

      // Process with AI
      const result = await processReceipt(base64, {
        user_id: user?.id,
        language
      });

      setReceiptData(result);
      setStep('review');

      // Auto-approve if confidence high enough
      if (result.confidence >= result.auto_approve_threshold) {
        // Start 3-second countdown
        setTimeout(async () => {
          await handleApprove(result);
        }, 3000);
      }

    } catch (error) {
      console.error('Processing error:', error);
      // Show error and allow retake
      setStep('camera');
    }
  };

  const handleApprove = async (data: any) => {
    try {
      await saveReceipt({
        ...data,
        image_url: imageUrl,
        user_id: user?.id,
        approved_at: new Date().toISOString()
      });

      // Redirect to dashboard
      router.push('/dashboard?success=true');
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const handleCorrect = async (corrections: any) => {
    try {
      // Learn from corrections
      await fetch('/api/learning/correction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receipt_id: receiptData.id,
          corrections,
          original_data: receiptData
        })
      });

      // Save corrected receipt
      await handleApprove({ ...receiptData, ...corrections });
    } catch (error) {
      console.error('Correction error:', error);
    }
  };

  const handleCancel = () => {
    // Clean up and go back
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    router.back();
  };

  return (
    <div className="min-h-screen bg-black">
      {step === 'camera' && (
        <CameraCapture
          onCapture={handleCapture}
          onCancel={handleCancel}
          language={language}
        />
      )}

      {step === 'processing' && (
        <ProcessingAnimation language={language} />
      )}

      {step === 'review' && receiptData && (
        <ReceiptReview
          data={receiptData}
          imageUrl={imageUrl}
          onApprove={() => handleApprove(receiptData)}
          onCorrect={handleCorrect}
          onCancel={() => setStep('camera')}
          language={language}
        />
      )}
    </div>
  );
}

// Helper: Convert Blob to Base64
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

