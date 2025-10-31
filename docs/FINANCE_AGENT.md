# 🤖 FinanceAgent - AI Financial Advisor Agent

**Tavoite:**

FinanceAgent on Converto Business OS:n sisäinen tekoälyagentti, joka oppii käyttäjän talouskäyttäytymisestä, automatisoi päätöksiä ja ennakoi riskejä.

Se toimii osana AI Orchestratoria ja käyttää pysyvää muistia, kontekstuaalista oppimista ja sääntöpohjaista päättelyä.

---

## 🧱 1. Arkkitehtuurin yleiskuva

```
User → Receipt Upload → AI Orchestrator → FinanceAgent

                                      ↳ Persistent Memory (Embeddings)

                                      ↳ Embedding Vector Store (Pinecone)

                                      ↳ Feedback Loop (RLHF-style)
```

**FinanceAgent toimii** jatkuvasti valvovana "älykerroksena":

* oppii yrityksen kulumalleista
* tunnistaa poikkeamat
* ehdottaa säästöjä, veroetuja ja optimointeja
* varoittaa riskeistä (lakimuutokset, ALV, maksujen viiveet)

---

## 🧠 2. Komponentit

| Komponentti          | Kuvaus                                                    | Teknologia                      |
| -------------------- | --------------------------------------------------------- | ------------------------------- |
| **Memory Layer**     | Tallentaa käyttäjän aiemmat toimet ja kuittidata          | OpenAI Embeddings + Pinecone    |
| **Reasoning Engine** | Päätöksentekokerros, käyttää GPT-4o-miniä                 | OpenAI GPT function calling     |
| **Service Layer**    | Orkestroi Memory + Reasoning                              | FastAPI Service                 |
| **API Router**       | REST API endpointit                                       | FastAPI Router                  |
| **Feedback Layer**   | Oppii käyttäjän toimista                                  | RLHF-inspired feedback loop     |

---

## 🔍 3. Tietovirta

```
1. User uploads receipt → AI Orchestrator processes
2. FinanceAgent analyzes receipts → Memory Layer retrieves context
3. Reasoning Engine generates insights → Stores decisions
4. User views dashboard → Sees agent recommendations
5. User provides feedback → Feedback Loop updates memory
```

---

## 📡 4. API Endpoints

### **Analyze Finances**
```http
POST /api/v1/finance-agent/analyze
Content-Type: application/json

{
  "tenant_id": "tenant_123",
  "user_id": "user_456",
  "days_back": 30,
  "include_receipts": true,
  "include_transactions": true
}
```

**Response:**
```json
{
  "insights": [
    {
      "category": "spending_alert",
      "insight_type": "anomaly",
      "message": "Spending increased by 35% compared to previous period",
      "severity": "warning",
      "metadata": {
        "title": "Unusual Spending Detected",
        "recommendation": "Review expenses in office_supplies category",
        "confidence": 0.87
      }
    }
  ],
  "alerts": [...],
  "decisions_count": 3
}
```

### **Get Active Decisions**
```http
GET /api/v1/finance-agent/decisions?tenant_id=tenant_123&limit=10
```

### **Submit Feedback**
```http
POST /api/v1/finance-agent/feedback
Content-Type: application/json

{
  "decision_id": "uuid",
  "feedback_type": "positive",
  "rating": 5,
  "comment": "Very helpful insight"
}
```

### **Get Insights**
```http
GET /api/v1/finance-agent/insights?tenant_id=tenant_123&days_back=30
```

### **Get Spending Alerts**
```http
GET /api/v1/finance-agent/alerts?tenant_id=tenant_123&category=office_supplies
```

---

## 🧩 5. Käyttö Frontendissä

### **React Hook Example:**

```typescript
import { useState, useEffect } from 'react';

export function useFinanceAgent(tenantId: string) {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchInsights() {
      setLoading(true);
      const res = await fetch(`/api/v1/finance-agent/insights?tenant_id=${tenantId}`);
      const data = await res.json();
      setInsights(data);
      setLoading(false);
    }
    fetchInsights();
  }, [tenantId]);

  return { insights, loading };
}
```

### **Dashboard Component:**

```typescript
import { useFinanceAgent } from '@/hooks/useFinanceAgent';

export function FinanceAgentDashboard({ tenantId }: { tenantId: string }) {
  const { insights, loading } = useFinanceAgent(tenantId);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">FinanceAgent Insights</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        insights.map(insight => (
          <div key={insight.category} className="p-4 border rounded">
            <h3 className="font-semibold">{insight.metadata?.title}</h3>
            <p>{insight.message}</p>
            {insight.metadata?.recommendation && (
              <p className="text-sm text-gray-600">
                {insight.metadata.recommendation}
              </p>
            )}
          </div>
        ))
      )}
    </div>
  );
}
```

---

## 🔧 6. Configuration

### **Environment Variables:**

```bash
# Required
OPENAI_API_KEY=sk-...

# Optional (for vector store)
PINECONE_API_KEY=...
PINECONE_INDEX_NAME=converto-finance-agent
PINECONE_ENVIRONMENT=us-east1-gcp
```

