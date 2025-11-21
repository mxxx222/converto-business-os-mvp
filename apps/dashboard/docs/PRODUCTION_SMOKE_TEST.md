# Production Smoke Test Guide

This guide explains how to run production smoke tests for the DocFlow OCR pipeline.

## Overview

The smoke test verifies that the complete E2E pipeline works:
1. Document upload → Supabase Storage
2. Database trigger → Edge Function
3. Edge Function → OCR Backend
4. OCR Results → Database update
5. Real-time updates → Dashboard

## Prerequisites

1. **Supabase credentials** in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://foejjbrcudpvuwdisnpz.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. **Test documents** (5-10 real PDFs):
   - Invoices (PDF format)
   - Receipts (PDF or image format)
   - Various document types

3. **Supabase Storage bucket** named `documents` must exist

## Running the Smoke Test

### Option 1: Test with Real Files

```bash
cd apps/dashboard
tsx scripts/smoke-test.ts --file path/to/invoice1.pdf --file path/to/receipt1.pdf
```

### Option 2: Create Test Records (Manual Testing)

```bash
cd apps/dashboard
tsx scripts/smoke-test.ts
```

This creates test document records without files for manual testing.

## What Gets Tested

### 1. Document Upload Flow
- ✅ File upload to Supabase Storage
- ✅ Document record creation
- ✅ Status: `pending` → `processing` → `completed`

### 2. OCR Processing
- ✅ Edge Function triggered automatically
- ✅ OCR backend called successfully
- ✅ Results stored in database
- ✅ OCR confidence score recorded

### 3. Error Handling
- ✅ Invalid file types rejected
- ✅ Missing file_url handled gracefully
- ✅ Processing timeouts detected
- ✅ Error messages stored correctly

### 4. Performance Metrics
- ✅ Processing time per document
- ✅ Average OCR confidence
- ✅ Success/failure rates

## Expected Results

### Success Criteria
- ✅ All documents process within 60 seconds
- ✅ OCR confidence > 70% for clear documents
- ✅ No unexpected errors
- ✅ Real-time updates appear in dashboard

### Performance Targets
- **Processing Time**: < 30 seconds per document
- **OCR Accuracy**: > 80% for standard invoices/receipts
- **Success Rate**: > 90% for valid documents

## Monitoring During Test

### 1. Supabase Dashboard
- **Edge Functions → Logs**: Check `process-document-ocr` function logs
- **Database → Table Editor**: Monitor `documents` table status changes
- **Database → Table Editor**: Check `activities` table for processing events

### 2. Dashboard UI
- Open http://localhost:3000
- Watch Document Queue Manager for real-time updates
- Check Real-time Activity Feed for processing events

### 3. OCR Backend Logs
- Check Fly.io logs: `fly logs -a docflow-admin-api`
- Verify API calls are received
- Check response times

## Troubleshooting

### Documents Stuck in "pending"
- Check Edge Function logs for errors
- Verify database trigger is active
- Check OCR backend is accessible

### Documents Fail with "error" Status
- Check `error_message` field in documents table
- Verify file is accessible from Edge Function
- Check OCR backend response

### Slow Processing Times
- Check OCR backend performance
- Verify Edge Function timeout settings
- Check network latency to OCR backend

## Test Checklist

- [ ] Upload 5-10 real documents
- [ ] Verify all documents process successfully
- [ ] Check OCR confidence scores are reasonable
- [ ] Verify real-time updates in dashboard
- [ ] Test error handling with invalid files
- [ ] Monitor Edge Function logs
- [ ] Check activities table for events
- [ ] Verify processing times are acceptable

## Next Steps

After successful smoke test:
1. ✅ System ready for beta customers
2. ✅ Proceed to Phase 2: Beta Signup activation
3. ✅ Begin onboarding first beta customers

