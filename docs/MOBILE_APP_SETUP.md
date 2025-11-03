# 📱 MOBILE APP SETUP GUIDE

## React Native Mobile App for Converto Business OS

---

## 🏗️ PROJECT STRUCTURE

```
converto-mobile/
├── src/
│   ├── screens/
│   │   ├── Auth/
│   │   │   └── LoginScreen.tsx
│   │   ├── Dashboard/
│   │   │   ├── DashboardScreen.tsx
│   │   │   └── components/
│   │   ├── Receipts/
│   │   │   ├── ReceiptsScreen.tsx
│   │   │   ├── ReceiptUpload.tsx
│   │   │   └── ReceiptDetail.tsx
│   │   ├── Insights/
│   │   │   └── InsightsScreen.tsx
│   │   ├── Reports/
│   │   │   └── ReportsScreen.tsx
│   │   └── Settings/
│   │       └── SettingsScreen.tsx
│   ├── components/
│   │   ├── common/
│   │   └── dashboard/
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   ├── receipts.ts
│   │   │   ├── insights.ts
│   │   │   └── reports.ts
│   │   ├── supabase/
│   │   │   └── client.ts
│   │   └── analytics/
│   │       └── posthog.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useReceipts.ts
│   │   └── useInsights.ts
│   ├── store/
│   │   ├── authStore.ts
│   │   ├── receiptsStore.ts
│   │   └── appStore.ts
│   └── navigation/
│       ├── AppNavigator.tsx
│       ├── DashboardTabs.tsx
│       └── types.ts
├── App.tsx
├── package.json
└── README.md
```

---

## 📦 SETUP SCRIPT

```bash
#!/bin/bash
# setup-mobile.sh

# Create React Native project
npx create-expo-app converto-mobile --template blank-typescript

cd converto-mobile

# Install dependencies
npm install

npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install @supabase/supabase-js axios zustand
npm install react-native-gesture-handler react-native-reanimated
npm install react-native-safe-area-context react-native-screens
npm install expo-camera expo-image-picker
npm install @react-native-async-storage/async-storage

# Create folder structure
mkdir -p src/{screens/{Auth,Dashboard,Receipts,Insights,Reports,Settings},components/{common,dashboard},lib/{api,supabase,analytics},hooks,store,navigation}

echo "✅ Mobile app project created!"
```

---

## 🎯 KEY FEATURES

### 1. Auth Integration
- Supabase Auth
- Biometric login (TouchID/FaceID)
- Session management

### 2. Dashboard
- KPI widgets
- Recent receipts
- Quick actions

### 3. Receipts
- Camera upload
- OCR processing
- Receipt list & detail

### 4. Insights
- AI recommendations
- Spending alerts
- Charts & graphs

### 5. Reports
- PDF generation
- Export functionality
- Share reports

---

## 🚀 QUICK START

```bash
# Setup
./setup-mobile.sh

# Run iOS
npm run ios

# Run Android
npm run android

# Build
eas build --platform all
```

---

## 📊 TARGETS

- **iOS:** App Store launch (Week 4)
- **Android:** Play Store launch (Week 4)
- **Users:** +40% user base
- **Engagement:** +60% daily active users
- **Revenue:** +200% ROI

---

**Status:** Planning ✅ | **Next:** Setup project structure

