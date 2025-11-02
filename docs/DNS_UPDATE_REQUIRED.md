# ⚠️ DNS UPDATE REQUIRED

## 🚨 Current Problem

**SSL ERROR:** `converto.fi` is getting SSL_ERROR_NO_CYPHER_OVERLAP because DNS still points to **deleted Render services**.

## 🔍 Current DNS Status

```
converto.fi         → A record → 216.24.57.1 (Render IP)
www.converto.fi     → CNAME → converto-marketing.onrender.com (DELETED!)
```

**Status:** ❌ Both pointing to deleted Render services

## ✅ Solution: Update DNS to Vercel

### Step 1: Get Vercel DNS Configuration

Domain is already configured in Vercel, but DNS records need to be updated.

**Check Vercel Dashboard:**
1. Go to https://vercel.com/maxs-projects-149851b4/marketing/settings/domains
2. Click on `converto.fi` and `www.converto.fi`
3. Vercel will show required DNS records

### Step 2: Update DNS at Hostingpalvelu.fi

**Login:** https://hostingpalvelu.fi
**Go to:** Domain Management → converto.fi → DNS Zone

**Update Records:**

#### For `www.converto.fi`:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

#### For `converto.fi`:
**Option A (Recommended):**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

**Option B (Alternative):**
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
TTL: 3600
```

### Step 3: Verify

After DNS update, check:
```bash
dig converto.fi
dig www.converto.fi
```

Should resolve to Vercel IPs, not Render IPs.

### Step 4: Wait for Propagation

DNS changes take 5-15 minutes to propagate globally.

### Step 5: Test SSL

After propagation:
```bash
curl -I https://converto.fi
curl -I https://www.converto.fi
```

Should return 200 OK, not SSL errors.

---

## 📝 Quick Reference

**Hostingpalvelu.fi:**
- URL: https://hostingpalvelu.fi
- Domain: converto.fi
- Nameservers: Already set to hostingpalvelu.fi

**Vercel Project:**
- URL: https://vercel.com/maxs-projects-149851b4/marketing
- Domains: converto.fi, www.converto.fi
- Status: Configured, waiting for DNS

**Expected DNS After Fix:**
- converto.fi → Vercel IP
- www.converto.fi → cname.vercel-dns.com
