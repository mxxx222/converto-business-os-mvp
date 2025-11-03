'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/useAuth';
import { ProtectedButton } from '@/components/dashboard/ProtectedButton';
import { OSLayout } from '@/components/dashboard/OSLayout';
import {
  Upload,
  Download,
  Eye,
  Trash2,
  Loader,
  CheckCircle,
  AlertCircle,
  FileText,
} from 'lucide-react';
import type { Receipt } from '@/types/receipt';

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const { user, team } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (user) {
      fetchReceipts();

      // Subscribe to realtime updates
      const channel = supabase
        .channel('receipts-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'receipts',
            filter: team?.teamId ? `team_id=eq.${team.teamId}` : undefined,
          },
          () => {
            fetchReceipts();
          }
        )
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    }
  }, [user, team, filter]);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      let query = supabase.from('receipts').select('*').order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      // Filter by team if available
      if (team?.teamId) {
        query = query.eq('team_id', team.teamId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setReceipts((data || []) as Receipt[]);
    } catch (error: any) {
      console.error('Error fetching receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !team) return;

    try {
      setUploading(true);

      // 1. Upload to Supabase Storage (if bucket exists)
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${file.name}`;
      const storagePath = `${user.id}/${fileName}`;

      // Try to upload to storage
      let imageUrl: string | null = null;
      try {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(storagePath, file);

        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(storagePath);
          imageUrl = urlData?.publicUrl || null;
        }
      } catch (storageError) {
        console.warn('Storage not available, continuing without image URL:', storageError);
      }

      // 2. Call OCR API (if available)
      let ocrData: any = null;
      try {
        const formData = new FormData();
        formData.append('file', file);

        const ocrResponse = await fetch('/api/ocr/process', {
          method: 'POST',
          body: formData,
        });

        if (ocrResponse.ok) {
          ocrData = await ocrResponse.json();
        }
      } catch (ocrError) {
        console.warn('OCR API not available, creating receipt without OCR data:', ocrError);
      }

      // 3. Insert receipt to database
      const receiptData: any = {
        user_id: user.id,
        team_id: team.teamId,
        vendor: ocrData?.vendor || file.name.split('.')[0],
        total_amount: ocrData?.total_amount || ocrData?.amount || 0,
        vat_amount: ocrData?.vat_amount || 0,
        net_amount: ocrData?.net_amount || ocrData?.total_amount || 0,
        category: ocrData?.category || 'other',
        date: ocrData?.date || new Date().toISOString().split('T')[0],
        image_url: imageUrl,
        ocr_confidence: ocrData?.confidence || null,
        ocr_raw_data: ocrData || null,
        status: ocrData ? 'processed' : 'pending',
      };

      const { error: insertError } = await supabase.from('receipts').insert(receiptData);

      if (insertError) throw insertError;

      // Refresh list
      fetchReceipts();

      // Reset input
      e.target.value = '';
    } catch (error: any) {
      console.error('Error uploading receipt:', error);
      alert('Virhe kuittia ladattaessa: ' + (error.message || 'Tuntematon virhe'));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (receiptId: string) => {
    if (!confirm('Oletko varma että haluat poistaa tämän kuittia?')) return;

    try {
      const { error } = await supabase.from('receipts').delete().eq('id', receiptId);

      if (error) throw error;
      fetchReceipts();
    } catch (error: any) {
      console.error('Error deleting receipt:', error);
      alert('Virhe poistettaessa kuittia: ' + (error.message || 'Tuntematon virhe'));
    }
  };

  const getStatusBadge = (status: string | null | undefined) => {
    switch (status) {
      case 'processed':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs rounded flex items-center gap-1 w-fit">
            <CheckCircle size={12} /> Käsitelty
          </span>
        );
      case 'pending':
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs rounded flex items-center gap-1 w-fit">
            <Loader size={12} className="animate-spin" /> Käsitteillä
          </span>
        );
      case 'error':
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 text-xs rounded flex items-center gap-1 w-fit">
            <AlertCircle size={12} /> Virhe
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 text-xs rounded w-fit">
            {status || 'Tuntematon'}
          </span>
        );
    }
  };

  const totalAmount = receipts.reduce((sum, r) => sum + (r.total_amount || 0), 0);
  const totalVat = receipts.reduce((sum, r) => sum + (r.vat_amount || 0), 0);

  return (
    <OSLayout currentPath="/app/dashboard/receipts">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Kuitit</h1>
            <p className="text-gray-600 dark:text-gray-400">Hallinnoi ja käsittele kuitteja</p>
          </div>

          <ProtectedButton
            permission="write:receipts"
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            fallback={
              <span className="text-sm text-gray-500 dark:text-gray-400">Ei oikeuksia ladata</span>
            }
            disabled={uploading || !team}
          >
            <label className="cursor-pointer flex items-center gap-2">
              {uploading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  <span>Ladataan...</span>
                </>
              ) : (
                <>
                  <Upload size={18} />
                  <span>Lataa kuitti</span>
                </>
              )}
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleUpload}
                disabled={uploading || !team}
                className="hidden"
              />
            </label>
          </ProtectedButton>
        </div>

        {/* Filtterit */}
        <div className="flex gap-2 flex-wrap">
          {[
            { value: 'all', label: 'Kaikki' },
            { value: 'processed', label: '✓ Käsitelty' },
            { value: 'pending', label: '⏳ Käsitteillä' },
            { value: 'error', label: '✗ Virhe' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                filter === option.value
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Yhteenveto */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">Yhteensä</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{receipts.length}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">Käsitelty</p>
            <p className="text-2xl font-bold text-green-600">
              {receipts.filter((r) => r.status === 'processed').length}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">Kokonaissumma</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalAmount.toFixed(2)} €
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">ALV yhteensä</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalVat.toFixed(2)} €
            </p>
          </div>
        </div>

        {/* Kuitit-taulukko */}
        {loading ? (
          <div className="text-center py-12">
            <Loader className="inline-block animate-spin h-8 w-8 text-green-500" />
            <p className="text-gray-600 dark:text-gray-400 mt-2">Ladataan kuitteja...</p>
          </div>
        ) : receipts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Ei kuitteja saatavilla</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Aloita lataamalla ensimmäinen kuitti
            </p>
          </div>
        ) : (
          <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Kauppa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Summa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      ALV
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Päivämäärä
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Kategoria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Toiminnot
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {receipts.map((receipt) => (
                    <tr
                      key={receipt.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {receipt.vendor || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                        {(receipt.total_amount || 0).toFixed(2)} €
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {(receipt.vat_amount || 0).toFixed(2)} €
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {receipt.date
                          ? new Date(receipt.date).toLocaleDateString('fi-FI')
                          : receipt.created_at
                            ? new Date(receipt.created_at).toLocaleDateString('fi-FI')
                            : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {receipt.category || 'other'}
                      </td>
                      <td className="px-6 py-4 text-sm">{getStatusBadge(receipt.status)}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          {receipt.image_url && (
                            <a
                              href={receipt.image_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                              title="Näytä kuitti"
                            >
                              <Eye size={16} className="text-gray-600 dark:text-gray-400" />
                            </a>
                          )}
                          <ProtectedButton
                            permission="delete:receipts"
                            onClick={() => handleDelete(receipt.id)}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600 dark:text-red-400 transition-colors"
                            fallback={null}
                          >
                            <Trash2 size={16} />
                          </ProtectedButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </OSLayout>
  );
}
