# 📱 iOS App Store Deployment Guide - Converto Business OS

## Quick Overview
This guide shows how to wrap your Next.js web app in a native iOS container using **Capacitor** and publish to the App Store.

**Timeline:** 2-3 days (including Apple review)

---

## Prerequisites

### Required
- [ ] Apple Developer Account ($99/year) - https://developer.apple.com
- [ ] Mac with Xcode 15+ installed
- [ ] Domain with SSL (https://app.converto.fi)
- [ ] App icons (1024×1024 PNG)

### Optional but Recommended
- [ ] CocoaPods installed: `sudo gem install cocoapods`
- [ ] Fastlane for automation: `sudo gem install fastlane`

---

## Step 1: Create Capacitor Mobile Project

```bash
# In your project root
mkdir mobile
cd mobile

# Initialize Capacitor app
npm create @capacitor/app@latest

# Prompts:
# App name: Converto Business OS
# App ID: fi.converto.app
# Web assets directory: dist (we'll use remote URL)

cd converto-mobile
npm install
```

---

## Step 2: Configure Capacitor

Create `capacitor.config.ts`:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'fi.converto.app',
  appName: 'Converto',
  webDir: 'dist',
  server: {
    url: 'https://app.converto.fi',
    cleartext: false,
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#000000",
      showSpinner: false
    }
  }
};

export default config;
```

---

## Step 3: Add iOS Platform

```bash
# Build placeholder (not needed for remote URL mode)
npm run build || mkdir -p dist && echo "<h1>Loading...</h1>" > dist/index.html

# Add iOS platform
npx cap add ios

# Open in Xcode
npx cap open ios
```

---

## Step 4: Configure Xcode Project

### A) Signing & Capabilities
1. Select project in Xcode
2. Select target: `App`
3. **Signing & Capabilities** tab
4. Team: Select your Apple Developer team
5. Bundle Identifier: `fi.converto.app`

### B) App Icons
1. Open `App/Assets.xcassets/AppIcon.appiconset`
2. Drag & drop icons:
   - 1024×1024 (App Store)
   - 180×180 (iPhone)
   - 167×167 (iPad Pro)
   - 152×152 (iPad)
   - 120×120 (iPhone)
   - 87×87 (iPhone notification)
   - 80×80 (iPad notification)
   - 76×76 (iPad)
   - 60×60 (iPhone notification)
   - 58×58 (iPad notification)
   - 40×40 (iPad spotlight)
   - 29×29 (Settings)

### C) Info.plist Updates
Add these keys:

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
</dict>

<key>NSCameraUsageDescription</key>
<string>Käytetään kuittien skannaukseen</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>Käytetään kuittien valitsemiseen kuvagalleriasta</string>

<key>CFBundleDisplayName</key>
<string>Converto</string>

<key>CFBundleShortVersionString</key>
<string>1.0.0</string>

<key>CFBundleVersion</key>
<string>1</string>
```

---

## Step 5: Test on Device

### A) Connect iPhone
1. Connect iPhone via USB
2. Trust computer on iPhone
3. Xcode → Select device from top bar
4. Click ▶️ Run

### B) Fix "Untrusted Developer"
1. iPhone → Settings → General → VPN & Device Management
2. Trust your developer certificate

---

## Step 6: Create App Store Connect Entry

### A) Create App
1. Go to: https://appstoreconnect.apple.com
2. My Apps → ➕ New App
3. Platforms: iOS
4. Name: **Converto Business OS**
5. Primary Language: Finnish
6. Bundle ID: `fi.converto.app`
7. SKU: `converto-business-os-001`

### B) App Information
- **Category:** Business
- **Subcategory:** Productivity
- **Content Rights:** Does not contain third-party content
- **Age Rating:** 4+
- **Privacy Policy URL:** `https://converto.fi/privacy`
- **Support URL:** `https://converto.fi/support`

### C) Pricing
- **Price:** Free (with in-app subscriptions via web)
- **Availability:** Finland (expand later)

---

## Step 7: Prepare Screenshots

### Required Sizes
- **6.7" (iPhone 14 Pro Max):** 1290 × 2796 px
- **6.5" (iPhone 11 Pro Max):** 1242 × 2688 px
- **5.5" (iPhone 8 Plus):** 1242 × 2208 px

### Screenshots to Include
1. Dashboard with KPIs
2. OCR receipt scanning
3. VAT calculator results
4. Legal compliance dashboard
5. Billing/subscription page

