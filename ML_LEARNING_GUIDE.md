# 🧠 Self-Learning ML System - Complete Guide

## Overview

Converto™ Business OS includes a **self-improving AI system** that learns from user corrections and gets better over time.

**Key Features:**
- ✅ Learns from every user correction
- ✅ Retrains models automatically (nightly)
- ✅ Applies corrections in real-time
- ✅ Tracks accuracy improvements
- ✅ No manual training required

---

## 🔄 How It Works

### **1. User Interacts with AI**

```
User scans receipt
  ↓
AI classifies: "groceries" (92% confidence)
  ↓
User sees result with 👍👎 buttons
```

### **2. User Provides Feedback**

```
User clicks 👎 (incorrect)
  ↓
User corrects to: "restaurant"
  ↓
Feedback recorded to database
```

### **3. System Learns**

```
Nightly job runs (02:00)
  ↓
Collect all feedback samples
  ↓
Retrain correction model
  ↓
Save improved model
```

### **4. Next User Gets Better Result**

```
Similar receipt scanned
  ↓
AI says "groceries" (92%)
  ↓
Self-correction kicks in
  ↓
Corrected to "restaurant" (95% learned confidence)
  ↓
User sees correct result!
```

---

## 🎯 Use Cases

### **1. OCR Classification**

**Scenario:** AI misclassifies receipt vendor

**Before:**
```
Receipt: "Ravintola Savoy 45.00€"
AI: "groceries" ❌
User: Corrects to "restaurant" ✓
```

**After Learning:**
```
Receipt: "Ravintola Elite 52.00€"
AI: "groceries" (initial)
Self-Correct: "restaurant" (learned)
Result: "restaurant" ✅ (no user correction needed!)
```

### **2. VAT Rate Detection**

**Scenario:** AI picks wrong VAT rate

**Before:**
```
Item: "Ruokapalvelu"
AI: 14% ❌
User: Corrects to 14% for restaurant, 14% for takeaway ✓
```

**After Learning:**
```
Item: "Ravintola-annos"
AI: 14% ✅ (learned from corrections)
```

### **3. Legal Rule Interpretation**

**Scenario:** AI misinterprets law change

**Before:**
```
Rule: "Uusi ALV-muutos 2025"
AI: "No changes" ❌
User: Corrects to "24% → 25.5%" ✓
```

**After Learning:**
```
Rule: "ALV-päivitys 2026"
AI: Checks for rate changes (learned behavior) ✅
```

---

## 📊 Accuracy Improvements Over Time

### **Example: OCR Classification**

| Week | Samples | Accuracy | Improvement |
|------|---------|----------|-------------|
| Week 0 | 0 | 85% (AI baseline) | — |
| Week 1 | 50 | 87% | +2% |
| Week 4 | 200 | 92% | +7% |
| Week 8 | 500 | 95% | +10% |
| Week 12 | 1000 | 97% | +12% |

**Result:** After 3 months, AI is 12% more accurate!

---

## 🔧 Implementation

### **Backend Integration:**

```python
# In any API endpoint that uses AI
from app.ml.self_correct import correct_prediction

# Get AI result
ai_result = ai.classify(text)
ai_confidence = 0.92

# Apply learned corrections
corrected_result, correction_confidence = correct_prediction(
    action="ocr_classify",
    features={"text": text, "text_length": len(text)},
    initial_result=ai_result,
    ai_confidence=ai_confidence
)

# Use corrected result
if correction_confidence:
    result = corrected_result
    confidence = correction_confidence
    was_corrected = True
else:
    result = ai_result
    confidence = ai_confidence
    was_corrected = False

return {
    "result": result,
    "confidence": confidence,
    "corrected_by_ml": was_corrected
}
```

### **Frontend Integration:**

```tsx
import { FeedbackButtons } from "@/components/FeedbackButtons";

export default function ResultCard({ result, confidence, features }) {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <h3>{result}</h3>
          <p className="text-sm text-gray-500">{confidence}% confidence</p>
        </div>

        <FeedbackButtons
          action="ocr_classify"
          featureVector={features}
          aiResult={result}
          aiConfidence={confidence / 100}
        />
      </div>
    </div>
  );
}
```

---

## 🎛️ Admin Dashboard

### **ML Statistics Page:**

```tsx
// frontend/app/admin/ml/page.tsx
"use client";
import { useEffect, useState } from "react";

export default function MLStatsPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch("/api/v1/ml/stats")
      .then(r => r.json())
      .then(setStats);
  }, []);

  const retrain = async () => {
    await fetch("/api/v1/ml/retrain-all", { method: "POST" });
    alert("Retraining started!");
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">ML Statistics</h1>

      {stats && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-sm text-gray-500">Total Samples</div>
              <div className="text-3xl font-bold">{stats.total_samples}</div>
            </div>

            <div className="p-4 bg-white rounded-lg border">
              <div className="text-sm text-gray-500">Correct</div>
              <div className="text-3xl font-bold text-green-600">
                {stats.correct}
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border">
              <div className="text-sm text-gray-500">Accuracy</div>
              <div className="text-3xl font-bold text-indigo-600">
                {(stats.accuracy * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          <button
            onClick={retrain}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retrain Models Now
          </button>
        </>
      )}
    </div>
  );
}
```

