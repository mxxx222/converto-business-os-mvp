# Phase 2B: JWT Authentication - Setup Guide

## ✅ Implementation Complete

Phase 2B JWT Authentication has been successfully implemented using Supabase Auth.

## 📋 What Was Implemented

### 1. Supabase Integration
- ✅ `lib/supabase.ts` - Supabase client configuration
- ✅ `lib/auth.ts` - AuthManager class with Supabase integration
- ✅ Updated to use `@supabase/ssr` (latest package)

### 2. Login Page
- ✅ `app/login/page.tsx` - Magic Link + Password authentication
- ✅ Two tabs: Magic Link (default) and Password
- ✅ Toast notifications for success/error states
- ✅ Loading states and form validation

### 3. Route Protection
- ✅ `middleware.ts` - Supabase session validation
- ✅ Protects `/dashboard/*` routes
- ✅ Redirects unauthenticated users to `/login`
- ✅ Redirects authenticated users away from `/login`

### 4. API Integration
- ✅ `lib/api.ts` - Updated to use Supabase session tokens
- ✅ Automatic token management (no localStorage)
- ✅ 401 error handling with redirect to login

### 5. Auth State Management
- ✅ `app/providers.tsx` - Auth state listener
- ✅ Auto-redirect on sign in/out
- ✅ Toaster component for notifications

### 6. Dashboard Integration
- ✅ `app/page.tsx` - Updated to use AuthManager
- ✅ Real logout functionality
- ✅ Session validation on mount

### 7. UI Components
- ✅ `components/ui/input.tsx` - Input component
- ✅ `components/ui/label.tsx` - Label component
- ✅ `components/ui/tabs.tsx` - Tabs component

## 🚀 Setup Instructions

### 1. Install Dependencies

Already installed:
```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 2. Configure Environment Variables

Create `.env.local` in `apps/dashboard/`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Where to get Supabase credentials:**
1. Go to https://supabase.com
2. Create a project or select existing one
3. Go to Settings → API
4. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Supabase Database Setup

#### Enable Authentication

Supabase Auth is enabled by default. You can configure it in:
- Supabase Dashboard → Authentication → Settings

#### Create Admin Users

**Option 1: Via Supabase Dashboard**
1. Go to Authentication → Users
2. Click "Add User" → "Create new user"
3. Enter email and password
4. Set user metadata (optional):
   ```json
   {
     "role": "super_admin",
     "name": "Admin User"
   }
   ```

**Option 2: Via SQL**
```sql
-- Create admin user (password will be set via email)
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES (
  'admin@docflow.fi',
  crypt('your-secure-password', gen_salt('bf')),
  NOW(),
  '{"role": "super_admin", "name": "Admin User"}'::jsonb
);
```

### 4. Test the Implementation

```bash
# Start development server
cd apps/dashboard
npm run dev

# Navigate to http://localhost:3000/dashboard
# → Should redirect to /login

# Test Magic Link:
# 1. Enter email
# 2. Click "Send Magic Link"
# 3. Check email for magic link
# 4. Click link → redirects to dashboard

# Test Password Login:
# 1. Switch to "Password" tab
# 2. Enter email + password
# 3. Click "Sign In"
# 4. Should redirect to dashboard
```

## 🔐 Authentication Flow

### Magic Link Flow
1. User enters email on login page
2. Supabase sends magic link to email
3. User clicks link in email
4. Supabase validates link and creates session
5. User redirected to `/dashboard`

### Password Flow
1. User enters email + password
2. Supabase validates credentials
3. Session created if valid
4. User redirected to `/dashboard`

### Session Management
- Access token: 15 minutes (Supabase default)
- Refresh token: 14 days (Supabase default)
- Auto-refresh: Handled automatically by Supabase
- Storage: HttpOnly cookies (secure, no localStorage)

## 🛡️ Security Features

- ✅ HttpOnly cookies (tokens not accessible via JavaScript)
- ✅ Automatic token refresh
- ✅ Session validation on every request
- ✅ Protected routes via middleware
- ✅ 401 error handling with auto-logout
- ✅ Multi-tab sync (auth state changes propagate)

## 📝 Testing Checklist

- [ ] Login page renders without errors
- [ ] Magic link tab sends email successfully
- [ ] Password tab authenticates correctly
- [ ] Redirect to /dashboard after login works
- [ ] Middleware protects /dashboard routes
- [ ] Middleware redirects logged-in users from /login
- [ ] Logout clears session and redirects to /login
- [ ] Token auto-refresh works (test by waiting 15+ min)
- [ ] Multi-tab sync works (login in one tab, other tabs update)
- [ ] Toast notifications show for all states
- [ ] TypeScript compiles with no errors

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- Check that `.env.local` exists in `apps/dashboard/`
- Verify variable names are correct (NEXT_PUBLIC_ prefix required)
- Restart dev server after adding env vars

### "No authentication token available"
- User is not logged in
- Session expired (should auto-refresh)
- Check Supabase dashboard → Authentication → Users

### Magic link not received
- Check spam folder
- Verify email in Supabase dashboard
- Check Supabase logs for errors
- Ensure email provider allows Supabase emails

### Password login fails
- Verify user exists in Supabase
- Check password is correct
- Verify email is confirmed (if email confirmation required)

## 📚 Next Steps

After Phase 2B is tested and working:

1. **Phase 2C**: Customer Management Table
2. **Phase 3**: Netvisor Export (requires authentication)

## 🔗 Related Documentation

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase SSR Guide](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Phase 2A: Live Document Table](./DEEPSEEK_API_USAGE.md)