### Tools
- Use iPhone Simulator: `Cmd+S` to save screenshot
- Or use Xcode → Debug → View Debugging → Capture View Hierarchy

---

## Step 8: Archive & Upload

### A) Archive Build
```bash
# In Xcode
1. Select "Any iOS Device (arm64)" as destination
2. Product → Archive
3. Wait for archive to complete (~5 min)
```

### B) Distribute to App Store
```bash
1. Window → Organizer
2. Select your archive
3. Click "Distribute App"
4. App Store Connect → Upload
5. Select signing: Automatically manage signing
6. Upload (wait ~10 min)
```

### C) Submit for Review
```bash
1. App Store Connect → My Apps → Converto
2. Select version (1.0.0)
3. Build → Select uploaded build
4. Add screenshots
5. App Review Information:
   - Demo account: pilot@converto.fi / DemoPass123
   - Notes: "B2B SaaS for Finnish businesses. Stripe payments handled via web."
6. Submit for Review
```

---

## Step 9: App Review Guidelines Compliance

### Critical Points
✅ **3.1.3(b) - Reader Apps:** If your app is primarily for consuming content purchased elsewhere (web), you can use Stripe.

✅ **3.2.2 - Subscriptions:** Since billing happens on web, no IAP needed.

✅ **4.0 - Design:** Native wrapper is acceptable if it provides value (offline capability, notifications).

✅ **5.1.1 - Privacy:** Include Privacy Policy and declare data collection.

### Common Rejection Reasons
❌ **Minimal functionality:** Add splash screen, loading states, offline message
❌ **Broken links:** Ensure all URLs work
❌ **Missing privacy policy:** Must be accessible without login
❌ **Crashes:** Test thoroughly on real devices

---

## Step 10: Fastlane Automation (Optional)

### Install Fastlane
```bash
cd mobile/converto-mobile/ios
fastlane init
```

### Fastfile
```ruby
default_platform(:ios)

platform :ios do
  desc "Build and upload to TestFlight"
  lane :beta do
    increment_build_number(xcodeproj: "App.xcodeproj")
    build_app(scheme: "App")
    upload_to_testflight(skip_waiting_for_build_processing: true)
  end

  desc "Build and upload to App Store"
  lane :release do
    increment_build_number(xcodeproj: "App.xcodeproj")
    build_app(scheme: "App")
    upload_to_app_store(
      submit_for_review: false,
      automatic_release: false
    )
  end
end
```

### Usage
```bash
# TestFlight
fastlane beta

# App Store
fastlane release
```

---

## Step 11: PWA Alternative (Bonus)

While waiting for App Store approval, enable PWA:

### Add to `frontend/public/manifest.json`:
```json
{
  "name": "Converto Business OS",
  "short_name": "Converto",
  "description": "AI-powered business management",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#6366f1",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Add to `frontend/app/layout.tsx`:
```tsx
<head>
  <link rel="manifest" href="/manifest.json" />
  <meta name="theme-color" content="#6366f1" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <link rel="apple-touch-icon" href="/icon-180.png" />
</head>
```

Users can now "Add to Home Screen" on iOS/Android!

---

## Timeline & Checklist

### Day 1: Setup
- [ ] Apple Developer account active
- [ ] Capacitor project created
- [ ] iOS platform added
- [ ] App runs on simulator
- [ ] App runs on real device

### Day 2: Prepare
- [ ] App icons added
- [ ] Screenshots captured
- [ ] Privacy policy published
- [ ] Support page created
- [ ] App Store Connect entry created

### Day 3: Submit
- [ ] Archive uploaded
- [ ] Metadata complete
- [ ] Submitted for review
- [ ] TestFlight build available for internal testing

### Week 1-2: Review
- [ ] App approved (or feedback addressed)
- [ ] Released to App Store
- [ ] Monitor crash reports
- [ ] Gather user feedback

---

## Android (Google Play) - Quick Guide

```bash
# Add Android platform
npx cap add android

# Open in Android Studio
npx cap open android

# Build APK
cd android
./gradlew assembleRelease

# Upload to Play Console
# https://play.google.com/console
```

**Faster approval:** Google Play review typically 1-3 days vs Apple's 1-2 weeks.

---

## Support & Resources

- **Capacitor Docs:** https://capacitorjs.com/docs
- **App Store Guidelines:** https://developer.apple.com/app-store/review/guidelines/
- **Fastlane Docs:** https://docs.fastlane.tools/
- **Icon Generator:** https://www.appicon.co/

---

**🚀 Ready to ship! Questions? Check PILOT_CHECKLIST.md or open an issue.**
