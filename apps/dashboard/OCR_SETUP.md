# OCR Pipeline Setup Guide

This guide explains how to set up the OCR pipeline for DocFlow receipt processing.

## Environment Variables

Add the following environment variables to your `.env.local` file (or Vercel environment variables):

### Required Variables

```bash
# OpenAI API Key (for GPT-4 Vision OCR)
OPENAI_API_KEY=sk-...

# App URL (for internal API calls between routes)
# Development: http://localhost:3001
# Production: https://your-dashboard.vercel.app
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Supabase Configuration (should already exist)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # Server-side only
```

## Supabase Storage Setup

### 1. Create Documents Bucket

1. Go to Supabase Dashboard → Storage
2. Click "New bucket"
3. Name: `documents`
4. Public: **No** (private bucket)
5. Click "Create bucket"

### 2. Configure RLS Policies

Run the following SQL in Supabase SQL Editor:

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to read their own files
CREATE POLICY "Users can read own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow service role to manage all files (for server-side operations)
CREATE POLICY "Service role can manage documents"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'documents');
```

### 3. Verify Documents Table

Ensure the `documents` table exists with the following schema (from `supabase-schema.sql`):

```sql
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  customer_id TEXT,
  customer_name TEXT,
  filename TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error', 'new')),
  upload_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  size TEXT,
  type TEXT DEFAULT 'other' CHECK (type IN ('invoice', 'receipt', 'contract', 'other')),
  error_message TEXT,
  ocr_confidence FLOAT,
  file_url TEXT,
  ocr_data JSONB
);
```

## Testing the Pipeline

1. **Start the development server:**
   ```bash
   cd apps/dashboard
   npm install  # Install openai package
   npm run dev
   ```

2. **Navigate to demo page:**
   ```
   http://localhost:3001/test
   ```

3. **Upload a Finnish receipt:**
   - Click or drag-and-drop a receipt image (JPEG, PNG, or WebP)
   - Click "Process Receipt"
   - Wait for processing (usually 2-3 seconds)
   - View extracted data

## API Endpoints

### POST `/api/documents/upload`
Uploads a file to Supabase Storage and creates a document record.

**Request:**
- `FormData` with:
  - `file`: Image file (JPEG, PNG, WebP)
  - `userId`: User ID (string)

**Response:**
```json
{
  "success": true,
  "document": {
    "id": "uuid",
    "filename": "receipt.jpg",
    "status": "new",
    "file_url": "https://..."
  }
}
```

### POST `/api/ocr/process`
Processes a document with GPT-4 Vision OCR.

**Request:**
```json
{
  "documentId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "store": "S-market",
    "date": "2025-01-15",
    "total": 12.34,
    "vat": 2.34,
    "items": [...],
    "payment_method": "Card",
    "receipt_number": "123"
  },
  "processingTimeMs": 2345
}
```

### GET `/api/documents/[id]`
Fetches a document by ID.

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "filename": "receipt.jpg",
  "status": "completed",
  "ocr_data": {...},
  "file_url": "https://...",
  ...
}
```

## Troubleshooting

### "OPENAI_API_KEY not configured"
- Ensure `OPENAI_API_KEY` is set in `.env.local` or Vercel environment variables
- Restart the development server after adding the variable

### "Failed to upload file"
- Check that the `documents` bucket exists in Supabase Storage
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Check Supabase Storage RLS policies

### "Document not found"
- Ensure the document ID is correct
- Check that the document was created in the `documents` table

### "OCR processing failed"
- Verify OpenAI API key is valid and has credits
- Check that the image URL is accessible (may need signed URLs for private buckets)
- Review server logs for detailed error messages

## Cost Estimates

- **OpenAI GPT-4o Vision**: ~$0.01-0.03 per receipt
- **Supabase Storage**: Free tier includes 1GB
- **Total**: ~€3-5 per 100 receipts

## Next Steps

After the OCR pipeline is working:
1. Add email forwarding (30 min)
2. Add Excel export (1h)
3. Add batch upload (2h)
4. Integrate with main dashboard

