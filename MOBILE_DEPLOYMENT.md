# 📱 Mobile Deployment Guide - iOS & Android

Complete guide for deploying Converto Business OS to App Store and Google Play.

---

## 🚀 Quick Start

### Prerequisites
- [ ] Node.js 18+
- [ ] Xcode 15+ (iOS)
- [ ] Android Studio (Android)
- [ ] Apple Developer Account ($99/year)
- [ ] Google Play Developer Account ($25 one-time)
- [ ] CocoaPods: `sudo gem install cocoapods`
- [ ] Fastlane: `sudo gem install fastlane`

### Setup All Platforms
```bash
cd mobile
./scripts/setup-mobile.sh
```

---

## 🍎 iOS Deployment

### 1. Initial Setup
```bash
cd mobile
npm install
npx cap add ios
npx cap open ios
```

### 2. Configure Xcode
1. **Signing & Capabilities**
   - Team: Select your Apple Developer team
   - Bundle Identifier: `fi.converto.app`
   - Signing Certificate: Automatic

2. **App Icons**
   - Open `App/Assets.xcassets/AppIcon.appiconset`
   - Add icons: 1024×1024, 180×180, 167×167, 152×152, 120×120, etc.

3. **Info.plist**
   - Display Name: `Converto`
   - Version: `1.0.0`
   - Build: `1`

### 3. Fastlane Setup
```bash
cd ios
fastlane init

# Edit ios/fastlane/Appfile with your Apple ID
# Edit ios/fastlane/Fastfile (already configured)
```

### 4. Build & Upload
```bash
# TestFlight
cd ios
fastlane beta

# App Store (after TestFlight approval)
fastlane release
```

### 5. App Store Connect
1. Create app: https://appstoreconnect.apple.com
2. Fill metadata:
   - Name: Converto Business OS
   - Subtitle: AI-powered business management
   - Category: Business
   - Privacy Policy: https://converto.fi/privacy
   - Support URL: https://converto.fi/support
