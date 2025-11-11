# 📱 Converto Mobile - iOS & Android

Native mobile wrapper for Converto Business OS using Capacitor.

## Quick Start

### Prerequisites
- Node.js 18+
- Xcode 15+ (for iOS)
- Android Studio (for Android)
- CocoaPods: `sudo gem install cocoapods`

### Setup

```bash
# Install dependencies
npm install

# Sync with native projects
npm run sync

# Open in Xcode
npm run ios

# Open in Android Studio
npm run android
```

## Configuration

The app loads the production web app from `https://app.converto.fi`.

To change the URL, edit `capacitor.config.ts`:

```typescript
server: {
  url: 'https://your-domain.com',
  cleartext: false
}
```

## Building for Production

### iOS

```bash
# Open Xcode
npm run ios

# In Xcode:
# 1. Select "Any iOS Device (arm64)"
# 2. Product → Archive
# 3. Distribute → App Store Connect
```

Or use Fastlane:

```bash
cd ios
fastlane beta    # TestFlight
fastlane release # App Store
```

### Android

```bash
# Open Android Studio
npm run android

# Build release APK
cd android
./gradlew assembleRelease

# Output: android/app/build/outputs/apk/release/app-release.apk
```

## App Store Submission

See [APP_STORE_GUIDE.md](../APP_STORE_GUIDE.md) for detailed instructions.

### Checklist
- [ ] App icons added (1024×1024 + all sizes)
- [ ] Screenshots captured (6.7", 6.5", 5.5")
- [ ] Privacy policy published
- [ ] Support URL active
- [ ] Demo account credentials provided
- [ ] App Store Connect metadata complete

## PWA Alternative

The web app also works as a Progressive Web App. Users can "Add to Home Screen" on iOS/Android without installing from stores.

## Troubleshooting

### iOS Build Fails
```bash
cd ios/App
pod install
pod update
```

### Android Build Fails
```bash
cd android
./gradlew clean
./gradlew build
```

### "Untrusted Developer" on iPhone
Settings → General → VPN & Device Management → Trust certificate

## Resources

- [Capacitor Docs](https://capacitorjs.com/docs)
- [iOS Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Android Guidelines](https://play.google.com/console/about/guides/)
