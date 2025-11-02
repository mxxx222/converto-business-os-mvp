# ⚠️ DNS FIX REQUIRED - converto.fi SSL Error

## 🚨 Problem

**SSL ERROR:** `SSL_ERROR_NO_CYPHER_OVERLAP` on `converto.fi`

**Root Cause:** DNS still points to **DELETED Render services**

## 🔍 Current DNS (WRONG)

```
converto.fi         → A:      216.24.57.1 (Render IP)
www.converto.fi     → CNAME: converto-marketing.onrender.com
```

**Status:** ❌ Both Render services are **DELETED**

## ✅ Fix Required

### Step 1: Login to hostingpalvelu.fi
- URL: https://hostingpalvelu.fi
- Domain: converto.fi
- Tool: DNS Zone Editor

### Step 2: Update DNS Records

#### Change converto.fi A record:
```
FROM: 216.24.57.1
TO:   76.76.21.21
```

#### Change www CNAME:
```
FROM: converto-marketing.onrender.com
TO:   cname.vercel-dns.com
```

### Step 3: Verify
```bash
dig converto.fi
dig www.converto.fi
```

Expected results:
- converto.fi resolves to 76.76.21.21
- www.converto.fi resolves to cname.vercel-dns.com

### Step 4: Wait for Propagation
DNS changes take 5-15 minutes to propagate globally.

### Step 5: Test
```bash
curl -I https://converto.fi
```

Expected: 200 OK

---

## 📊 Status

**Vercel:**
- Project: marketing
- Deployment: Ready
- Domains: Configured in Vercel
- Issue: DNS not pointing to Vercel

**Render:**
- All services: DELETED
- Status: No longer exist

---

**Action Required:** Manual DNS update at hostingpalvelu.fi
