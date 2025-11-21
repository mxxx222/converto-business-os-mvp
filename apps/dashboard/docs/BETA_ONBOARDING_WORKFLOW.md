# Beta Customer Onboarding Workflow

This guide documents the complete onboarding process for beta customers in the DocFlow beta program.

## Overview

The beta onboarding process is designed to:
- Get customers up and running in 15 minutes
- Demonstrate value immediately
- Collect feedback for product improvement
- Build strong relationships with early adopters

## Onboarding Timeline

### Week 1: Initial Contact & Setup
- **Day 1**: Beta signup received → Send Mari story email
- **Day 2-3**: Schedule kickoff call (15 min)
- **Day 4-5**: Kickoff call + initial configuration
- **Day 6-7**: Customer tests with 5-10 documents

### Week 2: Integration & Feedback
- **Day 8-10**: Netvisor/ERP integration setup
- **Day 11-12**: First batch processing (20-50 documents)
- **Day 13-14**: Weekly feedback collection

## Onboarding Steps

### Step 1: Beta Signup Received

**Trigger**: Customer submits beta signup form

**Actions**:
1. ✅ Signup saved to `beta_signups` table (status: `pending`)
2. ✅ Mari story email sent automatically
3. ✅ Admin dashboard shows new signup in real-time

**Email Sequence**:
- **Email 1**: Mari story (sent immediately)
- **Email 2**: "Thank you for signing up" (sent 1 hour later)
- **Email 3**: "Access in 1-2 weeks" (sent 3 days later)

### Step 2: Initial Contact (Day 2-3)

**Goal**: Schedule kickoff call within 48 hours

**Process**:
1. Review signup details in admin dashboard
2. Check customer profile:
   - Monthly invoice volume
   - Document types
   - Start timeline
   - Company size
3. Send personalized Calendly link
4. Update `beta_signups.status` to `contacted`

**Calendly Link**: `https://calendly.com/docflow-beta/kickoff`

**Talking Points**:
- Welcome to beta program
- Confirm their needs match our solution
- Explain beta benefits (6 months free, priority support)
- Schedule 15-minute kickoff call

### Step 3: Kickoff Call (15 minutes)

**Agenda**:
1. **Introduction** (2 min)
   - Welcome & thank you
   - Beta program overview
   - What to expect

2. **Needs Assessment** (5 min)
   - Current document processing workflow
   - Pain points
   - Monthly volume
   - Integration needs (Netvisor, Procountor, etc.)

3. **Demo** (5 min)
   - Show dashboard
   - Upload sample document
   - Show OCR results
   - Explain integration options

4. **Next Steps** (3 min)
   - Send 5-10 test documents
   - Configure integration
   - Set up weekly feedback

**Checklist**:
- [ ] Customer understands beta program
- [ ] Test documents identified
- [ ] Integration method confirmed
- [ ] Feedback schedule agreed
- [ ] Next steps clear

**After Call**:
1. Update `beta_signups.status` to `onboarded`
2. Add notes to `beta_signups.notes`
3. Create customer account in Supabase
4. Send follow-up email with:
   - Dashboard access
   - Test document instructions
   - Integration setup guide

### Step 4: Test Document Processing (Day 4-7)

**Goal**: Customer processes 5-10 real documents

**Process**:
1. Customer uploads test documents via dashboard
2. Monitor processing in real-time
3. Review OCR accuracy with customer
4. Address any issues immediately

**Success Criteria**:
- ✅ All documents processed successfully
- ✅ OCR accuracy > 85%
- ✅ Customer sees value
- ✅ No blocking issues

**If Issues**:
- Immediate support response (< 1 hour)
- Troubleshoot together
- Document solution in notes

### Step 5: Integration Setup (Day 8-10)

**Goal**: Connect DocFlow to customer's accounting system

**Supported Integrations**:
- Netvisor (API)
- Procountor (API)
- Holvi (API)
- Zervant (API)
- Manual export (CSV/Excel)

**Process**:
1. Get API credentials from customer
2. Configure integration in dashboard
3. Test with 1-2 documents
4. Verify data flow
5. Enable automatic processing

**Checklist**:
- [ ] API credentials obtained
- [ ] Integration configured
- [ ] Test documents processed
- [ ] Data verified in accounting system
- [ ] Automatic processing enabled

