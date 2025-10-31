'use client';

import type { Receipt } from '@/types/receipt';
import { Search, Filter, Download } from 'lucide-react';
import { useState } from 'react';

interface ReceiptListProps {
  receipts: Receipt[];
  loading?: boolean;
}

export function ReceiptList({ receipts, loading = false }: ReceiptListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(receipts.map((r) => r.category).filter(Boolean)));

  const filteredReceipts = receipts.filter((receipt) => {
    const matchesSearch =
      !searchQuery ||
      receipt.vendor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      receipt.category?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = !selectedCategory || receipt.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Viimeisimmät kuitit
        </h2>
        <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm">
          <Download className="w-4 h-4" />
          <span>Vie CSV</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Hae kuitteja..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="pl-10 pr-8 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white appearance-none"
          >
            <option value="">Kaikki kategoriat</option>
            {categories.map((cat) => (
              <option key={cat || 'unknown'} value={cat || ''}>
                {cat || 'Tuntematon'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Receipts List */}
      {filteredReceipts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📄</div>
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            {receipts.length === 0
              ? 'Ei kuitteja vielä. Aloita lisäämällä ensimmäinen kuitti!'
              : 'Ei tuloksia hakuehdoilla.'}
          </p>
          {receipts.length === 0 && (
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Lisää kuitti
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReceipts.map((receipt) => (
            <div
              key={receipt.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {receipt.vendor || 'Tuntematon myyjä'}
                  </h3>
                  {receipt.category && (
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs font-medium">
                      {receipt.category}
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>{receipt.total_amount ? `${receipt.total_amount.toFixed(2)}€` : 'Summa ei saatavilla'}</span>
                  {receipt.vat_amount && <span>ALV: {receipt.vat_amount.toFixed(2)}€</span>}
                  {receipt.created_at && (
                    <span>{new Date(receipt.created_at).toLocaleDateString('fi-FI')}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {receipt.ocr_confidence && (
                  <span
                    className="text-xs text-gray-500 dark:text-gray-400"
                    title={`OCR luottamus: ${(receipt.ocr_confidence * 100).toFixed(0)}%`}
                  >
                    ✓ {(receipt.ocr_confidence * 100).toFixed(0)}%
                  </span>
                )}
                <button className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                  Näytä
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

