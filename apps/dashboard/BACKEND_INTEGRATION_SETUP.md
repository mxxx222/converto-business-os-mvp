# Admin Dashboard Backend Integration - Setup Guide

## Overview

This guide explains how to set up the Supabase backend integration for the DocFlow Admin Dashboard. All mock data has been replaced with real Supabase queries and real-time subscriptions.

## Prerequisites

- Supabase project created
- Supabase project URL and API keys
- Node.js 18+ installed

## Setup Steps

### 1. Environment Variables

Create a `.env.local` file in `apps/dashboard/` with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# Service role key (server-side only, never expose to client)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Where to find these:**
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the Project URL → `NEXT_PUBLIC_SUPABASE_URL`
4. Copy the `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Copy the `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Database Schema Setup

Run the SQL migration script in your Supabase SQL Editor:

1. Open Supabase Dashboard → SQL Editor
2. Copy the contents of `apps/dashboard/supabase-schema.sql`
3. Paste and execute the script

This will create:
- `documents` table with all required columns
- `activities` table for real-time activity feed
- Indexes for performance
- Row Level Security (RLS) policies
- Realtime publication enabled for both tables

### 3. Enable Realtime in Supabase Dashboard

1. Go to Database → Replication
2. Ensure `documents` and `activities` tables are enabled for Realtime
3. If not enabled, toggle them on

### 4. Test Data (Optional)

To insert test data, uncomment the test data section in `supabase-schema.sql` and run it again, or manually insert:

```sql
-- Test documents
INSERT INTO public.documents (filename, status, customer_name, priority, type, size) VALUES
('invoice_acme_jan2025.pdf', 'completed', 'Acme Corporation', 'high', 'invoice', '2.1 MB'),
('receipt_techsolutions_123.pdf', 'processing', 'Tech Solutions Oy', 'medium', 'receipt', '1.2 MB');

-- Test activities
INSERT INTO public.activities (type, message, metadata) VALUES
('document.uploaded', 'New document uploaded: invoice_acme_jan2025.pdf', '{"document_id": "test-1"}'),
('document.completed', 'Document processed successfully', '{"document_id": "test-1"}');
```

### 5. Run the Application

```bash
cd apps/dashboard
npm install
npm run dev
```

Visit `http://localhost:3000` and log in with your admin credentials.

## Architecture

### Components Updated

1. **DocumentQueueManager** (`components/DocumentQueueManager.tsx`)
   - Uses `useDocuments()` hook for data fetching
   - Uses `useDocumentsRealtime()` for live updates
   - Uses `useDocumentsMutation()` for updates
   - Replaced all mock data with Supabase queries

2. **RealTimeActivity** (`components/RealTimeActivity.tsx`)
   - Uses `useActivities()` hook for data fetching
   - Uses `useActivitiesRealtime()` for live updates
   - Removed WebSocket dependency
   - Now uses Supabase Realtime subscriptions

3. **ConnectionStatus** (`components/ConnectionStatus.tsx`)
   - Updated to check Supabase connection instead of WebSocket
   - Shows connection status based on Supabase availability

### New Files Created

1. **`lib/api-client.ts`** - Supabase-based API client
   - Direct database queries
   - Real-time subscription methods
   - Type-safe interfaces

2. **`hooks/useDocuments.ts`** - React Query hooks for documents
   - `useDocuments()` - Query hook
   - `useDocumentsMutation()` - Mutation hook
   - `useDocumentsRealtime()` - Real-time subscription hook

3. **`hooks/useActivities.ts`** - React Query hooks for activities
   - `useActivities()` - Query hook
   - `useActivitiesRealtime()` - Real-time subscription hook

4. **`supabase-schema.sql`** - Database schema migration
   - Tables, indexes, RLS policies
   - Realtime configuration

### Updated Files

1. **`lib/supabase.ts`** - Enhanced with server-side and admin clients
2. **`app/providers.tsx`** - Removed WebSocketProvider
3. **`env.example`** - Added service role key

## Testing

### Manual Testing Checklist

- [ ] Documents load from Supabase
- [ ] Real-time updates work (insert a document in Supabase UI and see it appear)
- [ ] Status updates save correctly
- [ ] Activities feed shows new events
- [ ] No console errors
- [ ] Loading states display correctly
- [ ] Error handling works

### Test Real-time Updates

1. Open the dashboard in your browser
2. Open Supabase Dashboard → Table Editor → `documents`
3. Insert a new document:
   ```sql
   INSERT INTO public.documents (filename, status, customer_name, type) 
   VALUES ('test.pdf', 'pending', 'Test Customer', 'invoice');
   ```
4. The document should appear in the dashboard immediately (real-time)

5. Update a document status:
   ```sql
   UPDATE public.documents 
   SET status = 'processing' 
   WHERE filename = 'test.pdf';
   ```
6. The status should update in real-time in the dashboard

## Troubleshooting

### "Missing Supabase environment variables"
- Ensure `.env.local` exists in `apps/dashboard/`
- Check that all three environment variables are set
- Restart the dev server after adding env vars

### "No data from Supabase"
- Check RLS policies are set correctly
- Verify tables exist: `SELECT * FROM public.documents LIMIT 1;`
- Check browser console for errors

### "Real-time not working"
- Verify Realtime is enabled in Supabase Dashboard → Database → Replication
- Check that tables are added to `supabase_realtime` publication
- Verify network tab shows WebSocket connection to Supabase

### "Authentication errors"
- Check that user is logged in
- Verify JWT token is valid
- Check RLS policies allow authenticated users

## Next Steps

1. Deploy to Vercel/Render with environment variables
2. Set up production Supabase project
3. Configure production RLS policies
4. Add error monitoring (Sentry)
5. Performance testing with large datasets

## Support

For issues or questions, check:
- Supabase documentation: https://supabase.com/docs
- React Query documentation: https://tanstack.com/query/latest
- Next.js documentation: https://nextjs.org/docs

