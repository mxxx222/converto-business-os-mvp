"use client";

import { useState, useEffect } from "react";
import { Receipt, FileText, Calendar, Euro, Tag, Search, Filter } from "lucide-react";
import Link from "next/link";

interface ReceiptItem {
  id: string;
  vendor: string;
  total_amount: number;
  vat_amount: number;
  vat_rate: number;
  net_amount: number;
  receipt_date: string;
  invoice_number: string;
  payment_method: string;
  currency: string;
  category: string;
  subcategory: string;
  tags: string[];
  confidence: number;
  status: string;
  is_deductible: boolean;
  is_reimbursable: boolean;
  created_at: string;
}

interface ReceiptStats {
  total_receipts: number;
  total_amount: number;
  total_vat: number;
  categories: Array<{ category: string; count: number }>;
  average_confidence: number;
}

export default function ReceiptsList() {
  const [receipts, setReceipts] = useState<ReceiptItem[]>([]);
  const [stats, setStats] = useState<ReceiptStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    fetchReceipts();
    fetchStats();
  }, []);

  const fetchReceipts = async () => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE || "https://api.converto.fi";
      const response = await fetch(`${apiBase}/api/v1/receipts/`);

      if (!response.ok) {
        throw new Error("Failed to fetch receipts");
      }

      const data = await response.json();
      setReceipts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch receipts");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE || "https://api.converto.fi";
      const response = await fetch(`${apiBase}/api/v1/receipts/stats`);

      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const formatCurrency = (amount: number, currency: string = "EUR") => {
    return new Intl.NumberFormat("fi-FI", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fi-FI");
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "text-green-600 bg-green-100";
    if (confidence >= 0.7) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "groceries":
        return "🛒";
      case "transportation":
        return "⛽";
      case "technology":
        return "💻";
      case "healthcare":
        return "🏥";
      case "services":
        return "🔧";
      case "office":
        return "🏢";
      default:
        return "📄";
    }
  };

  const filteredReceipts = receipts.filter((receipt) => {
    const matchesSearch = receipt.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         receipt.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || receipt.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = stats?.categories || [];

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-red-800">Virhe</h3>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Kuitit ja Laskut</h1>
        <Link
          href="/receipts"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Lataa uusi kuitti
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <Receipt className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Kuitit yhteensä</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_receipts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <Euro className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Kokonaissumma</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.total_amount)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <Tag className="w-8 h-8 text-purple-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">ALV yhteensä</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.total_vat)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-orange-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Keskimääräinen luottamus</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats.average_confidence * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Hae myyjän tai kuitin numeron perusteella..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="md:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Kaikki kategoriat</option>
                {categories.map((cat) => (
                  <option key={cat.category} value={cat.category}>
                    {cat.category} ({cat.count})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Receipts List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {filteredReceipts.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ei kuitteja</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || categoryFilter
                ? "Hakuehdoilla ei löytynyt kuitteja"
                : "Aloita lataamalla ensimmäinen kuitti"}
            </p>
            <Link
              href="/receipts"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Lataa ensimmäinen kuitti
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kuitti
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Summa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Päivämäärä
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Luottamus
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tila
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReceipts.map((receipt) => (
                  <tr key={receipt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">
                          {getCategoryIcon(receipt.category)}
                        </span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {receipt.vendor}
                          </div>
                          <div className="text-sm text-gray-500">
                            {receipt.invoice_number || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(receipt.total_amount, receipt.currency)}
                      </div>
                      <div className="text-sm text-gray-500">
                        ALV: {formatCurrency(receipt.vat_amount, receipt.currency)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                        {formatDate(receipt.receipt_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">
                        {receipt.category}
                      </div>
                      <div className="text-sm text-gray-500 capitalize">
                        {receipt.subcategory}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConfidenceColor(receipt.confidence)}`}>
                        {(receipt.confidence * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          receipt.status === 'processed' ? 'bg-green-100 text-green-800' :
                          receipt.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                          receipt.status === 'approved' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {receipt.status}
                        </span>
                        {receipt.is_deductible && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Vähennyskelpoinen
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
