# 🎮 Gamify Layer v2 - Smart Habit Economy

Complete guide for the AI-driven behavior optimization and reward system.

---

## 🎯 Overview

Gamify Layer v2 is not just "points" - it's an **AI-driven behavior optimization system** that rewards users for:
- **Financial responsibility** (paying invoices, managing expenses)
- **Learning & growth** (completing lessons, reading articles)
- **Health & wellness** (exercise, sleep tracking)
- **Productivity** (task completion, goal achievement)
- **Social engagement** (team collaboration, community participation)

### Key Features
- ✅ **Multi-category rewards** with weighted point system
- ✅ **Streak bonuses** (5% per day, max 50%)
- ✅ **Level progression** (dynamic leveling based on lifetime points)
- ✅ **Achievements** (unlockable badges and milestones)
- ✅ **Leaderboards** (competitive rankings)
- ✅ **Point spending** (redeem for rewards)

---

## 🚀 Quick Start

### 1. Record an Event

```bash
curl -X POST http://localhost:8000/api/v2/gamify/event \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_123",
    "category": "finance",
    "action": "paid_invoice",
    "value": 2.0,
    "metadata": {"invoice_amount": 150.00}
  }'
```

**Response:**
```json
{
  "id": "evt_a1b2c3d4",
  "user_id": "user_123",
  "category": "finance",
  "action": "paid_invoice",
  "value": 2.0,
  "points": 4.0,
  "created_at": "2025-10-12T10:30:00Z"
}
```

### 2. Get User Balance

```bash
curl http://localhost:8000/api/v2/gamify/balance/user_123
```

**Response:**
```json
{
  "user_id": "user_123",
  "total_points": 245.5,
  "lifetime_points": 1250.0,
  "streak_days": 7,
  "last_event": "2025-10-12T10:30:00Z",
  "level": 3,
  "next_level_points": 400.0,
  "achievements": ["first_step", "streak_3", "streak_7", "points_100", "points_500"]
}
```

### 3. Get User Events

```bash
curl http://localhost:8000/api/v2/gamify/events/user_123?limit=10
```

### 4. Get User Stats

```bash
curl http://localhost:8000/api/v2/gamify/stats/user_123
```

**Response:**
```json
{
  "user_id": "user_123",
  "total_events": 45,
  "events_by_category": {
    "finance": 20,
    "learning": 15,
    "productivity": 10
  },
  "points_by_category": {
    "finance": 800.0,
    "learning": 300.0,
    "productivity": 150.0
  },
  "best_streak": 7,
  "current_streak": 7,
  "achievements": ["first_step", "streak_3", "streak_7", "points_100", "points_500"]
}
```

### 5. Leaderboard

```bash
curl http://localhost:8000/api/v2/gamify/leaderboard?limit=10
```

---

## 📊 Point System

### Category Weights

| Category | Weight | Example Actions |
|----------|--------|-----------------|
| **Finance** | 2.0× | Paid invoice, expense tracking, budget adherence |
| **Learning** | 1.5× | Completed lesson, read article, passed quiz |
| **Health** | 1.2× | Exercise session, sleep tracking, meal logging |
| **Productivity** | 1.0× | Task completed, goal achieved, project milestone |
| **Social** | 0.8× | Team collaboration, community post, peer review |

### Streak Bonuses

- **Day 1-2:** No bonus
- **Day 3+:** +5% per day (max 50%)
- **Example:** 7-day streak = +35% bonus points

### Level Progression

- **Level 1:** 0-100 points
- **Level 2:** 100-200 points
- **Level 3:** 200-300 points
- **Level N:** (N-1) × 100 to N × 100 points

---

## 🏆 Achievements

| Achievement | Requirement | Reward |
|-------------|-------------|--------|
| **Ensimmäinen askel** | Record first event | Badge |
| **3 päivän putki** | 3-day streak | Badge + 10 bonus points |
| **Viikon voittaja** | 7-day streak | Badge + 25 bonus points |
| **Kuukauden mestari** | 30-day streak | Badge + 100 bonus points |
| **Sata pistettä** | 100 lifetime points | Badge |
| **Viisisataa** | 500 lifetime points | Badge |
| **Tuhat pistettä** | 1000 lifetime points | Badge + Special reward |

---

## 🔗 Integration Examples

### OCR Receipt Scanning

```python
# In OCR service after successful scan
from app.modules.gamify_v2.service import record_event
from app.models.gamify import GamifyEventIn

def on_ocr_success(user_id: str, receipt_data: dict):
    # Award points for scanning receipt
    record_event(GamifyEventIn(
        user_id=user_id,
        category="finance",
        action="scanned_receipt",
        value=1.0,
        metadata={"merchant": receipt_data.get("vendor")}
    ))
```

### Invoice Payment

```python
# In billing service after payment
def on_invoice_paid(user_id: str, invoice_amount: float):
    # Award points based on invoice amount
    value = min(invoice_amount / 100, 5.0)  # Max 5 points per invoice

    record_event(GamifyEventIn(
        user_id=user_id,
        category="finance",
        action="paid_invoice",
        value=value,
        metadata={"amount": invoice_amount}
    ))
```

### Task Completion

```python
# In task management system
def on_task_completed(user_id: str, task_priority: str):
    value_map = {"high": 3.0, "medium": 2.0, "low": 1.0}

    record_event(GamifyEventIn(
        user_id=user_id,
        category="productivity",
        action="completed_task",
        value=value_map.get(task_priority, 1.0),
        metadata={"priority": task_priority}
    ))
```

### Learning Module

