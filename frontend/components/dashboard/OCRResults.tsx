'use client';

import { useState, useEffect } from 'react';
import { 
  Edit3, Save, X, AlertCircle, CheckCircle, Eye, EyeOff, 
  Calendar, DollarSign, Building, FileText, Clock, User
} from 'lucide-react';
import {
  DocumentOcrResult,
  EditableDocument,
  editableDocumentSchema,
  validateAmount,
  validateDate,
  validateVendor,
  getConfidenceColor,
  getConfidenceText,
  formatCurrency,
  formatDate,
  formatPercentage
} from '../../lib/ocr-validation';

interface OCRResultsProps {
  result: DocumentOcrResult;
  onUpdate?: (updates: Partial<EditableDocument>) => void;
  onApprove?: () => void;
  onReject?: () => void;
  className?: string;
  isEditable?: boolean;
}

interface FieldError {
  field: string;
  message: string;
}

export default function OCRResults({
  result,
  onUpdate,
  onApprove,
  onReject,
  className = '',
  isEditable = true
}: OCRResultsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showRawText, setShowRawText] = useState(false);
  const [editedData, setEditedData] = useState<Partial<EditableDocument>>({});
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize edited data when result changes
  useEffect(() => {
    setEditedData({
      vendor: result.vendor || '',
      total_amount: result.total_amount || 0,
      vat_amount: result.vat_amount || 0,
      vat_rate: result.vat_rate || 24,
      document_date: result.document_date || '',
      due_date: result.due_date || '',
      status: result.status as any
    });
  }, [result]);

  const validateField = (field: string, value: any): string | null => {
    switch (field) {
      case 'vendor':
        const vendorValidation = validateVendor(value);
        return vendorValidation.isValid ? null : vendorValidation.error || null;
      
      case 'total_amount':
      case 'vat_amount':
        const amountValidation = validateAmount(String(value));
        return amountValidation.isValid ? null : amountValidation.error || null;
      
      case 'vat_rate':
        const rate = parseFloat(String(value));
        if (isNaN(rate) || rate < 0 || rate > 100) {
          return 'ALV-prosentti tulee olla 0-100 välillä';
        }
        return null;
      
      case 'document_date':
      case 'due_date':
        if (!value) return field === 'document_date' ? 'Päivämäärä on pakollinen' : null;
        const dateValidation = validateDate(value);
        return dateValidation.isValid ? null : dateValidation.error || null;
      
      default:
        return null;
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
    
    // Validate field and update errors
    const error = validateField(field, value);
    setErrors(prev => {
      const filtered = prev.filter(e => e.field !== field);
      return error ? [...filtered, { field, message: error }] : filtered;
    });
  };

  const handleSave = async () => {
    // Validate all fields
    const newErrors: FieldError[] = [];
    
    Object.entries(editedData).forEach(([field, value]) => {
      const error = validateField(field, value);
      if (error) {
        newErrors.push({ field, message: error });
      }
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    try {
      // Validate with Zod schema
      const validatedData = editableDocumentSchema.parse(editedData);
      
      await onUpdate?.(validatedData);
      setIsEditing(false);
      setErrors([]);
    } catch (error) {
      console.error('Validation error:', error);
      setErrors([{ field: 'general', message: 'Tietojen validointi epäonnistui' }]);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors([]);
    // Reset to original data
    setEditedData({
      vendor: result.vendor || '',
      total_amount: result.total_amount || 0,
      vat_amount: result.vat_amount || 0,
      vat_rate: result.vat_rate || 24,
      document_date: result.document_date || '',
      due_date: result.due_date || '',
      status: result.status as any
    });
  };

  const getFieldError = (field: string): string | null => {
    const error = errors.find(e => e.field === field);
    return error ? error.message : null;
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

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-gray-400" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {result.file_name}
              </h3>
              <div className="flex items-center space-x-4 mt-1">
                {getStatusBadge(result.status)}
                <span className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(result.ocr_confidence)}`}>
                  {getConfidenceText(result.ocr_confidence)}
                </span>
              </div>
            </div>
          </div>
          
          {isEditable && (
            <div className="flex items-center space-x-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Muokkaa
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Tallennetaan...' : 'Tallenna'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Peruuta
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vendor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building className="h-4 w-4 inline mr-1" />
              Myyjä
            </label>
            {isEditing ? (
              <div>
                <input
                  type="text"
                  value={editedData.vendor || ''}
                  onChange={(e) => handleFieldChange('vendor', e.target.value)}
                  className={`block w-full border rounded-md px-3 py-2 text-sm ${
                    getFieldError('vendor') ? 'border-red-300' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Syötä myyjän nimi"
                />
                {getFieldError('vendor') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('vendor')}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-900">{result.vendor || '-'}</p>
            )}
          </div>

          {/* Total Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="h-4 w-4 inline mr-1" />
              Kokonaissumma
            </label>
            {isEditing ? (
              <div>
                <input
                  type="number"
                  step="0.01"
                  value={editedData.total_amount || ''}
                  onChange={(e) => handleFieldChange('total_amount', parseFloat(e.target.value) || 0)}
                  className={`block w-full border rounded-md px-3 py-2 text-sm ${
                    getFieldError('total_amount') ? 'border-red-300' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="0.00"
                />
                {getFieldError('total_amount') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('total_amount')}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-900 font-medium">
                {formatCurrency(result.total_amount, result.currency)}
              </p>
            )}
          </div>

          {/* VAT Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ALV summa
            </label>
            {isEditing ? (
              <div>
                <input
                  type="number"
                  step="0.01"
                  value={editedData.vat_amount || ''}
                  onChange={(e) => handleFieldChange('vat_amount', parseFloat(e.target.value) || 0)}
                  className={`block w-full border rounded-md px-3 py-2 text-sm ${
                    getFieldError('vat_amount') ? 'border-red-300' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="0.00"
                />
                {getFieldError('vat_amount') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('vat_amount')}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-900">
                {formatCurrency(result.vat_amount, result.currency)}
              </p>
            )}
          </div>

          {/* VAT Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ALV-%
            </label>
            {isEditing ? (
              <div>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={editedData.vat_rate || ''}
                  onChange={(e) => handleFieldChange('vat_rate', parseFloat(e.target.value) || 0)}
                  className={`block w-full border rounded-md px-3 py-2 text-sm ${
                    getFieldError('vat_rate') ? 'border-red-300' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="24"
                />
                {getFieldError('vat_rate') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('vat_rate')}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-900">
                {formatPercentage(result.vat_rate)}
              </p>
            )}
          </div>

          {/* Document Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              Päivämäärä
            </label>
            {isEditing ? (
              <div>
                <input
                  type="date"
                  value={editedData.document_date || ''}
                  onChange={(e) => handleFieldChange('document_date', e.target.value)}
                  className={`block w-full border rounded-md px-3 py-2 text-sm ${
                    getFieldError('document_date') ? 'border-red-300' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                />
                {getFieldError('document_date') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('document_date')}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-900">
                {formatDate(result.document_date)}
              </p>
            )}
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="h-4 w-4 inline mr-1" />
              Eräpäivä
            </label>
            {isEditing ? (
              <div>
                <input
                  type="date"
                  value={editedData.due_date || ''}
                  onChange={(e) => handleFieldChange('due_date', e.target.value)}
                  className={`block w-full border rounded-md px-3 py-2 text-sm ${
                    getFieldError('due_date') ? 'border-red-300' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                />
                {getFieldError('due_date') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('due_date')}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-900">
                {formatDate(result.due_date)}
              </p>
            )}
          </div>
        </div>

        {/* Raw OCR Text */}
        {result.raw_ocr_text && (
          <div className="mt-6">
            <button
              onClick={() => setShowRawText(!showRawText)}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              {showRawText ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
              {showRawText ? 'Piilota' : 'Näytä'} raaka OCR-teksti
            </button>
            
            {showRawText && (
              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                  {result.raw_ocr_text}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* General Error */}
        {getFieldError('general') && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{getFieldError('general')}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {(onApprove || onReject) && result.status === 'processed' && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <div className="flex justify-end space-x-3">
            {onReject && (
              <button
                onClick={onReject}
                className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <X className="h-4 w-4 mr-2" />
                Hylkää
              </button>
            )}
            {onApprove && (
              <button
                onClick={onApprove}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Hyväksy
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
