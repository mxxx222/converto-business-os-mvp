# Production Verification Checklist

Use this checklist to verify the OCR pipeline is working correctly in production.

## Pre-Verification

- [ ] Deployment completed successfully
- [ ] All environment variables configured
- [ ] Vercel build logs show no errors
- [ ] Production URL accessible

---

## Automated Verification

Run the verification script:

```bash
cd apps/dashboard
./scripts/verify-deployment.sh https://your-dashboard.vercel.app
```

This will test:
- ✅ Homepage accessible
- ✅ Test page accessible
- ✅ API routes accessible
- ✅ No critical JavaScript errors
- ✅ Environment variables loaded

---

## Manual Verification Steps

### 1. Test Page Access

- [ ] Navigate to `https://your-dashboard.vercel.app/test`
- [ ] Page loads without errors
- [ ] Upload interface displays correctly
- [ ] No console errors in browser DevTools

### 2. File Upload Test

- [ ] Select a test receipt image (JPEG/PNG)
- [ ] File appears in upload zone
- [ ] Click "Process Receipt"
- [ ] Upload progress indicator shows
- [ ] Upload completes successfully

### 3. OCR Processing Test

- [ ] Status changes to "Processing receipt..."
- [ ] Processing completes within 10 seconds
- [ ] Status changes to "Extracted Data"
- [ ] Results display correctly

### 4. Results Verification

Check extracted data:
- [ ] Store name displayed
- [ ] Date in correct format (YYYY-MM-DD)
- [ ] Total amount matches receipt
- [ ] VAT amount displayed (if applicable)
- [ ] Items list populated (if visible)
- [ ] Payment method detected
- [ ] Receipt number captured (if visible)

### 5. Error Handling Test

- [ ] Upload invalid file type → Error message shown
- [ ] Network error → Error message shown
- [ ] Retry button works correctly

### 6. API Endpoints Test

#### Upload Endpoint

```bash
curl -X POST https://your-dashboard.vercel.app/api/documents/upload \
  -F "file=@test-receipt.jpg" \
  -F "userId=test-user"
```

Expected: JSON response with `success: true` and `document.id`

#### Document Status Endpoint

```bash
curl https://your-dashboard.vercel.app/api/documents/{document-id}
```

Expected: JSON response with document data including `status` and `ocr_data`

#### OCR Process Endpoint

```bash
curl -X POST https://your-dashboard.vercel.app/api/ocr/process \
  -H "Content-Type: application/json" \
  -d '{"documentId": "your-document-id"}'
```

Expected: JSON response with `success: true` and `data` containing OCR results

---

## Performance Verification

- [ ] Upload completes in < 2 seconds
- [ ] OCR processing completes in < 10 seconds
- [ ] Page load time < 2 seconds
- [ ] No memory leaks (check browser DevTools)

---

## Security Verification

- [ ] Environment variables not exposed in client-side code
- [ ] Service role key not accessible from client
- [ ] File uploads restricted to image types
- [ ] File size limits enforced (if implemented)

---

## Supabase Verification

### Storage

- [ ] Files uploaded to `documents` bucket
- [ ] Files stored in correct path: `{userId}/{timestamp}-{filename}`
- [ ] Files accessible via signed URLs (if private bucket)

### Database

- [ ] Document records created in `documents` table
- [ ] Status updates correctly (new → processing → completed)
- [ ] OCR data saved in `ocr_data` JSONB column
- [ ] Error messages saved in `error_message` column (if failed)

### RLS Policies

- [ ] Service role can upload files
- [ ] Service role can read files
- [ ] Authenticated users can upload to their own folder

---

## Monitoring Setup

### Vercel Logs

- [ ] Check Function logs for errors
- [ ] Monitor execution time
- [ ] Check memory usage

### Error Tracking

- [ ] Sentry errors captured (if configured)
- [ ] Error notifications working
- [ ] Error context includes relevant data

---

## Production Readiness Checklist

- [ ] All automated tests pass
- [ ] All manual tests pass
- [ ] Performance meets requirements
- [ ] Security verified
- [ ] Monitoring configured
- [ ] Error handling works
- [ ] Documentation complete

---

## Known Issues

Document any issues found during verification:

1. **Issue**: [Description]
   - **Severity**: Critical / High / Medium / Low
   - **Status**: Open / Fixed / Deferred
   - **Workaround**: [If applicable]

2. **Issue**: [Description]
   - **Severity**: Critical / High / Medium / Low
   - **Status**: Open / Fixed / Deferred
   - **Workaround**: [If applicable]

---

## Sign-Off

**Verified by**: [Name]  
**Date**: [Date]  
**Status**: ✅ Ready for Production / ⚠️ Needs Fixes / ❌ Not Ready

**Notes**:
[Any additional notes or observations]

