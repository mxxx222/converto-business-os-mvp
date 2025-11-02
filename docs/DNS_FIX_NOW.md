# 🚨 URGENT: DNS PÄIVITYS converto.fi TOIMIIN

## ✅ ONGELMA:

```bash
$ curl -I https://converto.fi
SSL_ERROR_NO_CYPHER_OVERLAP

$ dig converto.fi
216.24.57.1 ← DELETED Render IP!
```

**DNS osoittaa VIELÄ poistettuun Render-palvelimeen!**

## 🔧 RATKAISU - 5 MINUUTISSA:

### 1️⃣ KIRJAUDU hostingpalvelu.fi

**URL:** https://www.hostingpalvelu.fi/asiakkaat/index.php?rp=/login

**Tarvittava:**
- Domain: converto.fi
- Käyttäjätunnus/salasana

### 2️⃣ MENNÄ DNS-ZONEEDITORiin

**Polku:** Asiakassivut → Oma tili → converto.fi → DNS Zone Editor

### 3️⃣ MUUTA DNS-TIETUEET

#### converto.fi A-tietue:
```
NYKYINEN:
Type: A
Name: @
Value: 216.24.57.1

MUUTA:
Type: CNAME
Name: @
Value: cname.vercel-dns.com
TTL: 3600
```

#### www.converto.fi CNAME:
```
NYKYINEN:
Type: CNAME
Name: www
Value: converto-marketing.onrender.com

MUUTA:
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

### 4️⃣ ODOTA PROPAGOINTIA

DNS muutokset vaikuttaa **5-15 minuutissa**.

### 5️⃣ TARKISTA

```bash
# Odota 5 min, sitten:
dig converto.fi
dig www.converto.fi

# Pitäisi näyttää:
# cname.vercel-dns.com
# TAI Vercel IP:t: 66.33.60.129, 66.33.60.67
```

### 6️⃣ TESTAA

```bash
curl -I https://converto.fi
# Pitäisi palauttaa: 200 OK
```

---

## 🎯 STATUS:

- ✅ Vercel: Deployed ja valmis
- ✅ Git: Auto-deploy aktivoitu
- ✅ Render: Poistettu
- ⚠️  **DNS: VÄLTTÄMÄTTÖMÄSTI PÄIVITETTÄVÄ!**

---

**PÄIVITYS AJAN:** **5 min** ⏰
**DIFFICULTY:** **Helppo** (kirjautuminen + 2 tietueen muutos)
**CRITICAL:** **KYLLÄ** (sivusto ei toimi muuten!)

---

## 📞 TARVIKKO APUA?

Jos kirjautuminen ei toimi:
1. Tallenna tämä ohje
2. Avaa hostingpalvelu.fi manuaalisesti
3. Seuraa kohtia 2-3 edellä

**Kun DNS on päivitetty:** Sivusto toimii automaattisesti! 🎉
