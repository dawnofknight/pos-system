#!/bin/bash

# Build script for POS System APK with Bluetooth Printing
# Run this in Terminal to build the APK

set -e  # Exit on error

echo "🚀 Building POS System APK with Bluetooth Printing Support..."
echo ""

# Navigate to project directory
cd "$(dirname "$0")"

echo "📦 Step 1/4: Syncing Capacitor changes to Android..."
npm run cap:sync
echo "✅ Capacitor sync complete"
echo ""

echo "🔧 Step 2/4: Navigating to Android directory..."
cd android
echo "✅ In Android directory"
echo ""

echo "🏗️  Step 3/4: Building APK (this may take a few minutes)..."
./gradlew assembleDebug
echo "✅ APK build complete"
echo ""

echo "📋 Step 4/4: Copying APK to root folder..."
cp app/build/outputs/apk/debug/app-debug.apk ../app-debug.apk
echo "✅ APK copied to root folder"
echo ""

echo "🎉 Build complete!"
echo ""
echo "📱 APK Location: $(pwd)/../app-debug.apk"
echo "📦 APK Size: $(du -h ../app-debug.apk | cut -f1)"
echo ""
echo "✨ Features included:"
echo "   ✅ Native Bluetooth thermal printing (RPP02N)"
echo "   ✅ Fixed mobile sidebar scrolling"
echo "   ✅ ESC/POS receipt formatting (58mm)"
echo "   ✅ Full POS functionality"
echo ""
echo "📲 To install on your Xiaomi device:"
echo "   1. Transfer app-debug.apk to your device"
echo "   2. Enable 'Install from unknown sources' in Settings"
echo "   3. Tap the APK file to install"
echo ""
echo "⚙️  After installation:"
echo "   • Pair RPP02N printer in Android Bluetooth settings"
echo "   • Disable battery optimization for POS app (MIUI)"
echo "   • Enable Autostart for POS app (MIUI)"
echo ""
