# Edge Function Monitoring Guide

This guide explains how to monitor the `process-document-ocr` Edge Function for production use.

## Monitoring Locations

### 1. Supabase Dashboard

**Path**: Supabase Dashboard → Edge Functions → `process-document-ocr` → Logs

**What to Check:**
- Function invocations
- Processing times
- Error messages
- OCR backend response times

**Key Metrics:**
- Invocation count
- Success rate
- Average execution time
- Error rate

### 2. Database Monitoring

**Documents Table**:
```sql
-- Check processing status
SELECT 
  status,
  COUNT(*) as count,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_processing_seconds
FROM documents
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY status;
```

**Activities Table**:
```sql
-- Check processing events
SELECT 
  type,
  COUNT(*) as count,
  MAX(created_at) as latest
FROM activities
WHERE created_at > NOW() - INTERVAL '24 hours'
  AND type LIKE 'document.%'
GROUP BY type
ORDER BY latest DESC;
```

### 3. Edge Function Logs Structure

The Edge Function logs include:
- Document ID being processed
- Processing start/end times
- OCR backend API calls
- Success/error status
- OCR confidence scores

## Key Metrics to Track

### Performance Metrics
- **Processing Time**: Time from `pending` → `completed`
- **OCR Backend Latency**: Time for OCR API response
- **Success Rate**: Percentage of documents processed successfully

### Error Metrics
- **Error Rate**: Percentage of documents that fail
- **Error Types**: Common error messages
- **Retry Success Rate**: Documents that succeed on retry

### Business Metrics
- **Documents Processed**: Total count per day/week
- **OCR Confidence Distribution**: Average confidence scores
- **Processing Volume**: Documents per hour/day

## Alerting Thresholds

### Critical Alerts
- Error rate > 10%
- Processing time > 60 seconds
- OCR backend unavailable

### Warning Alerts
- Error rate > 5%
- Processing time > 30 seconds
- OCR confidence < 50%

## Log Analysis

### Common Log Patterns

**Success Pattern:**
```
Processing INSERT for document abc-123: invoice.pdf
Calling OCR backend: https://docflow-admin-api.fly.dev/api/v1/documents/process
OCR result: {confidence: 0.92, ...}
Successfully processed document abc-123
```

**Error Pattern:**
```
Processing INSERT for document xyz-789: corrupted.pdf
Error processing document: OCR processing failed: 500 - Invalid file format
Updating document status to error
```

### Log Search Queries

**Find all errors:**
```
error OR failed OR exception
```

**Find slow processing:**
```
processing time > 30s
```

**Find OCR backend issues:**
```
OCR backend error OR OCR processing failed
```

## Monitoring Dashboard

### Recommended Setup

1. **Supabase Dashboard** (Real-time)
   - Edge Function logs
   - Database table views
   - Real-time subscriptions

2. **Custom Dashboard** (Optional)
   - Grafana + Prometheus
   - Custom metrics endpoint
   - Alerting rules

## Troubleshooting Common Issues

### Issue: Edge Function Not Triggering

**Check:**
1. Database trigger is active: `SELECT * FROM pg_trigger WHERE tgname = 'process_document_ocr_trigger';`
2. Documents have `status = 'pending'`
3. Edge Function is deployed: `supabase functions list`

### Issue: OCR Backend Timeout

**Check:**
1. OCR backend health: `curl https://docflow-admin-api.fly.dev/health`
2. Edge Function timeout settings
3. Network connectivity

### Issue: High Error Rate

**Check:**
1. Error messages in documents table
2. Edge Function logs for patterns
3. OCR backend logs for issues

## Best Practices

1. **Regular Monitoring**: Check logs daily during beta phase
2. **Set Up Alerts**: Configure alerts for critical errors
3. **Log Retention**: Keep logs for 30 days minimum
4. **Performance Baseline**: Establish baseline metrics
5. **Error Analysis**: Review errors weekly for patterns

## Next Steps

After monitoring is set up:
1. ✅ Track metrics for first week
2. ✅ Identify optimization opportunities
3. ✅ Set up automated alerts
4. ✅ Create weekly reports