---

## 📈 Monitoring Improvements

### **Track Learning Progress:**

```python
# app/ml/analytics.py
from app.integrations.posthog_client import capture_event

def log_correction_applied(action: str, confidence: float, was_different: bool):
    """Log when self-correction is applied"""
    capture_event("ml_correction_applied", {
        "action": action,
        "confidence": confidence,
        "changed_result": was_different
    })

def log_model_retrained(action: str, samples: int, accuracy: float):
    """Log when model is retrained"""
    capture_event("ml_model_retrained", {
        "action": action,
        "training_samples": samples,
        "accuracy": accuracy
    })
```

---

## 🚀 Production Deployment

### **1. Database Migration**

```bash
# Create feedback_samples table
alembic revision --autogenerate -m "Add feedback_samples table"
alembic upgrade head
```

### **2. Create Models Directory**

```bash
mkdir -p models
# Ensure writable by app
chmod 755 models
```

### **3. Set Up Nightly Retraining**

**Option A: Render Cron Job**
```yaml
# render.yaml
services:
  - type: cron
    name: ml-retrain
    env: python
    schedule: "0 2 * * *"  # 02:00 daily
    buildCommand: pip install -r requirements.txt
    startCommand: python -m app.ml.retrain
```

**Option B: APScheduler (Already Implemented)**
```python
# app/main.py (already added)
from app.ml.retrain import schedule_retraining
schedule_retraining(interval_hours=24)
```

### **4. Monitor Learning**

**PostHog Dashboard:**
- Event: `ml_correction_applied`
- Metric: Correction rate over time
- Goal: Decreasing (fewer corrections needed)

**Sentry:**
- Alert if retraining fails
- Track model accuracy trends

---

## 🧪 Testing

### **Test Feedback Loop:**

```bash
# Submit feedback
curl -X POST http://localhost:8000/api/v1/ml/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "action": "ocr_classify",
    "feature_vector": {"text": "K-Market 24.50€"},
    "ai_result": "groceries",
    "ai_confidence": 0.92,
    "corrected_result": "groceries",
    "is_correct": true
  }'

# Check stats
curl http://localhost:8000/api/v1/ml/stats

# Manual retrain
curl -X POST http://localhost:8000/api/v1/ml/retrain-all
```

### **Test Self-Correction:**

```python
# In Python
from app.ml.self_correct import correct_prediction

result, confidence = correct_prediction(
    action="ocr_classify",
    features={"text": "Ravintola 45€"},
    initial_result="groceries",
    ai_confidence=0.85
)

print(f"Corrected: {result} ({confidence})")
# Should apply learned correction if model trained
```

---

## 💡 Advanced Features

### **1. Confidence Calibration**

Track how well AI confidence matches actual accuracy:

```python
# If AI says 90% confident but only 70% accurate
# → Calibrate confidence scores
```

### **2. Active Learning**

Ask user for feedback on uncertain predictions:

```python
if ai_confidence < 0.7:
    # Show "Please verify" banner
    # Collect more training data for edge cases
```

### **3. Multi-Model Ensemble**

Combine multiple models for better accuracy:

```python
# Ensemble: AI + Learned Corrections + Rules
final_result = ensemble_vote([ai_result, ml_result, rule_result])
```

### **4. Transfer Learning**

Share learned knowledge between tenants:

```python
# Aggregate corrections across all users
# Train global model
# Fine-tune per tenant if needed
```

---

## 📊 Success Metrics

### **Week 1:**
- [ ] 50+ feedback samples collected
- [ ] First model trained
- [ ] At least 1 correction applied

### **Month 1:**
- [ ] 500+ samples
- [ ] 3+ models trained
- [ ] 10%+ accuracy improvement
- [ ] 90%+ user satisfaction

### **Month 3:**
- [ ] 2000+ samples
- [ ] All action types covered
- [ ] 15%+ accuracy improvement
- [ ] Self-correction rate: 30%+

---

## 🎯 Next Steps

1. ✅ Deploy to Render (models/ directory persistent)
2. ✅ Add FeedbackButtons to all AI results
3. ✅ Monitor first week of feedback
4. ✅ Retrain manually after 50 samples
5. ✅ Enable automatic nightly retraining
6. ✅ Track improvements in PostHog
7. ✅ Celebrate when accuracy hits 95%+!

---

**🧠 Your AI That Learns and Improves - Automatically!**
