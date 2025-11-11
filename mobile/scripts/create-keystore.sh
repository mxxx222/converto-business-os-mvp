#!/bin/bash
# Create Android signing keystore for Converto app
# Usage: ./scripts/create-keystore.sh

set -e

KEYSTORE_FILE="android-signing.keystore"
ALIAS="converto"
VALIDITY=36500  # ~100 years

echo "🔐 Creating Android signing keystore..."
echo ""
echo "⚠️  IMPORTANT: Save the password securely!"
echo "   You'll need it for every release build."
echo ""

# Prompt for password
read -sp "Enter keystore password: " STORE_PASS
echo ""
read -sp "Confirm password: " STORE_PASS_CONFIRM
echo ""

if [ "$STORE_PASS" != "$STORE_PASS_CONFIRM" ]; then
    echo "❌ Passwords don't match!"
    exit 1
fi

# Generate keystore
keytool -genkey -v \
  -keystore "$KEYSTORE_FILE" \
  -alias "$ALIAS" \
  -keyalg RSA \
  -keysize 2048 \
  -validity $VALIDITY \
  -storepass "$STORE_PASS" \
  -keypass "$STORE_PASS" \
  -dname "CN=Converto, OU=Apps, O=Converto, L=Helsinki, C=FI"

echo ""
echo "✅ Keystore created: $KEYSTORE_FILE"
echo ""
echo "📋 SHA-256 fingerprint (needed for AssetLinks):"
keytool -list -v -keystore "$KEYSTORE_FILE" -alias "$ALIAS" -storepass "$STORE_PASS" | grep SHA256

echo ""
echo "📝 Update android/gradle.properties with:"
echo "   RELEASE_STORE_FILE=../$KEYSTORE_FILE"
echo "   RELEASE_STORE_PASSWORD=$STORE_PASS"
echo "   RELEASE_KEY_ALIAS=$ALIAS"
echo "   RELEASE_KEY_PASSWORD=$STORE_PASS"
echo ""
echo "⚠️  SECURITY: Add $KEYSTORE_FILE to .gitignore!"
echo "   Never commit keystores to version control."