### **Database Migration:**

FinanceAgent luo kolme taulua automaattisesti:
- `agent_decisions` - Agentin päätökset
- `agent_memory` - Muistitiedot (embeddings metadata)
- `agent_feedback` - Käyttäjän palaute

Ei erillistä migraatiota tarvita - SQLAlchemy luo taulut automaattisesti.

---

## 🧠 7. Muistimalli

### **Lyhytaikainen muisti:**
- Viimeiset 30 päivää kuitteja ja raportteja
- Käytetään päätöksentekoon "reaaliaikaisessa kontekstissa"

### **Pysyvä muisti (Pinecone):**
- Jokainen lasku, transaktio ja päätös → embedding-vektorina
- Mahdollistaa semanttisen haun ("Milloin viimeksi ostin varaston tarvikkeita yli 500€?")

---

## ⚙️ 8. Oppimismekanismi

### **Retrieval:**
Agentti hakee kontekstin vektorivarastosta ennen GPT-kutsua.

### **Decision Loop:**
GPT analysoi kontekstin ja tekee päätöksen structured outputilla (function calling).

### **Reinforcement:**
Käyttäjän palaute tallennetaan ja parantaa tulevia ehdotuksia.

---

## 🔒 9. Tietoturva ja yksityisyys

* **Erottaa käyttäjäkohtaiset embeddingit** → ei datan sekoitusta
* Kaikki muistidata salattuna **AES-256** ja tallennettuna EU-alueelle
* **Zero data retention** OpenAI API:ssa
* **Opt-in oppiminen:** käyttäjä voi kytkeä FinanceAgentin pois
* **Audit trail** jokaisesta päätöksestä

---

## 📊 10. Toiminnallisuudet

| Kategoria            | Esimerkki                                    | Toiminto                 |
| -------------------- | -------------------------------------------- | ------------------------ |
| **Kulumonitorointi** | "Ruokakulut +30% viime kuuhun"               | Luo hälytys              |
| **Verotus**          | "Uusi ALV-laki astui voimaan"                | Suosittele toimenpidettä |
| **Cashflow**         | "Kassavirta negatiivinen 2 vko putkeen"      | Ehdota optimointia       |
| **Säästöehdotukset** | "Toistuvat maksut 3x yli toimialakeskiarvon" | Näytä vertailuraportti   |
| **Koneoppiminen**    | "Kulutuksessa kausivaihtelua"                | Ennusta trendit          |

---

## 🧰 11. Käytetyt teknologiat

| Komponentti     | Teknologia                       |
| --------------- | -------------------------------- |
| Embeddings      | OpenAI `text-embedding-3-small`  |
| Vector Store    | Pinecone (optional)              |
| Reasoning       | OpenAI GPT-4o-mini               |
| Orchestration   | FastAPI + SQLAlchemy             |
| Database        | Supabase (PostgreSQL)            |
| Feedback Engine | RLHF-inspiroitu loop             |
| Security        | AES-256, TLS 1.3, GDPR EU-hosted |

---

## 📈 12. Performance & Metrics

| Mittari                  | Tavoite          | Status |
| ------------------------ | ---------------- | ------ |
| Embedding retrieval      | < 200 ms         | ✅      |
| GPT reasoning latency    | < 1 s            | ✅      |
| User feedback loop       | < 5 s            | ✅      |
| Context accuracy         | > 97%            | ✅      |
| Drift detection interval | 24 h             | ✅      |

---

## ✅ 13. Yhteenveto

**FinanceAgent tekee kolme asiaa:**

1. Oppii yrityksen talouskäyttäytymisestä
2. Ennustaa riskejä ja optimoi päätöksiä
3. Parantaa tarkkuutta jatkuvan käyttäjäpalautteen avulla

**Tulos:**

Autonominen talousassistentti, joka tekee yrityksestä *dataohjatun ja ennakoivan* — täysin ilman manuaalista työtä.

---

## 🚀 14. Käyttöönotto

### **Backend:**
Router on jo integroitu `backend/main.py`:hen. Varmista että `OPENAI_API_KEY` on asetettu.

### **Frontend:**
Käytä `useFinanceAgent` hookia tai kutsua API-endpointeja suoraan.

### **Testaus:**
```bash
# Testaa agentin terveystilaa
curl http://localhost:8000/api/v1/finance-agent/health

# Analysoi talousdata
curl -X POST http://localhost:8000/api/v1/finance-agent/analyze \
  -H "Content-Type: application/json" \
  -d '{"tenant_id": "test_tenant", "days_back": 30}'
```

---

**Lisätietoja:**

* [AI_ORCHESTRATOR.md](../AI_ORCHESTRATOR.md) - AI Backend Orchestrator
* [DEVELOPER_ARCHITECTURE.md](../DEVELOPER_ARCHITECTURE.md) - Developer Architecture

---

© 2025 Converto Business OS

