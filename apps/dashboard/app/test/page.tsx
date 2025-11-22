'use client'

import { useState } from 'react'
import { Upload, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react'

interface OCRResult {
  store?: string
  date?: string
  total?: number
  vat?: number
  items?: Array<{
    name: string
    price: number
    quantity: number
  }>
  payment_method?: string
  receipt_number?: string
}

export default function DemoPage() {
  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<OCRResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [documentId, setDocumentId] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'failed'>('idle')

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please select an image file (JPEG, PNG, or WebP)')
      return
    }

    setFile(selectedFile)
    setError(null)
    setResult(null)
    setStatus('idle')
  }

  const handleUpload = async () => {
    if (!file) return

    setProcessing(true)
    setError(null)
    setResult(null)
    setStatus('uploading')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', 'demo-user') // Demo user ID

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await response.json()
      setDocumentId(data.document.id)
      setStatus('processing')

      // Poll for result
      await pollForResult(data.document.id)
    } catch (err: any) {
      setError(err.message || 'Upload failed')
      setStatus('failed')
      setProcessing(false)
    }
  }

  const pollForResult = async (docId: string, attempts = 0) => {
    const maxAttempts = 60 // 60 seconds max (1 second intervals)
    
    if (attempts >= maxAttempts) {
      setError('Processing timeout - please try again')
      setStatus('failed')
      setProcessing(false)
      return
    }

    try {
      const response = await fetch(`/api/documents/${docId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch document status')
      }

      const doc = await response.json()

      if (doc.status === 'completed') {
        setResult(doc.ocr_data)
        setStatus('completed')
        setProcessing(false)
      } else if (doc.status === 'error' || doc.status === 'failed') {
        setError(doc.error_message || 'Processing failed')
        setStatus('failed')
        setProcessing(false)
      } else {
        // Still processing, poll again
        setTimeout(() => pollForResult(docId, attempts + 1), 1000)
      }
    } catch (err: any) {
      console.error('Polling error:', err)
      setTimeout(() => pollForResult(docId, attempts + 1), 1000)
    }
  }

  const handleReset = () => {
    setFile(null)
    setResult(null)
    setError(null)
    setDocumentId(null)
    setStatus('idle')
    setProcessing(false)
    // Reset file input
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    if (input) input.value = ''
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-900">
            DocFlow Demo 🇫🇮
          </h1>
          <p className="text-gray-600">
            Upload a Finnish receipt and see the magic happen
          </p>
        </div>

        {/* Upload Zone */}
        {!file && status === 'idle' && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 transition-colors">
              <Upload className="w-12 h-12 text-gray-400 mb-4" />
              <span className="text-lg text-gray-600 mb-2">
                Drop receipt here or click to upload
              </span>
              <span className="text-sm text-gray-500">
                Supports JPEG, PNG, WebP
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* File Selected */}
        {file && status === 'idle' && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 font-semibold">
                    {file.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={handleUpload}
              disabled={processing}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Process Receipt
            </button>
          </div>
        )}

        {/* Processing */}
        {(status === 'uploading' || status === 'processing') && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              {status === 'uploading' ? 'Uploading receipt...' : 'Processing receipt...'}
            </p>
            <p className="text-sm text-gray-500">
              {status === 'uploading' 
                ? 'Uploading to storage...' 
                : 'Extracting data with AI (usually takes 2-3 seconds)'}
            </p>
          </div>
        )}

        {/* Result */}
        {result && status === 'completed' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Extracted Data</h2>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-2 gap-4">
                {result.store && (
                  <div>
                    <p className="text-sm text-gray-500">Store</p>
                    <p className="font-semibold text-gray-900">{result.store}</p>
                  </div>
                )}
                {result.date && (
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-semibold text-gray-900">{result.date}</p>
                  </div>
                )}
                {result.total !== undefined && (
                  <div>
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="font-semibold text-gray-900">
                      {result.total.toFixed(2)} €
                    </p>
                  </div>
                )}
                {result.vat !== undefined && (
                  <div>
                    <p className="text-sm text-gray-500">VAT</p>
                    <p className="font-semibold text-gray-900">
                      {result.vat.toFixed(2)} €
                    </p>
                  </div>
                )}
                {result.payment_method && (
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="font-semibold text-gray-900">{result.payment_method}</p>
                  </div>
                )}
                {result.receipt_number && (
                  <div>
                    <p className="text-sm text-gray-500">Receipt Number</p>
                    <p className="font-semibold text-gray-900">{result.receipt_number}</p>
                  </div>
                )}
              </div>
            </div>

            {result.items && result.items.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Items</h3>
                <div className="space-y-2">
                  {result.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-gray-900">{item.name}</span>
                      <span className="text-gray-600">
                        {item.quantity}x {item.price.toFixed(2)} €
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                View Raw JSON
              </summary>
              <pre className="mt-2 bg-gray-50 p-4 rounded overflow-auto text-xs">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>

            <button
              onClick={handleReset}
              className="mt-6 w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Process Another Receipt
            </button>
          </div>
        )}

        {/* Error */}
        {error && status === 'failed' && (
          <div className="bg-red-50 border border-red-200 rounded-lg shadow-lg p-8">
            <div className="flex items-center gap-2 mb-4">
              <XCircle className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-bold text-red-900">Error</h2>
            </div>
            <p className="text-red-700 mb-4">{error}</p>
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
              {documentId && (
                <button
                  onClick={() => pollForResult(documentId, 0)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry Processing
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

