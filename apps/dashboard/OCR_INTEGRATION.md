# OCR Backend Integration Guide

This guide explains how to integrate the Fly.io OCR backend with Supabase for automatic document processing.

## Architecture Overview

```
Document Upload → Supabase Storage
    ↓
Supabase Database Trigger → Edge Function
    ↓
Edge Function → OCR Backend (Fly.io)
    ↓
OCR Results → Update Supabase documents table
    ↓
Real-time Update → Dashboard (via Supabase Realtime)
```

## Components

1. **Supabase Edge Function** (`supabase/functions/process-document-ocr/`)
   - Triggered by database changes or storage events
   - Fetches document from Supabase Storage
   - Calls OCR backend API
   - Updates document with OCR results

2. **OCR Backend** (`docflow-admin-api.fly.dev`)
   - Endpoint: `POST /api/v1/documents/process`
   - Accepts: FormData with `file` and `tenant_id`
   - Returns: Document with OCR data and confidence

3. **Supabase Database**
   - `documents` table stores document metadata and OCR results
   - `activities` table logs processing events
   - Real-time subscriptions notify dashboard of updates

## Setup Instructions

### Step 1: Deploy Supabase Edge Function

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link to your project:
   ```bash
   cd apps/dashboard
   supabase link --project-ref foejjbrcudpvuwdisnpz
   ```

4. Deploy the function:
   ```bash
   supabase functions deploy process-document-ocr
   ```

### Step 2: Configure Environment Variables

Set these in Supabase Dashboard → Edge Functions → Settings:

- `OCR_BACKEND_URL`: `https://docflow-admin-api.fly.dev`
- `OCR_BACKEND_API_KEY`: (Optional) API key for OCR backend authentication

### Step 3: Set Up Database Trigger

Create a database trigger to call the Edge Function when documents are inserted or updated:

```sql
-- Create function to call Edge Function
CREATE OR REPLACE FUNCTION trigger_process_document_ocr()
RETURNS TRIGGER AS $$
BEGIN
  -- Call Edge Function via HTTP
  PERFORM
    net.http_post(
      url := 'https://foejjbrcudpvuwdisnpz.supabase.co/functions/v1/process-document-ocr',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object(
        'record', row_to_json(NEW),
        'type', TG_OP,
        'table', TG_TABLE_NAME
      )
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER process_document_ocr_trigger
  AFTER INSERT OR UPDATE ON documents
  FOR EACH ROW
  WHEN (NEW.status = 'pending' OR TG_OP = 'INSERT')
  EXECUTE FUNCTION trigger_process_document_ocr();
```

### Step 4: Set Up Storage Webhook (Alternative)

If you prefer to trigger on file uploads to Supabase Storage:

1. Go to Supabase Dashboard → Storage → Policies
2. Create a webhook that calls the Edge Function
3. Configure webhook URL: `https://foejjbrcudpvuwdisnpz.supabase.co/functions/v1/process-document-ocr`

## Testing

### Test Document Upload

1. Upload a document to Supabase Storage
2. Insert a document record in the `documents` table:
   ```sql
   INSERT INTO documents (filename, status, file_url, customer_name)
   VALUES ('test-invoice.pdf', 'pending', 'https://...', 'Test Customer');
   ```

3. Check Edge Function logs:
   ```bash
   supabase functions logs process-document-ocr
   ```

4. Verify document status updated to 'completed' with OCR data

### Test OCR Backend Directly

```bash
curl -X POST https://docflow-admin-api.fly.dev/api/v1/documents/process \
  -F "file=@test-document.pdf" \
  -F "tenant_id=default"
```

## Error Handling

The Edge Function handles errors by:
1. Updating document status to 'error'
2. Storing error message in `error_message` field
3. Creating an activity log entry
4. Returning appropriate HTTP status codes

## Monitoring

- **Edge Function Logs**: `supabase functions logs process-document-ocr`
- **Database Logs**: Check `activities` table for processing events
- **OCR Backend Logs**: Check Fly.io logs for OCR processing

## Troubleshooting

### Edge Function Not Triggering

- Verify trigger is created: `SELECT * FROM pg_trigger WHERE tgname = 'process_document_ocr_trigger';`
- Check Edge Function deployment: `supabase functions list`
- Verify environment variables are set

### OCR Processing Fails

- Check OCR backend is accessible: `curl https://docflow-admin-api.fly.dev/health`
- Verify file URL is accessible
- Check Edge Function logs for detailed error messages

### Documents Not Updating

- Verify Real-time is enabled on `documents` table
- Check RLS policies allow updates
- Verify Edge Function has service role permissions

## Next Steps

1. Add retry logic for failed OCR processing
2. Implement queue system for high-volume processing
3. Add OCR result caching
4. Set up monitoring and alerts

