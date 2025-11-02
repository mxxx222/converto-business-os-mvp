# 🚨 DNS PÄIVITYS converto.fi → VERCEL

## ONGELMA:
```
$ dig converto.fi
216.24.57.1 ← DELETED Render IP! (ei toimi enää)
```

**converto.fi osoittaa vielä poistettuun Render-palvelimeen!**

---

## RATKAISU - KIRJAUDU HOSTINGPALVELU.FI:

### 1️⃣ SISÄÄN
**URL:** https://www.hostingpalvelu.fi/asiakkaat
**Kirjaudu:** Oma tili

### 2️⃣ DNS ZONE EDITORiin
**Polku:** Oma tili → converto.fi → DNS Zone Editor

### 3️⃣ MUUTA KOLME TIETUETTA:

#### A) converto.fi (root) A-tietue → CNAME:
```
POISTA TAI MUUTA:
Type: A
Name: @
Value: 216.24.57.1

LISÄÄ TAI KORVAA:
Type: CNAME
Name: @
Value: cname.vercel-dns.com
TTL: 3600
```

#### B) www.converto.fi CNAME:
```
POISTA TAI MUUTA:
Type: CNAME
Name: www
Value: converto-marketing.onrender.com

LISÄÄ TAI KORVAA:
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

#### C) Mail-tietueet (pitää olla):
```
Type: MX
Name: @
Priority: 10
Value: mx.zoho.com
TTL: 3600

Type: TXT
Name: @
Value: v=spf1 include:zoho.com ~all
TTL: 3600
```

### 4️⃣ TALLENNA
Klikkaa "Save" / "Tallenna"

### 5️⃣ ODOTA PROPAGOINTIA
**5-15 minuuttia**

### 6️⃣ TARKISTA:
```bash
dig converto.fi
# Pitäisi näyttää: cname.vercel-dns.com
# TAI Vercel IP:t: 66.33.60.129, 66.33.60.67
```

---

## KUN VALMIS:
```bash
curl -I https://converto.fi
# Pitäisi palauttaa: HTTP/2 200
```

**🎉 Sitten converto.fi toimii!**
