#!/bin/bash
# Complete mobile setup for Converto (iOS + Android)
# Usage: ./scripts/setup-mobile.sh

set -e

echo "📱 Setting up Converto Mobile (iOS + Android)"
echo ""

# Check prerequisites
command -v npm >/dev/null 2>&1 || { echo "❌ npm required"; exit 1; }
command -v pod >/dev/null 2>&1 || { echo "⚠️  CocoaPods not found (iOS builds will fail)"; }

# Install Capacitor dependencies
echo "📦 Installing Capacitor..."
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android

# Add platforms
echo ""
echo "🍎 Adding iOS platform..."
npx cap add ios

echo ""
echo "🤖 Adding Android platform..."
npx cap add android

# Sync
echo ""
echo "🔄 Syncing platforms..."
npx cap sync

echo ""
echo "✅ Mobile setup complete!"
echo ""
echo "📋 Next steps:"
echo ""
echo "iOS:"
echo "  1. Open Xcode: npx cap open ios"
echo "  2. Configure signing (Team, Bundle ID)"
echo "  3. Add app icons to Assets.xcassets"
echo "  4. Build & Archive: Product → Archive"
echo ""
echo "Android:"
echo "  1. Create keystore: ./scripts/create-keystore.sh"
echo "  2. Update gradle.properties with keystore info"
echo "  3. Open Android Studio: npx cap open android"
echo "  4. Build release: cd android && ./gradlew bundleRelease"
echo ""
echo "Fastlane (optional):"
echo "  iOS:     cd ios && fastlane beta"
echo "  Android: cd android && fastlane beta"
echo ""
