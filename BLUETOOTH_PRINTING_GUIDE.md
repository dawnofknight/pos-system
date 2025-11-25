# Bluetooth Thermal Printer Setup Guide (RPP02N)

Complete guide for setting up and using Bluetooth thermal printing with your RPP02N printer on Android devices, especially **Xiaomi (MIUI)** devices.

## 📱 Quick Start

### Step 1: Pair Your RPP02N Printer

1. **Turn on your RPP02N printer** and make sure it's in pairing mode
2. **On your Android device**:
   - Go to **Settings → Bluetooth**
   - Turn Bluetooth ON
   - Tap **"Pair new device"** or **"Search for devices"**
   - Look for **"RPP02N"** or similar name in the list
   - Tap on it to pair
   - If asked for PIN, try: **0000**, **1234**, or **8888**
3. **Confirm pairing** - You should see "Connected" or "Paired" status

### Step 2: Configure App Permissions (IMPORTANT for Xiaomi/MIUI)

On **Xiaomi devices with MIUI**, you MUST configure these settings or Bluetooth printing won't work:

1. **Go to**: Settings → Apps → Manage apps → **POS System**
2. **Enable Autostart**:
   - Find "Autostart" option
   - Turn it ON
3. **Disable Battery Optimization**:
   - Tap "Battery saver"
   - Select **"No restrictions"** or **"Unrestricted"**
4. **Grant Bluetooth Permissions**:
   - Tap "Permissions"
   - Find "Nearby devices" or "Bluetooth"
   - Set to **"Allow"** or **"Always allow"**

> **Why?** MIUI's aggressive battery optimization kills Bluetooth connections in the background. Disabling it ensures reliable printing.

### Step 3: Print Your First Receipt

1. Open the POS app
2. Go to **Dashboard → Sales**
3. Open any completed sale
4. Tap **"Print Receipt"**
5. Select **"Bluetooth Printer"**
6. Tap **"Scan for Bluetooth Printers"**
7. Select your **RPP02N** from the list
8. Tap **"Print"**
9. Your receipt should print! 🎉

---

## 🔧 Detailed Setup Instructions

### Printer Paper Specifications

- **Paper width**: 58mm (2.28 inches)
- **Paper type**: Thermal paper (no ink required)
- **Character width**: ~32 characters per line

### First Time Setup

#### A. Pairing the Printer (Detailed)

1. **Power on the RPP02N**:
   - Press and hold the power button
   - LED should light up (usually blue or green)
   - Some printers auto-enter pairing mode on first power-on

2. **Enter Pairing Mode** (if not automatic):
   - Some models: Hold power button for 5 seconds until LED flashes
   - Alternatively: Press the small reset button with a pin
   - Refer to your printer's manual for specific instructions

3. **Pair on Android**:
   - Settings → Bluetooth → Turn ON
   - Wait for "RPP02N" or "Bluetooth Printer" to appear
   - Tap to connect
   - Common PINs: 0000, 1234, 8888, or 1111

4. **Verify Connection**:
   - Status should show "Connected" or "Paired"
   - Note the MAC address (format: XX:XX:XX:XX:XX:XX)

#### B. App Permissions (Android 12+)

When you first use Bluetooth printing, Android will prompt for permissions:

1. **"Allow POS System to find, connect to, and determine the relative position of nearby devices?"**
   - Tap **"Allow"**
   
2. **"Allow POS System to access Bluetooth?"**
   - Tap **"Allow"** or **"While using the app"**

If you accidentally denied permissions:
- Go to Settings → Apps → POS System → Permissions
- Enable "Nearby devices" / "Bluetooth"

---

## 🚨 Troubleshooting

### Problem: Printer Not Found When Scanning

**Solutions:**

1. **Check Bluetooth is enabled**:
   - Settings → Bluetooth → ON
   
2. **Verify printer is paired**:
   - Settings → Bluetooth
   - RPP02N should be in "Paired devices" list
   - If not, pair it first

3. **Restart Bluetooth**:
   - Turn Bluetooth OFF, wait 5 seconds, turn ON again
   
4. **Restart the printer**:
   - Turn off, wait 10 seconds, turn back on

5. **Check distance**:
   - Keep printer within 10 meters (33 feet) of your device
   - Remove obstacles between device and printer

### Problem: "Connection Failed" or "Print Failed"

**Solutions:**

1. **Printer is off or out of battery**:
   - Charge the printer
   - Turn it on and try again

2. **Printer is connected to another device**:
   - Disconnect from other devices first
   - Turn off Bluetooth on other devices

3. **Bluetooth interference**:
   - Move away from WiFi routers, microwaves
   - Try in a different location

4. **Re-pair the printer**:
   - Settings → Bluetooth
   - Tap ⚙️ next to RPP02N → "Forget" or "Unpair"
   - Pair again from scratch

