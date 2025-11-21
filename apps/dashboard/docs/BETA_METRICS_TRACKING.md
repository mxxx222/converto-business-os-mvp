# Beta Metrics Tracking Guide

This guide explains how to track and analyze metrics for beta customers in the DocFlow beta program.

## Overview

Tracking metrics helps us:
- Understand product usage
- Identify improvement opportunities
- Measure customer success
- Make data-driven decisions

## Key Metrics

### 1. Document Processing Metrics

**Documents Processed**
- Total documents processed per customer
- Documents per day/week/month
- Processing volume trends

**Query**:
```sql
SELECT 
  customer_name,
  COUNT(*) as total_documents,
  COUNT(*) FILTER (WHERE status = 'completed') as successful,
  COUNT(*) FILTER (WHERE status = 'error') as failed,
  AVG(ocr_confidence) as avg_confidence
FROM documents
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY customer_name
ORDER BY total_documents DESC;
```

**Processing Time**
- Average processing time per document
- P50, P95, P99 processing times
- Time to completion

**Query**:
```sql
SELECT 
  customer_name,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_processing_seconds,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (updated_at - created_at))) as p50,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (updated_at - created_at))) as p95
FROM documents
WHERE status = 'completed'
  AND created_at > NOW() - INTERVAL '30 days'
GROUP BY customer_name;
```

**OCR Accuracy**
- Average OCR confidence score
- Confidence distribution
- Low confidence documents

**Query**:
```sql
SELECT 
  customer_name,
  AVG(ocr_confidence) as avg_confidence,
  COUNT(*) FILTER (WHERE ocr_confidence < 0.7) as low_confidence_count,
  COUNT(*) FILTER (WHERE ocr_confidence >= 0.9) as high_confidence_count
FROM documents
WHERE status = 'completed'
  AND created_at > NOW() - INTERVAL '30 days'
GROUP BY customer_name;
```

### 2. Customer Engagement Metrics

**Active Users**
- Customers who processed documents in last 7 days
- Customers who processed documents in last 30 days
- Churn risk (no activity in 14+ days)

**Query**:
```sql
SELECT 
  customer_name,
  MAX(created_at) as last_activity,
  CASE 
    WHEN MAX(created_at) > NOW() - INTERVAL '7 days' THEN 'Active'
    WHEN MAX(created_at) > NOW() - INTERVAL '30 days' THEN 'At Risk'
    ELSE 'Churned'
  END as status
FROM documents
GROUP BY customer_name;
```

**Dashboard Usage**
- Login frequency
- Features used
- Time spent in dashboard

### 3. Error Metrics

**Error Rate**
- Percentage of documents that fail
- Error types distribution
- Error trends over time

**Query**:
```sql
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) FILTER (WHERE status = 'error') as errors,
  COUNT(*) as total,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'error') / COUNT(*), 2) as error_rate
FROM documents
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY date
ORDER BY date DESC;
```

**Error Types**
- Most common error messages
- Error patterns by document type
- Error resolution time

**Query**:
```sql
SELECT 
  error_message,
  COUNT(*) as count,
  COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as percentage
FROM documents
WHERE status = 'error'
  AND created_at > NOW() - INTERVAL '30 days'
GROUP BY error_message
ORDER BY count DESC
LIMIT 10;
```

### 4. User Satisfaction Metrics

**NPS (Net Promoter Score)**
- Weekly NPS from feedback forms
- NPS trends over time
- Promoters vs Detractors

**Query**:
```sql
SELECT 
  DATE_TRUNC('week', created_at) as week,
  AVG(nps_score) as avg_nps,
  COUNT(*) FILTER (WHERE nps_score >= 9) as promoters,
  COUNT(*) FILTER (WHERE nps_score <= 6) as detractors,
  COUNT(*) as total_responses
FROM beta_feedback
WHERE created_at > NOW() - INTERVAL '12 weeks'
GROUP BY week
ORDER BY week DESC;
```

**Satisfaction Score**
- Average satisfaction rating (1-10)
- Satisfaction trends
- Satisfaction by feature

**Query**:
```sql
SELECT 
  DATE_TRUNC('week', created_at) as week,
  AVG(satisfaction_score) as avg_satisfaction,
  COUNT(*) as responses
FROM beta_feedback
WHERE created_at > NOW() - INTERVAL '12 weeks'
GROUP BY week
ORDER BY week DESC;
```

## Admin Dashboard Views

### Weekly Review Dashboard

**Metrics to Review**:
1. **Processing Volume**
   - Total documents processed this week
   - Documents per customer
   - Week-over-week growth

2. **Performance**
   - Average processing time
   - OCR accuracy
   - Error rate

3. **Customer Health**
   - Active customers
   - At-risk customers
   - Churned customers

4. **Feedback**
   - NPS score
   - Satisfaction score
   - Feature requests

### Customer-Specific View

**Per Customer Metrics**:
- Total documents processed
- Processing accuracy
- Last activity date
- Satisfaction score
- Feedback summary

## Weekly Review Meeting

### Meeting Structure (30 minutes)

**1. Metrics Review (10 min)**
- Review key metrics from past week
- Identify trends
- Highlight successes

**2. Customer Health (10 min)**
- Review customer status
- Identify at-risk customers
- Plan interventions

**3. Product Improvements (10 min)**
- Review feedback
- Prioritize improvements
- Assign action items

### Meeting Template

```markdown
# Weekly Beta Review - [Date]

## Metrics Summary
- Documents Processed: [count]
- Average Processing Time: [time]
- OCR Accuracy: [%]
- Error Rate: [%]
- NPS: [score]

## Customer Health
- Active: [count]
- At Risk: [count]
- Churned: [count]

## Highlights
- [Success story]
- [Customer win]

## Issues
- [Issue 1]
- [Issue 2]

## Action Items
- [ ] [Action 1]
- [ ] [Action 2]
```

## Automated Reports

### Daily Summary Email

**Sent**: Every day at 8 AM

**Content**:
- Documents processed yesterday
- Error rate
- Customer activity
- Alerts/Issues

### Weekly Report Email

**Sent**: Every Monday at 9 AM

**Content**:
- Week-over-week metrics
- Customer health summary
- Top feedback items
- Product improvements

## Data Collection

### Database Tables

**documents**
- Processing metrics
- OCR accuracy
- Error tracking

**activities**
- System events
- Processing logs
- User actions

**beta_signups**
- Customer information
- Onboarding status
- Notes

**beta_feedback** (to be created)
- Weekly feedback
- NPS scores
- Satisfaction ratings
- Feature requests

### Feedback Collection

**Weekly Feedback Form**:
- Sent every Monday
- 5 questions
- Saved to `beta_feedback` table
- Analyzed in dashboard

## Visualization

### Recommended Tools

1. **Supabase Dashboard**
   - Real-time metrics
   - SQL queries
   - Table views

2. **Custom Dashboard** (Future)
   - Grafana + Prometheus
   - Custom charts
   - Automated alerts

3. **Spreadsheet** (Temporary)
   - Weekly exports
   - Manual analysis
   - Trend tracking

## Action Items

Based on metrics:

**High Error Rate**:
- Investigate error patterns
- Improve error handling
- Update documentation

**Low Satisfaction**:
- Reach out to customers
- Address pain points
- Implement improvements

**Low Engagement**:
- Proactive check-ins
- Offer additional support
- Identify blockers

## Next Steps

1. ✅ Set up metrics collection
2. ✅ Create admin dashboard views
3. ✅ Schedule weekly review meetings
4. ✅ Set up automated reports
5. ✅ Create feedback collection system

