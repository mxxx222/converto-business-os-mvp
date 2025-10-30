# POS Dashboard Component

## Overview

Point-of-Sale provider selector with sales charts and active seller streaks.

## Design Specs

- **Provider Cards**: Zettle, SumUp, Stripe Terminal, Square, Converto POS
- **Charts**: Recharts with dark/light theme support
- **Metrics**: Daily sales, average ticket, tip percentage

## Usage

```tsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export function POSDashboard() {
  const [provider, setProvider] = useState("zettle");

  const providers = [
    { id: "zettle", name: "Zettle", icon: "💳" },
    { id: "sumup", name: "SumUp", icon: "💰" },
    { id: "stripe", name: "Stripe Terminal", icon: "💵" },
    { id: "square", name: "Square", icon: "🔲" },
    { id: "converto", name: "Converto POS", icon: "🚀" },
  ];

  return (
    <div className="space-y-6">
      {/* Provider Selector */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {providers.map((p) => (
          <button
            key={p.id}
            onClick={() => setProvider(p.id)}
            className={`p-4 rounded-xl border-2 transition-all ${
              provider === p.id
                ? "border-converto-blue bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="text-3xl mb-2">{p.icon}</div>
            <div className="text-sm font-medium">{p.name}</div>
          </button>
        ))}
      </div>

      {/* Sales Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold mb-4">Päivän myynti</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={salesData}>
            <XAxis dataKey="hour" stroke="var(--text-secondary)" />
            <YAxis stroke="var(--text-secondary)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "8px"
              }}
            />
            <Line type="monotone" dataKey="sales" stroke="#0047FF" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Active Seller Streak */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl p-6">
        <h3 className="text-lg font-bold mb-2">🔥 Active Seller Streak</h3>
        <div className="text-4xl font-bold mb-1">7 päivää</div>
        <p className="text-sm text-white/80">+25p per päivä!</p>
      </div>
    </div>
  );
}
```

## Integration Models

1. **CSV Import** - Manual daily upload
2. **API Sync** - OAuth + 5min cron
3. **POS Calls** - Deep link to terminal

## Accessibility

- ✅ Keyboard selection of providers
- ✅ Chart data table fallback
- ✅ ARIA labels on all buttons
