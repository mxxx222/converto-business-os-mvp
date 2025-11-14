'use client';

import { CheckCircle, AlertCircle, AlertTriangle, Info, Building2, Calculator } from 'lucide-react';
import type { VATAnalysis } from '@/lib/api/documents';

interface VATAnalysisCardProps {
  analysis: VATAnalysis;
  className?: string;
}

export default function VATAnalysisCard({ analysis, className = '' }: VATAnalysisCardProps) {
  const hasErrors = analysis.calculation_errors && analysis.calculation_errors.length > 0;
  const hasWarnings = analysis.calculation_warnings && analysis.calculation_warnings.length > 0;
  const hasSuggestions = analysis.suggestions && analysis.suggestions.length > 0;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">ALV-analyysi</h3>
          {analysis.calculation_valid ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-500" />
          )}
        </div>

        {/* Y-tunnus Information */}
        {analysis.y_tunnus && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    Y-tunnus: {analysis.y_tunnus_formatted || analysis.y_tunnus}
                  </span>
                  {analysis.y_tunnus_valid ? (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                      Kelvollinen
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                      Virheellinen
                    </span>
                  )}
                </div>
                {analysis.company_name && (
                  <p className="mt-1 text-sm text-gray-600">{analysis.company_name}</p>
                )}
                {analysis.company_info?.address && (
                  <p className="mt-1 text-xs text-gray-500">
                    {analysis.company_info.address.full_address}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VAT Rate Analysis */}
        {analysis.detected_vat_rate !== undefined && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <Calculator className="h-5 w-5 text-blue-400 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    ALV-kanta: {analysis.detected_vat_rate}%
                  </span>
                  {analysis.rate_matches_vendor ? (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                      Oikea
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      Tarkista
                    </span>
                  )}
                </div>
                {analysis.vat_rate_name && (
                  <p className="mt-1 text-sm text-gray-600">
                    Tyyppi: {analysis.vat_rate_name}
                  </p>
                )}
                {analysis.expected_vat_rate !== undefined && 
                 analysis.expected_vat_rate !== analysis.detected_vat_rate && (
                  <p className="mt-1 text-xs text-yellow-700">
                    Odotettu kanta: {analysis.expected_vat_rate}%
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Calculation Errors */}
        {hasErrors && (
          <div className="mb-4">
            <div className="flex items-start space-x-2 mb-2">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <h4 className="text-sm font-medium text-red-900">Laskentavirheet</h4>
            </div>
            <ul className="space-y-2">
              {analysis.calculation_errors!.map((error: any, index: number) => (
                <li key={index} className="text-sm text-red-700 bg-red-50 p-3 rounded">
                  <span className="font-medium">{error.field}:</span> {error.message}
                  {error.difference && (
                    <span className="ml-2 text-xs">
                      (ero: {error.difference}€)
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Calculation Warnings */}
        {hasWarnings && (
          <div className="mb-4">
            <div className="flex items-start space-x-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <h4 className="text-sm font-medium text-yellow-900">Varoitukset</h4>
            </div>
            <ul className="space-y-2">
              {analysis.calculation_warnings!.map((warning: any, index: number) => (
                <li key={index} className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded">
                  <span className="font-medium">{warning.field}:</span> {warning.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggestions */}
        {hasSuggestions && (
          <div className="mb-4">
            <div className="flex items-start space-x-2 mb-2">
              <Info className="h-5 w-5 text-blue-500 mt-0.5" />
              <h4 className="text-sm font-medium text-blue-900">Ehdotukset</h4>
            </div>
            <ul className="space-y-2">
              {analysis.suggestions!.map((suggestion: any, index: number) => (
                <li key={index} className="text-sm text-blue-700 bg-blue-50 p-3 rounded">
                  <span className="font-medium">{suggestion.field}:</span> {suggestion.message}
                  {suggestion.correction && (
                    <div className="mt-2 text-xs">
                      <span className="font-medium">Ehdotettu korjaus:</span>
                      <pre className="mt-1 p-2 bg-white rounded text-xs overflow-x-auto">
                        {JSON.stringify(suggestion.correction, null, 2)}
                      </pre>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* VAT Breakdown by Rate */}
        {analysis.items_vat_breakdown?.vat_breakdown && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">ALV-erittely</h4>
            <div className="space-y-2">
              {analysis.items_vat_breakdown.vat_breakdown.map((item: any, index: number) => (
                <div key={index} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                  <span className="text-gray-600">
                    ALV {item.vat_percentage}
                  </span>
                  <div className="text-right">
                    <div className="text-gray-900 font-medium">
                      {item.vat_amount.toFixed(2)}€
                    </div>
                    <div className="text-xs text-gray-500">
                      Veroton: {item.net_amount.toFixed(2)}€
                    </div>
                  </div>
                </div>
              ))}
              {analysis.items_vat_breakdown.totals && (
                <div className="flex justify-between text-sm p-2 bg-gray-100 rounded font-medium border-t border-gray-200">
                  <span className="text-gray-900">Yhteensä</span>
                  <div className="text-right">
                    <div className="text-gray-900">
                      {analysis.items_vat_breakdown.totals.total_amount.toFixed(2)}€
                    </div>
                    <div className="text-xs text-gray-600">
                      ALV: {analysis.items_vat_breakdown.totals.vat_amount.toFixed(2)}€
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analysis Timestamp */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Analysoitu: {new Date(analysis.analyzed_at).toLocaleString('fi-FI')}
          </p>
        </div>
      </div>
    </div>
  );
}