### Problem: Print is Cut Off or Garbled

**Solutions:**

1. **Wrong paper size**:
   - Ensure you're using 58mm thermal paper (not 80mm)

2. **Low battery**:
   - Charge the printer fully
   - Low battery can cause incomplete prints

3. **Dirty print head**:
   - Clean with isopropyl alcohol and soft cloth
   - Refer to printer manual for cleaning instructions

4. **Paper not loaded correctly**:
   - Remove and reload paper
   - Ensure paper feeds smoothly

### Problem: Permission Denied Errors

**Solutions:**

1. **Grant Bluetooth permissions**:
   - Settings → Apps → POS System → Permissions
   - Enable all Bluetooth/Nearby devices permissions

2. **For Xiaomi/MIUI users**:
   - Settings → Apps → Manage apps → POS System
   - **Autostart: ON**
   - **Battery saver: No restrictions**
   - **Permissions → Nearby devices: Allow**

3. **Restart the app** after granting permissions

### Problem: Prints on First Try, Then Fails

This is common on **Xiaomi/MIUI** devices due to battery optimization:

**Solution:**
1. Settings → Apps → Manage apps → POS System
2. Battery saver → **No restrictions**
3. Autostart → **ON**

This prevents MIUI from killing the Bluetooth connection.

---

## 📱 Device-Specific Instructions

### Xiaomi/MIUI Devices (CRITICAL)

Xiaomi's MIUI requires special configuration:

1. **Disable MIUI Optimization** (Optional but recommended):
   - Settings → Additional settings → Developer options
   - Turn OFF "MIUI optimization"
   - Restart device

2. **Battery Optimization**:
   - Settings → Battery & performance → Choose apps
   - Find POS System → **No restrictions**

3. **Autostart**:
   - Settings → Apps → Permissions → Autostart
   - Enable for POS System

4. **Permissions**:
   - Settings → Apps → Permissions → Other permissions
   - POS System → Enable all Bluetooth-related permissions

### Samsung Devices

1. Grant permissions when prompted
2. If using "Battery optimization", add POS System to "Unmonitored" apps

### OnePlus/OPPO/Realme Devices

1. Settings → Battery → Battery optimization
2. Find POS System → Don't optimize

### Stock Android/Pixel Devices

Usually works without additional configuration. Just grant permissions when prompted.

---

## 💡 Tips for Best Results

1. **Keep printer charged**: Low battery affects print quality
2. **Use quality thermal paper**: Cheap paper can jam or fade quickly
3. **Clean print head regularly**: Use isopropyl alcohol monthly
4. **Pair once, use forever**: Keep printer paired in Bluetooth settings
5. **Test print after pairing**: Do a test print to verify setup

---

## 🔍 Technical Details

### Bluetooth Connection
- **Protocol**: Bluetooth 2.0/3.0 SPP (Serial Port Profile)
- **UUID**: 00001101-0000-1000-8000-00805f9b34fb
- **Range**: Up to 10 meters (33 feet)
- **Pairing**: One-time setup

### ESC/POS Commands
The app uses industry-standard ESC/POS commands:
- Printer initialization
- Text alignment (left, center, right)
- Font sizing (normal, large)
- Bold text
- Paper feed and cut

### Supported Printers
While optimized for RPP02N, this should work with most ESC/POS compatible printers:
- RPP02N
- Goojprt PT-210
- Xprinter XP-P300
- Rongta RPP300
- Generic 58mm Bluetooth thermal printers

---

## 📞 Getting Help

If you're still having issues:

1. **Check printer manual** for specific pairing instructions
2. **Test with another app** to verify printer works (search "Bluetooth Printer Test" on Play Store)
3. **Update Android** to the latest version
4. **Try another device** to isolate hardware issues
5. **Contact support** with error message and device model

---

## ✅ Checklist Before Printing

- [ ] Printer is turned ON and charged
- [ ] Printer is paired in Android Bluetooth settings
- [ ] Bluetooth is enabled on your device
- [ ] App has Bluetooth permissions granted
- [ ] On Xiaomi: Battery optimization disabled for POS app
- [ ] On Xiaomi: Autostart enabled for POS app
- [ ] Printer is within 10 meters of device
- [ ] Thermal paper is loaded correctly

---

## 🎯 Quick Reference Card

**Printer won't pair?**
→ Reset printer, try PIN: 0000 or 1234

**Print fails after pairing?**
→ Xiaomi users: Disable battery optimization

**Garbled output?**
→ Check you're using 58mm paper, not 80mm

**Works once, then stops?**
→ Enable Autostart on Xiaomi/MIUI

**Permission errors?**
→ Settings → Apps → POS System → Permissions → Allow all

---

Enjoy hassle-free thermal printing! 🖨️✨