```python
# In learning platform
def on_lesson_completed(user_id: str, lesson_duration_minutes: int):
    value = lesson_duration_minutes / 30  # 1 point per 30 minutes

    record_event(GamifyEventIn(
        user_id=user_id,
        category="learning",
        action="completed_lesson",
        value=value,
        metadata={"duration": lesson_duration_minutes}
    ))
```

---

## 🎨 Frontend Integration

### React Component Example

```tsx
"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface GamifyBalance {
  user_id: string;
  total_points: number;
  lifetime_points: number;
  streak_days: number;
  level: number;
  next_level_points: number;
  achievements: string[];
}

export default function GamifyWallet({ userId }: { userId: string }) {
  const [balance, setBalance] = useState<GamifyBalance | null>(null);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      const balanceRes = await fetch(`/api/v2/gamify/balance/${userId}`);
      const eventsRes = await fetch(`/api/v2/gamify/events/${userId}?limit=5`);

      setBalance(await balanceRes.json());
      setEvents(await eventsRes.json());
    }

    fetchData();
  }, [userId]);

  if (!balance) return <div>Loading...</div>;

  const progress = (balance.lifetime_points % 100) / 100 * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-gradient-to-br from-indigo-50 to-green-50 p-6 shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Gamify Wallet</h3>
        <span className="text-sm bg-indigo-100 px-2 py-1 rounded">
          Level {balance.level}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-3xl font-bold text-indigo-700">
          💰 {balance.total_points.toFixed(1)} pistettä
        </p>
        <p className="text-sm text-gray-600">
          Lifetime: {balance.lifetime_points.toFixed(0)} pistettä
        </p>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Progress to Level {balance.level + 1}</span>
          <span>{progress.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="bg-indigo-600 h-2 rounded-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🔥</span>
        <span className="font-semibold">
          {balance.streak_days} päivän putki
        </span>
      </div>

      <div className="border-t pt-4">
        <h4 className="text-sm font-semibold mb-2">Viimeisimmät tapahtumat</h4>
        <ul className="space-y-1">
          {events.map((e) => (
            <motion.li
              key={e.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm flex justify-between"
            >
              <span>{e.category} – {e.action}</span>
              <span className="text-green-600 font-semibold">
                +{e.points.toFixed(1)}p
              </span>
            </motion.li>
          ))}
        </ul>
      </div>

      {balance.achievements.length > 0 && (
        <div className="border-t pt-4 mt-4">
          <h4 className="text-sm font-semibold mb-2">Saavutukset</h4>
          <div className="flex flex-wrap gap-2">
            {balance.achievements.map((achievement) => (
              <span
                key={achievement}
                className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded"
              >
                🏆 {achievement}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
```

---

## 🔧 Configuration

### Environment Variables

```bash
# Optional: External gamification service
GAMIFY_EXTERNAL_API=https://gamify.example.com
GAMIFY_API_KEY=your_api_key_here

# Database (for production)
DATABASE_URL=postgresql://user:pass@localhost/converto
REDIS_URL=redis://localhost:6379
```

### Custom Category Weights

Edit `app/modules/gamify_v2/service.py`:

```python
CATEGORY_WEIGHTS = {
    "finance": 2.5,      # Increase finance weight
    "learning": 2.0,     # Increase learning weight
    "health": 1.5,
    "productivity": 1.0,
    "social": 1.0,
    "custom_category": 1.2,  # Add custom category
}
```

---

## 📈 Analytics & Insights

### Track Engagement

```python
from app.modules.gamify_v2.service import EVENTS, BALANCES

# Total events
total_events = len(EVENTS)

# Active users (events in last 7 days)
from datetime import datetime, timedelta
week_ago = datetime.utcnow() - timedelta(days=7)
active_users = len(set(e.user_id for e in EVENTS if e.created_at >= week_ago))

# Average points per user
avg_points = sum(b.lifetime_points for b in BALANCES.values()) / len(BALANCES)
```

### Export Data

```python
import json

# Export all events
with open("gamify_events.json", "w") as f:
    json.dump([e.dict() for e in EVENTS], f, default=str)

# Export balances
with open("gamify_balances.json", "w") as f:
    json.dump([b.dict() for b in BALANCES.values()], f, default=str)
```

---

## 🚀 Future Enhancements

### Planned Features
- [ ] **AI Recommendations** - Personalized suggestions based on behavior
- [ ] **Team Challenges** - Collaborative goals and competitions
- [ ] **Reward Marketplace** - Redeem points for real rewards
- [ ] **Social Features** - Share achievements, follow friends
- [ ] **Mobile Push Notifications** - Streak reminders, achievement alerts
- [ ] **Integrations** - Fitbit, Google Calendar, Notion, Slack
- [ ] **Advanced Analytics** - Behavior patterns, predictive insights
- [ ] **Customizable Rules** - Per-tenant gamification rules
- [ ] **Token Economy** - Blockchain-based rewards (P2E integration)

---

## 🐛 Troubleshooting

### Points not calculating correctly
- Check category weight in `CATEGORY_WEIGHTS`
- Verify event value is positive
- Ensure user_id is consistent

### Streak not incrementing
- Events must be on consecutive days (UTC timezone)
- Check `last_event` timestamp in balance
- Multiple events on same day don't increment streak

### Achievements not unlocking
- Check achievement thresholds in `ACHIEVEMENTS`
- Verify `_check_achievements()` logic
- Ensure balance is being updated

---

## 📞 Support

**Questions about Gamify v2?**
- Email: support@converto.fi
- Docs: https://docs.converto.fi/gamify-v2

---

**✅ Ready to optimize user behavior with AI-driven gamification!**
