"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Receipt, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface ReceiptData {
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
  items: Array<{
    name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  category: string;
  subcategory: string;
  tags: string[];
  confidence: number;
  status: string;
}

interface VisionAI {
  model: string;
  processing_time_ms: number;
  confidence: number;
}

interface ScanResult {
  success: boolean;
  receipt_id: string;
  data: ReceiptData;
  vision_ai: VisionAI;
}

export default function ReceiptUpload() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE || "https://api.converto.fi";
      const response = await fetch(`${apiBase}/api/v1/receipts/scan`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Upload failed");
      }

      const scanResult: ScanResult = await response.json();
      setResult(scanResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    multiple: false,
    disabled: uploading,
  });

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
    if (confidence >= 0.9) return "text-green-600";
    if (confidence >= 0.7) return "text-yellow-600";
    return "text-red-600";
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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Kuittien ja Laskujen Automaatio
        </h1>
        <p className="text-gray-600">
          Lataa kuva kuitista tai laskusta ja saat automaattisen tunnistuksen Vision AI:lla
        </p>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300"}
          ${uploading ? "opacity-50 cursor-not-allowed" : "hover:border-blue-400 hover:bg-blue-50"}
        `}
      >
        <input {...getInputProps()} />

        {uploading ? (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Käsitellään...</h3>
              <p className="text-gray-600">Vision AI analysoi kuittia</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="w-12 h-12 text-gray-400 mx-auto" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {isDragActive ? "Pudota kuva tähän" : "Valitse tai vedä kuva tähän"}
              </h3>
              <p className="text-gray-600">
                Tuettu: JPEG, PNG, WebP (max 10MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Virhe</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                Kuitti tunnistettu onnistuneesti
              </h2>
            </div>
            <div className={`text-sm font-medium ${getConfidenceColor(result.data.confidence)}`}>
              Luottamus: {(result.data.confidence * 100).toFixed(1)}%
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Myyjä</label>
                <p className="text-lg font-semibold text-gray-900">{result.data.vendor}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Kokonaissumma</label>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(result.data.total_amount, result.data.currency)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">ALV</label>
                <p className="text-sm text-gray-900">
                  {formatCurrency(result.data.vat_amount, result.data.currency)} ({result.data.vat_rate}%)
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Päivämäärä</label>
                <p className="text-sm text-gray-900">{formatDate(result.data.receipt_date)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Kuitin numero</label>
                <p className="text-sm text-gray-900">{result.data.invoice_number || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Maksutapa</label>
                <p className="text-sm text-gray-900">{result.data.payment_method || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Category & Tags */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="text-2xl mr-2">{getCategoryIcon(result.data.category)}</span>
              <div>
                <label className="text-sm font-medium text-gray-500">Kategoria</label>
                <p className="text-sm text-gray-900 capitalize">
                  {result.data.category} / {result.data.subcategory}
                </p>
              </div>
            </div>
            {result.data.tags.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-500">Tagit</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {result.data.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Items */}
          {result.data.items.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Tuotteet</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Tuote
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Määrä
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Yksikköhinta
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Yhteensä
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {result.data.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {formatCurrency(item.unit_price, result.data.currency)}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {formatCurrency(item.total_price, result.data.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Vision AI Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Vision AI Tiedot</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <label className="text-gray-500">Malli</label>
                <p className="text-gray-900">{result.vision_ai.model}</p>
              </div>
              <div>
                <label className="text-gray-500">Käsittelyaika</label>
                <p className="text-gray-900">{result.vision_ai.processing_time_ms}ms</p>
              </div>
              <div>
                <label className="text-gray-500">Luottamus</label>
                <p className={`font-medium ${getConfidenceColor(result.vision_ai.confidence)}`}>
                  {(result.vision_ai.confidence * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-3">Miten käyttää</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>1. <strong>Lataa kuva:</strong> Vedä kuva upload-alueelle tai klikkaa valitaksesi tiedoston</p>
          <p>2. <strong>Automaattinen tunnistus:</strong> Vision AI analysoi kuitin ja erottaa kaikki tiedot</p>
          <p>3. <strong>Tarkista tiedot:</strong> Tarkista tunnistetut tiedot ja korjaa tarvittaessa</p>
          <p>4. <strong>Tallenna:</strong> Kuitti tallennetaan automaattisesti tietokantaan</p>
        </div>
      </div>
    </div>
  );
}


