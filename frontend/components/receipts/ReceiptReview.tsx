'use client';

/**
 * ReceiptReview - Smart review with auto-approve
 * 
 * Features:
 * - Confidence-based auto-approve (3-second countdown)
 * - Manual review for low confidence
 * - Inline editing
 * - VAT breakdown visualization
 * - Learning from corrections
 */

import { useState, useEffect } from 'react';
import { CheckCircle2, Edit3, X, AlertCircle, TrendingUp, Building2, Calendar, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ReceiptReviewProps {
  data: {
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
  };
  imageUrl: string;
  onApprove: () => void;
  onCorrect: (corrections: any) => void;
  onCancel: () => void;
  language?: string;
}

export function ReceiptReview({
  data,
  imageUrl,
  onApprove,
  onCorrect,
  onCancel,
  language = 'fi'
}: ReceiptReviewProps) {
  const [editing, setEditing] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [autoApproving, setAutoApproving] = useState(false);
  const [formData, setFormData] = useState(data);

  const t = translations[language] || translations.fi;
  const isHighConfidence = data.confidence >= data.auto_approve_threshold;

  // Auto-approve countdown
  useEffect(() => {
    if (isHighConfidence && !editing) {
      setAutoApproving(true);
      
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            onApprove();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isHighConfidence, editing, onApprove]);

  const handleEdit = () => {
    setAutoApproving(false);
    setEditing(true);
  };

  const handleSave = () => {
    const corrections: any = {};
    
    if (formData.vendor_name !== data.vendor_name) {
      corrections.vendor_name = formData.vendor_name;
    }
    if (formData.category !== data.category) {
      corrections.category = formData.category;
    }
    if (formData.total_amount !== data.total_amount) {
      corrections.total_amount = formData.total_amount;
    }
    if (formData.vat_rate !== data.vat_rate) {
      corrections.vat_rate = formData.vat_rate;
    }

    if (Object.keys(corrections).length > 0) {
      onCorrect(corrections);
    } else {
      onApprove();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 overflow-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ConfidenceBadge 
              score={data.confidence} 
              autoApproving={autoApproving}
              countdown={countdown}
            />
            {data.is_known_vendor && (
              <Badge variant="secondary" className="gap-1">
                <TrendingUp className="w-3 h-3" />
                {t.knownVendor}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Receipt Image */}
      <div className="w-full bg-black">
        <img
          src={imageUrl}
          alt="Receipt"
          className="w-full max-h-64 object-contain"
        />
      </div>

      {/* Receipt Data */}
      <div className="p-4 max-w-2xl mx-auto space-y-4">
        {/* Auto-approve Banner */}
        {autoApproving && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {countdown}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 mb-1">
                  {t.autoApproving}
                </h3>
                <p className="text-sm text-green-700">
                  {t.autoApproveMessage}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
              >
                {t.stopAndEdit}
              </Button>
            </div>
          </div>
        )}

        {/* AI Explanation */}
        {data.explanation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">{data.explanation}</p>
          </div>
        )}

        {/* Fields */}
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          {/* Vendor */}
          <Field
            icon={<Building2 className="w-5 h-5" />}
            label={t.vendor}
            value={formData.vendor_name}
            editing={editing}
            onChange={(value) => setFormData({ ...formData, vendor_name: value })}
          />

          {/* Business ID */}
          {data.business_id && (
            <Field
              icon={<CheckCircle2 className="w-5 h-5" />}
              label={t.businessId}
              value={data.business_id}
              readonly
            />
          )}

          {/* Date */}
          <Field
            icon={<Calendar className="w-5 h-5" />}
            label={t.date}
            value={formData.date}
            editing={editing}
            onChange={(value) => setFormData({ ...formData, date: value })}
          />

          {/* Amount - Highlighted */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t.total}</p>
                <p className="text-3xl font-bold text-gray-900">
                  €{formData.total_amount.toFixed(2)}
                </p>
              </div>
              <CreditCard className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>

          {/* Category */}
          <Field
            icon={<Edit3 className="w-5 h-5" />}
            label={t.category}
            value={formData.category}
            editing={editing}
            onChange={(value) => setFormData({ ...formData, category: value })}
            type="select"
            options={[
              'office_supplies',
              'restaurant',
              'food',
              'transport',
              'services',
              'marketing',
              'other'
            ]}
          />

          {/* VAT Breakdown */}
          <VATBreakdown
            rate={formData.vat_rate}
            amount={formData.vat_amount}
            netAmount={formData.net_amount}
            editing={editing}
            onRateChange={(rate) => {
              const newVatAmount = formData.total_amount * (rate / (100 + rate));
              const newNetAmount = formData.total_amount - newVatAmount;
              setFormData({
                ...formData,
                vat_rate: rate,
                vat_amount: newVatAmount,
                net_amount: newNetAmount
              });
            }}
            language={language}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {editing ? (
            <>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setFormData(data);
                  setEditing(false);
                }}
              >
                {t.cancel}
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={handleSave}
              >
                <CheckCircle2 className="mr-2 w-5 h-5" />
                {t.save}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleEdit}
              >
                <Edit3 className="mr-2 w-4 h-4" />
                {t.edit}
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={onApprove}
              >
                <CheckCircle2 className="mr-2 w-5 h-5" />
                {t.approve}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Confidence Badge
function ConfidenceBadge({ score, autoApproving, countdown }: any) {
  const getColor = () => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 75) return 'bg-blue-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Badge className={cn('gap-1.5', getColor())}>
      <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
      <span className="font-semibold">{Math.round(score)}%</span>
      {autoApproving && <span>• {countdown}s</span>}
    </Badge>
  );
}

// Field Component
function Field({ icon, label, value, editing, readonly, onChange, type = 'text', options }: any) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-2 text-gray-400">{icon}</div>
      <div className="flex-1">
        <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">
          {label}
        </label>
        {editing && !readonly ? (
          type === 'select' ? (
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              {options.map((opt: string) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <Input
              type={type}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="mt-1"
            />
          )
        ) : (
          <p className="mt-1 text-lg font-medium text-gray-900">{value}</p>
        )}
      </div>
    </div>
  );
}

// VAT Breakdown
function VATBreakdown({ rate, amount, netAmount, editing, onRateChange, language }: any) {
  const t = translations[language] || translations.fi;
  const rates = [25.5, 14.0, 10.0, 0.0];

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">{t.vatBreakdown}</h4>
      
      {/* VAT Rate Selector */}
      {editing ? (
        <div className="grid grid-cols-4 gap-2 mb-3">
          {rates.map(r => (
            <button
              key={r}
              onClick={() => onRateChange(r)}
              className={cn(
                'py-2 rounded-md font-semibold transition-all',
                rate === r
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              )}
            >
              {r}%
            </button>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm text-gray-600">{t.vatRate}:</span>
          <Badge variant="secondary" className="font-semibold">
            {rate}%
          </Badge>
        </div>
      )}

      {/* Breakdown */}
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">{t.netAmount}</span>
          <span className="font-medium">€{netAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">{t.vatAmount} ({rate}%)</span>
          <span className="font-medium">€{amount.toFixed(2)}</span>
        </div>
        <div className="border-t pt-1 flex justify-between font-semibold">
          <span>{t.total}</span>
          <span>€{(netAmount + amount).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

const translations: Record<string, any> = {
  fi: {
    vendor: 'Myyjä',
    businessId: 'Y-tunnus',
    date: 'Päivämäärä',
    total: 'Yhteensä',
    category: 'Kategoria',
    vatBreakdown: 'ALV-erittely',
    vatRate: 'ALV-kanta',
    netAmount: 'Veroton',
    vatAmount: 'ALV',
    approve: 'Hyväksy',
    edit: 'Muokkaa',
    save: 'Tallenna',
    cancel: 'Peruuta',
    autoApproving: 'Hyväksytään automaattisesti',
    autoApproveMessage: 'AI on varma - kuitti hyväksytään automaattisesti',
    stopAndEdit: 'Pysäytä ja muokkaa',
    knownVendor: 'Tuttu myyjä'
  },
  en: {
    vendor: 'Vendor',
    businessId: 'Business ID',
    date: 'Date',
    total: 'Total',
    category: 'Category',
    vatBreakdown: 'VAT Breakdown',
    vatRate: 'VAT Rate',
    netAmount: 'Net',
    vatAmount: 'VAT',
    approve: 'Approve',
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
    autoApproving: 'Auto-approving',
    autoApproveMessage: 'AI is confident - auto-approving receipt',
    stopAndEdit: 'Stop & Edit',
    knownVendor: 'Known vendor'
  },
  ru: {
    vendor: 'Продавец',
    businessId: 'Рег. номер',
    date: 'Дата',
    total: 'Итого',
    category: 'Категория',
    vatBreakdown: 'Разбивка НДС',
    vatRate: 'Ставка НДС',
    netAmount: 'Без НДС',
    vatAmount: 'НДС',
    approve: 'Утвердить',
    edit: 'Изменить',
    save: 'Сохранить',
    cancel: 'Отмена',
    autoApproving: 'Автоутверждение',
    autoApproveMessage: 'AI уверен - чек будет утверждён автоматически',
    stopAndEdit: 'Остановить',
    knownVendor: 'Известный продавец'
  }
};

