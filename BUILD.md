# 🏗️ Building the APK

This guide shows you how to build the Android APK with Bluetooth printing support.

## Quick Build (Recommended)

Simply run the build script:

```bash
./build-apk.sh
```

This will:
1. Sync Capacitor changes to Android
2. Build the debug APK
3. Copy it to the root folder
4. Show installation instructions

## Manual Build

If you prefer to build manually:

```bash
# 1. Sync Capacitor
npm run cap:sync

# 2. Build APK
cd android
./gradlew assembleDebug

# 3. Copy to root
cp app/build/outputs/apk/debug/app-debug.apk ../
```

## APK Location

After building, the APK will be at:
```
/Users/satria/Documents/GitHub/pos-system/app-debug.apk
```

## Installing on Xiaomi Device

1. **Transfer APK** to your device (USB, AirDrop, or file sharing)
2. **Enable unknown sources**:
   - Settings → Additional settings → Privacy
   - Enable "Install unknown apps" for your file manager
3. **Tap the APK** file and follow prompts
4. **Grant permissions** when the app asks

## Post-Installation Setup

### 1. Pair Bluetooth Printer
```
Settings → Bluetooth → Turn ON
→ Tap "Pair new device"
→ Select "RPP02N"
→ Enter PIN: 0000 or 1234
```

### 2. Configure MIUI Settings (CRITICAL)
```
Settings → Apps → Manage apps → POS System
├─ Autostart: ON
├─ Battery saver: No restrictions
└─ Permissions → Nearby devices: Allow
```

### 3. Test Printing
1. Open POS app
2. Go to Dashboard → Sales
3. Click any sale → Print Receipt
4. Select "Bluetooth Printer"
5. Scan for printers → Select RPP02N
6. Click Print 🎉

## Troubleshooting

**Build fails with "npm: command not found"**
- Make sure Node.js is installed
- Try: `brew install node` (if you have Homebrew)

**Gradle build fails**
- Open Android Studio
- Let it sync/download dependencies
- Try building from Android Studio first

**APK won't install**
- Check "Install unknown apps" is enabled
- Uninstall old version first if upgrading

**Bluetooth printing doesn't work**
- Check printer is paired in Bluetooth settings
- Disable battery optimization (MIUI)
- Enable Autostart (MIUI)

## Build Variants

- **Debug APK**: `./gradlew assembleDebug` (for testing)
- **Release APK**: `./gradlew assembleRelease` (for production, requires signing)

The build script creates a debug APK which is perfect for testing.

## What's Included

✅ Native Bluetooth thermal printing (RPP02N)  
✅ Fixed mobile sidebar scrolling  
✅ ESC/POS receipt formatting (58mm paper)  
✅ Full POS functionality  
✅ Multi-language support  
✅ Theme switching (dark/light)  
✅ Audit logging  
✅ RBAC permissions  

---

For more details, see [`BLUETOOTH_PRINTING_GUIDE.md`](./BLUETOOTH_PRINTING_GUIDE.md)