### Step 6: First Batch Processing (Day 11-12)

**Goal**: Process 20-50 real documents

**Process**:
1. Customer uploads first batch
2. Monitor processing
3. Review results together
4. Collect feedback

**Metrics to Track**:
- Processing time per document
- OCR accuracy
- Error rate
- Customer satisfaction

### Step 7: Weekly Feedback Collection

**Goal**: Continuous improvement through feedback

**Process**:
1. Send weekly feedback form (automated)
2. Review feedback in admin dashboard
3. Prioritize improvements
4. Update customer on changes

**Feedback Form Questions**:
1. How satisfied are you with DocFlow? (1-10)
2. What's working well?
3. What needs improvement?
4. Any feature requests?
5. Would you recommend to others? (NPS)

## Demo Script

### Opening (30 seconds)
"Thanks for joining the beta program! I'm [Name], and I'll help you get started with DocFlow. This call will take about 15 minutes, and by the end, you'll have everything set up to process your first documents."

### Current Process (2 minutes)
"First, let's understand your current workflow. How do you process invoices today? What's the biggest pain point?"

**Listen for**:
- Manual data entry
- Time spent per document
- Error rate
- Integration needs

### Demo (5 minutes)
"Let me show you how DocFlow solves this. I'll upload a sample invoice..."

**Show**:
1. Upload document
2. OCR processing (real-time)
3. Extracted data (vendor, amount, date, VAT)
4. Review/edit interface
5. Integration options

### Value Proposition (2 minutes)
"With DocFlow, you'll:
- Save 80% of time on document processing
- Reduce errors by 95%
- Process documents in 3-5 seconds
- Automatic integration to your accounting system"

### Next Steps (2 minutes)
"Here's what happens next:
1. You'll get dashboard access today
2. Upload 5-10 test documents this week
3. We'll set up your integration next week
4. You'll process your first batch in 2 weeks"

### Q&A (3 minutes)
"Any questions? Great! I'll send you the access details and next steps via email right after this call."

## Feedback Collection

### Weekly Feedback Form

**Sent**: Every Monday at 9 AM

**Questions**:
1. **Satisfaction**: How satisfied are you with DocFlow? (1-10 scale)
2. **What's Working**: What features do you love?
3. **Improvements**: What needs to be better?
4. **Feature Requests**: What would make your life easier?
5. **NPS**: How likely are you to recommend DocFlow? (0-10)

### Feedback Review Process

1. **Collect**: All feedback saved to Supabase `beta_feedback` table
2. **Review**: Weekly review meeting (Fridays)
3. **Prioritize**: Rank improvements by impact
4. **Implement**: Add to product roadmap
5. **Update**: Inform customers of changes

## Success Metrics

### Customer Success Metrics
- **Time to First Value**: < 7 days
- **Processing Accuracy**: > 85%
- **Customer Satisfaction**: > 8/10
- **NPS Score**: > 50

### Product Metrics
- **Documents Processed**: Track per customer
- **OCR Accuracy**: Average confidence score
- **Error Rate**: < 5%
- **Processing Time**: < 5 seconds per document

## Troubleshooting

### Common Issues

**Issue**: OCR accuracy too low
- **Solution**: Review document quality, adjust OCR settings
- **Prevention**: Set document quality guidelines

**Issue**: Integration not working
- **Solution**: Verify API credentials, check logs
- **Prevention**: Test integration before going live

**Issue**: Customer not engaged
- **Solution**: Proactive check-in, offer additional support
- **Prevention**: Set clear expectations upfront

## Tools & Resources

### Admin Dashboard
- View all beta signups
- Track onboarding progress
- Monitor document processing
- Collect feedback

### Calendly
- Schedule kickoff calls
- Link: `https://calendly.com/docflow-beta/kickoff`

### Email Templates
- Mari story email (automated)
- Thank you email (automated)
- Kickoff follow-up (manual)
- Weekly feedback (automated)

## Next Steps

After successful onboarding:
1. ✅ Customer processing documents regularly
2. ✅ Integration working
3. ✅ Feedback being collected
4. ✅ Move to Phase 3: Metrics tracking

