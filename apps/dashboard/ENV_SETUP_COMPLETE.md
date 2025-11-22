# Environment Variables Setup - Status

**Date**: November 21, 2025  
**Status**: ✅ Partially Complete

---

## ✅ Variables Set

### NEXT_PUBLIC_APP_URL
- ✅ **Production**: `https://dashboard-w2g039q6y-maxs-projects-149851b4.vercel.app`
- ✅ **Preview**: `https://dashboard-w2g039q6y-maxs-projects-149851b4.vercel.app`
- ✅ **Development**: `http://localhost:3001`

### Supabase Variables (Already Set)
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`

---

## ⚠️ Missing Variable

### OPENAI_API_KEY
- ❌ **Not Set** - Required for OCR processing

**To add it, run:**

```bash
cd apps/dashboard
vercel env add OPENAI_API_KEY production
# Enter your OpenAI API key when prompted
```

**Or use the interactive script:**

```bash
cd apps/dashboard
./scripts/setup-env-vars.sh
```

**Get your OpenAI API key from:**
- https://platform.openai.com/api-keys
- Create a new key if needed
- Format: `sk-...`

---

## Quick Setup Command

```bash
# Add OPENAI_API_KEY to all environments
echo "sk-your-key-here" | vercel env add OPENAI_API_KEY production
echo "sk-your-key-here" | vercel env add OPENAI_API_KEY preview  
echo "sk-your-key-here" | vercel env add OPENAI_API_KEY development
```

---

## Verify Setup

```bash
cd apps/dashboard
vercel env list production | grep -E "(OPENAI|APP_URL|SUPABASE)"
```

---

## After Adding OPENAI_API_KEY

1. **Redeploy** to apply changes:
   ```bash
   vercel --prod
   ```

2. **Test** the OCR pipeline:
   - Visit: https://dashboard-w2g039q6y-maxs-projects-149851b4.vercel.app/test
   - Upload a test receipt
   - Verify OCR processing works

---

## Current Status

- ✅ `NEXT_PUBLIC_APP_URL` - Set
- ✅ Supabase variables - Set
- ❌ `OPENAI_API_KEY` - **Needs to be added**

**Next Step**: Add `OPENAI_API_KEY` using one of the methods above.

