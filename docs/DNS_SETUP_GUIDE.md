# 🌐 Converto.fi DNS Configuration Guide

**DNS-päivitys Vercel-suosituksen mukaan - Critical Path to Production**

---

## 🎯 **Tavoite**
- Converto.fi domain → Vercel deployment
- DNS propagation → Production ready
- Zero-downtime cutover

---

## 📋 **DNS Configuration Steps**

### **Step 1: Vercel DNS Recommendations**

Based on Vercel best practices, configure these DNS records:

```dns
# Primary Domain Configuration
Type: A
Name: @
Value: 76.76.19.61
TTL: 3600

# WWW Subdomain
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600

# Email Authentication (Resend)
Type: TXT
Name: @
Value: v=spf1 include:spf.resend.com ~all
TTL: 3600

# DMARC Policy
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@converto.fi; ruf=mailto:dmarc@converto.fi; fo=1
TTL: 3600

# DKIM Records
Type: CNAME
Name: resend._domainkey
Value: resend._domainkey.resend.com
TTL: 3600

Type: CNAME
Name: resend2._domainkey
Value: resend2._domainkey.resend.com
TTL: 3600

Type: CNAME
Name: resend3._domainkey
Value: resend3._domainkey.resend.com
TTL: 3600
```

---

## 🛠️ **DNS Provider Configuration**

### **Option 1: Cloudflare (Recommended)**
```bash
# If using Cloudflare:
# 1. Login to Cloudflare dashboard
# 2. Go to DNS → Records
# 3. Add/Update records as shown above
# 4. Set Proxy status: DNS only (gray cloud)
```

### **Option 2: Domain Registrar DNS**
```bash
# For GoDaddy, Namecheap, etc.:
# 1. Access DNS management panel
# 2. Add/Update A record to 76.76.19.61
# 3. Add/Update CNAME for www
# 4. Add TXT records for email authentication
```

---

## ⏱️ **Timeline & Expected Propagation**

### **DNS Propagation Schedule:**
- **0-2 hours**: A record propagation (Vercel hosting)
- **2-6 hours**: CNAME records for www
- **6-24 hours**: TXT records for email authentication
- **24-48 hours**: Full global propagation complete

### **Testing Points:**
```bash
# Test DNS resolution
nslookup converto.fi
nslookup www.converto.fi

# Test email authentication records
dig TXT converto.fi
dig CNAME resend._domainkey.converto.fi
```

---

## ✅ **Verification Checklist**

### **DNS Records Check:**
- [ ] A record: `@` → `76.76.19.61`
- [ ] CNAME record: `www` → `cname.vercel-dns.com`
- [ ] TXT record: SPF configured
- [ ] TXT record: DMARC policy active
- [ ] CNAME records: 3x DKIM records configured

### **Functional Tests:**
- [ ] Website loads at https://converto.fi
- [ ] www.converto.fi redirects properly
- [ ] SSL certificate issued automatically
- [ ] Email sending works from converto.fi
- [ ] Authentication-Results headers present

---

## 🔧 **Troubleshooting**

### **Common DNS Issues:**

1. **Website not loading after 2 hours**
   - Check A record points to `76.76.19.61`
   - Clear browser cache and try incognito
   - Use different DNS resolver (8.8.8.8)

2. **www subdomain not working**
   - Verify CNAME points to `cname.vercel-dns.com`
   - Check for conflicting A records

3. **Email authentication failing**
   - Verify TXT records match exactly
   - Check DMARC policy syntax
   - Test with mxtoolbox.com

### **Quick DNS Check Commands:**
```bash
# Test domain resolution
dig @8.8.8.8 converto.fi

# Test email authentication
dig @8.8.8.8 TXT converto.fi | grep spf
dig @8.8.8.8 TXT _dmarc.converto.fi | grep dmarc
```

---

## 📈 **Expected Results**

### **After Successful DNS Configuration:**
- **Website**: https://converto.fi → Vercel deployment
- **SSL**: Automatic certificate via Let's Encrypt
- **Performance**: Global CDN via Vercel Edge Network
- **Email**: Proper authentication and deliverability
- **Monitoring**: Ready for uptime checks

### **ROI Benefits:**
- **Performance**: Sub-100ms global load times
- **Reliability**: 99.99% uptime via Vercel
- **Email**: 99%+ deliverability with proper auth
- **Maintenance**: Zero server management required

---

## 🚀 **Next Steps After DNS**

1. **DNS Propagation Verification** (Wednesday 13.11)
2. **Uptime Monitoring Setup** (Thursday 14.11)
3. **Email Authentication Testing** (Thursday 14.11)
4. **Production Go-Live** (Friday 15.11)

---

**Status:** 📋 DNS configuration documented  
**Next:** Apply DNS changes → Wait for propagation → Verify functionality