3. Add screenshots (6.7", 6.5", 5.5")
4. Submit for review

---

## 🤖 Android Deployment

### 1. Initial Setup
```bash
cd mobile
npm install
npx cap add android
```

### 2. Create Signing Keystore
```bash
cd mobile
./scripts/create-keystore.sh

# Save the password securely!
# Update android/gradle.properties with keystore info
```

### 3. Configure Build
Edit `android/app/build.gradle`:

```gradle
android {
  signingConfigs {
    release {
      storeFile file(System.getenv("RELEASE_STORE_FILE") ?: RELEASE_STORE_FILE)
      storePassword System.getenv("RELEASE_STORE_PASSWORD") ?: RELEASE_STORE_PASSWORD
      keyAlias System.getenv("RELEASE_KEY_ALIAS") ?: RELEASE_KEY_ALIAS
      keyPassword System.getenv("RELEASE_KEY_PASSWORD") ?: RELEASE_KEY_PASSWORD
    }
  }
  buildTypes {
    release {
      signingConfig signingConfigs.release
      minifyEnabled true
      shrinkResources true
    }
  }
}
```

### 4. Play Console Service Account
1. Go to: https://play.google.com/console
2. API Access → Create Service Account
3. Grant "Release Manager" role
4. Download JSON → save as `android/fastlane/play-service-account.json`

### 5. Fastlane Setup
```bash
cd android
fastlane init

# Edit android/fastlane/Appfile with package name
# Edit android/fastlane/Fastfile (already configured)
```

### 6. Build & Upload
```bash
# Internal testing
cd android
fastlane beta

# Production (after internal testing)
fastlane release

# Manual APK build
./gradlew assembleRelease
# Output: app/build/outputs/apk/release/app-release.apk
```

### 7. Play Console Setup
1. Create app: https://play.google.com/console
2. Fill store listing:
   - App name: Converto Business OS
   - Short description: AI-powered business management
   - Full description: [See template below]
   - Category: Business
   - Screenshots: 1080×1920 (phone), 1920×1200 (tablet)
   - Feature graphic: 1024×500
3. Content rating questionnaire
4. Privacy policy: https://converto.fi/privacy
5. Upload AAB via Fastlane or manually
6. Submit for review

---

## 🌐 PWA (Progressive Web App)

### Already Configured!
- ✅ `manifest.json` in `frontend/public/`
- ✅ Service worker `sw.js`
- ✅ Icons in `frontend/public/icons/`

### Test PWA
1. Open https://app.converto.fi in Chrome/Safari
2. Click "Add to Home Screen"
3. App opens in standalone mode

### Benefits
- No app store approval needed
- Instant updates
- Works on iOS & Android
- Offline support

---

## 🔗 Deep Linking (Android)

### AssetLinks Configuration
1. Get SHA-256 fingerprint:
```bash
keytool -list -v -keystore android-signing.keystore -alias converto
```

2. Update `frontend/public/.well-known/assetlinks.json`:
```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "fi.converto.app",
    "sha256_cert_fingerprints": ["YOUR_SHA256_HERE"]
  }
}]
```

3. Deploy to: `https://app.converto.fi/.well-known/assetlinks.json`

---

## 📊 Release Checklist

### iOS
- [ ] App icons added (all sizes)
- [ ] Screenshots captured (3 sizes)
- [ ] Privacy policy published
- [ ] Support URL active
- [ ] TestFlight build uploaded
- [ ] Internal testing complete
- [ ] App Store metadata filled
- [ ] Submitted for review

### Android
- [ ] Keystore created and backed up
- [ ] App icons added
- [ ] Screenshots captured
- [ ] Privacy policy published
- [ ] Service account JSON configured
- [ ] Internal track build uploaded
- [ ] Internal testing complete
- [ ] Play Console metadata filled
- [ ] Submitted for review

---

## 🔄 CI/CD Integration

### GitHub Actions Secrets
```bash
# iOS
APPLE_ID
APPLE_TEAM_ID
FASTLANE_PASSWORD
MATCH_PASSWORD

# Android
RELEASE_STORE_FILE (Base64 encoded keystore)
RELEASE_STORE_PASSWORD
RELEASE_KEY_ALIAS
RELEASE_KEY_PASSWORD
PLAY_JSON (Service account JSON)
```

### Workflow Example
```yaml
name: Mobile Deploy

on:
  push:
    tags:
      - 'v*'

jobs:
  ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup
        run: cd mobile && npm install
      - name: Deploy iOS
        run: cd mobile/ios && fastlane beta
        env:
          FASTLANE_PASSWORD: ${{ secrets.FASTLANE_PASSWORD }}

  android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup
        run: cd mobile && npm install
      - name: Decode keystore
        run: echo "${{ secrets.RELEASE_STORE_FILE }}" | base64 -d > android-signing.keystore
      - name: Deploy Android
        run: cd mobile/android && fastlane beta
        env:
          RELEASE_STORE_PASSWORD: ${{ secrets.RELEASE_STORE_PASSWORD }}
```

---

## 📝 Store Listing Templates

### App Description (iOS & Android)
```
Converto Business OS – AI-powered business management for Finnish entrepreneurs.

✨ FEATURES
• 🧾 Smart receipt scanning with AI
• 🧮 Automatic VAT calculations
• 📊 Real-time business insights
• ⚖️ Legal compliance tracking
• 💳 Integrated billing & subscriptions
• 🎮 Gamification & rewards

🚀 WHY CONVERTO?
• Save 10+ hours per month on admin tasks
• Reduce tax filing errors by 95%
• Get instant ROI insights
• Stay compliant with Finnish regulations

🇫🇮 MADE FOR FINLAND
Built specifically for Finnish businesses with local tax rules, Finlex integration, and Finnish language support.

💼 PRICING
• Lite: 29€/month – Basic features
• Pro: 49€/month – AI insights
• Insights: 99€/month – Full analytics

📞 SUPPORT
Email: tuki@converto.fi
Web: https://converto.fi
```

---

## 🆘 Troubleshooting

### iOS Build Fails
```bash
cd mobile/ios/App
pod install
pod update
```

### Android Build Fails
```bash
cd mobile/android
./gradlew clean
./gradlew build --stacktrace
```

### Keystore Issues
- Never commit keystore to Git
- Back up keystore securely (password manager + cloud storage)
- If lost, you cannot update the app (must create new app)

### App Rejected
- **iOS**: Check App Store Review Guidelines 3.1.3(b) for SaaS apps
- **Android**: Ensure privacy policy is accessible without login
- Both: Test thoroughly on real devices before submission

---

## 📚 Resources

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Fastlane Docs](https://docs.fastlane.tools/)
- [App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Play Console Help](https://support.google.com/googleplay/android-developer/)
- [PWA Checklist](https://web.dev/pwa-checklist/)

---

**🎉 Ready to ship! Questions? Check APP_STORE_GUIDE.md or open an issue.**
