/**
 * useAI Hook - AI Processing Integration
 * 
 * Handles:
 * - Receipt OCR processing
 * - User pattern predictions
 * - Learning from corrections
 * - Saving receipts
 */

import { useState } from 'react';
import { useAuth } from './useAuth';

interface ProcessReceiptOptions {
  user_id?: string;
  language?: string;
}

interface AIResult {
  id: string;
  vendor_name: string;
  business_id?: string;
  date: string;
  total_amount: number;
  vat_rate: number;
  vat_amount: number;
  net_amount: number;
  category: string;
  confidence: number;
  auto_approve_threshold: number;
  is_known_vendor: boolean;
  pattern_matches?: number;
  explanation: string;
  predicted_category?: string;
  confidence_boost?: number;
}

export function useAI() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Process receipt image with AI
   */
  const processReceipt = async (
    imageBase64: string,
    options: ProcessReceiptOptions = {}
  ): Promise<AIResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/process-receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_base64: imageBase64,
          user_id: options.user_id || user?.id,
          language: options.language || 'fi'
        })
      });

      if (!response.ok) {
        throw new Error(`Processing failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data;

    } catch (err: any) {
      const errorMessage = err.message || 'Receipt processing failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Save processed receipt to database
   */
  const saveReceipt = async (receiptData: any): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/receipts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...receiptData,
          user_id: user?.id
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to save receipt: ${response.statusText}`);
      }

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save receipt';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Learn from user corrections
   */
  const learnFromCorrection = async (
    receiptId: string,
    corrections: any,
    originalData: any
  ): Promise<void> => {
    try {
      await fetch('/api/learning/correction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receipt_id: receiptId,
          user_id: user?.id,
          corrections,
          original_data: originalData
        })
      });
    } catch (err) {
      console.error('Failed to record learning:', err);
      // Non-critical - don't throw
    }
  };

  /**
   * Get user's learning analytics
   */
  const getLearningAnalytics = async () => {
    try {
      const response = await fetch(`/api/learning/analytics?user_id=${user?.id}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.error('Failed to get analytics:', err);
    }
    return null;
  };

  return {
    processReceipt,
    saveReceipt,
    learnFromCorrection,
    getLearningAnalytics,
    loading,
    error
  };
}

