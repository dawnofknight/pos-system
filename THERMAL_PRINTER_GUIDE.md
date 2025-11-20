# Thermal Printer Setup Guide (58mm)

This guide explains how to print receipts to a 58mm thermal printer from your POS system, especially on Android tablets.

## ✅ Current Implementation

The system now generates receipts optimized for 58mm thermal paper with:

- Proper paper size formatting
- Improved print timing (waits for content to load)
- Auto-close after printing
- Better layout for narrow thermal paper

## 🖨️ Printing Methods for Android/Tablets

### Method 1: Direct Browser Printing (Simplest)

1. **Enable Chrome Print:**

   - Open Chrome on your Android tablet
   - Navigate to your POS system
   - When you click "Print Receipt", the browser will open the print dialog
   - Select your thermal printer from the list
   - Adjust print settings to match 58mm paper
   - Print!

2. **Configure Printer Settings:**
   - Go to Android Settings > Connected devices > Printers
   - Add your thermal printer (Bluetooth/WiFi/USB)
   - Set paper size to 58mm (or custom if needed)

### Method 2: Using Print Service Apps

For better thermal printer support, install one of these apps:

#### **RawBT (Bluetooth Thermal Printers)**

1. Install "RawBT" from Google Play Store
2. Connect your thermal printer via Bluetooth
3. The app intercepts print jobs and sends them to thermal printer
4. Works seamlessly with browser printing

#### **StarPRNT SDK** (For Star Micronics Printers)

1. If you have a Star printer, install their print service
2. Configure the printer in the app
3. Browser print will automatically use it

#### **Sunmi Printer Service** (For Sunmi Devices)

1. Built-in for Sunmi tablets/devices
2. No configuration needed
3. Just select Sunmi printer when printing

### Method 3: Advanced - ESC/POS Integration

For production environments, consider implementing direct ESC/POS printing:

```javascript
// Example implementation (requires additional libraries)
import { EscPosEncoder } from "esc-pos-encoder";

const generateEscPosReceipt = (sale, settings) => {
  const encoder = new EscPosEncoder();

  encoder
    .initialize()
    .align("center")
    .bold(true)
    .text(settings.appName || "POS SYSTEM")
    .bold(false)
    .newline()
    .text("SALES RECEIPT")
    .newline()
    .align("left")
    .text(`Receipt #: ${sale.id}`)
    .text(`Date: ${new Date(sale.createdAt).toLocaleDateString()}`)
    .text(`Cashier: ${sale.user.name}`)
    .newline()
    .line()
    .newline();

  // Add items
  sale.items.forEach((item) => {
    encoder
      .text(item.item.name)
      .text(
        `${item.quantity} x ${currencySymbol}${item.price} = ${currencySymbol}${
          item.price * item.quantity
        }`
      )
      .newline();
  });

  encoder
    .newline()
    .line()
    .bold(true)
    .text(`TOTAL: ${currencySymbol}${sale.total}`)
    .bold(false)
    .newline()
    .newline()
    .align("center")
    .text("Thank you for your purchase!")
    .newline()
    .cut()
    .encode();

  return encoder;
};
```

To use this, you'll need:

1. Install package: `npm install esc-pos-encoder`
2. Use Web Bluetooth API or Cordova plugin for mobile
3. Send raw bytes directly to printer

### Method 4: Using Kiosk/Lockdown Mode

For dedicated POS tablets:

1. **Install a Kiosk Browser** like:

   - Fully Kiosk Browser
   - Kiosk Browser Lockdown
   - SureLock

2. **Configure Auto-Print:**
   - Set up automatic print to default thermal printer
   - No print dialog shown
   - Direct printing on receipt generation

## 🔧 Recommended Hardware Setup

### For Tablets/Mobile POS:

- **Bluetooth Thermal Printer:** Easiest setup, wireless
  - Examples: Xprinter XP-P300, Goojprt PT-210
- **USB Thermal Printer:** Requires USB OTG cable
  - Examples: Epson TM-T20III, Star TSP100
- **WiFi Thermal Printer:** Best for multiple devices
  - Examples: Epson TM-m30, Star mC-Print3

### Connection Types:

1. **Bluetooth:** Most flexible for tablets
2. **WiFi:** Best for multiple terminals
3. **USB:** Most reliable but requires cable

## ⚙️ Browser Settings for Best Results

### Chrome on Android:

1. Open `chrome://flags`
2. Enable "Enable the new Print Preview"
3. Set default paper size in printer settings

### Settings to Check:

- Paper size: 58mm (or 2.28 inches)
- Margins: Minimal (0mm recommended)
- Scale: 100%
- Background graphics: Enabled (for lines/borders)

## 🐛 Troubleshooting

### Receipt Shows Blank Page:

- ✅ **Fixed:** Added delay before printing to ensure content loads
- Clear browser cache and try again

### Text Too Large/Small:

- Adjust font size in `src/lib/receipt.js`
- Current size: 11-12px (optimized for 58mm)

### Printer Not Detected:

1. Check Bluetooth/WiFi connection
2. Install manufacturer's print service app
3. Restart tablet and printer
4. Check printer is in pairing mode

### Print Dialog Doesn't Appear:

1. Check popup blocker settings
2. Allow popups for your POS domain
3. Try different browser (Chrome recommended)

## 📱 Recommended Android Apps

1. **Star Micronics mPOP** - If using Star printers
2. **Epson TM Utility** - For Epson thermal printers
3. **Bluetooth Thermal Printer** - Generic ESC/POS support
4. **RawBT ESC/POS Printer** - Raw printing support

## 🎯 Production Recommendations

For a production POS system with thermal printing:

1. **Use a dedicated POS tablet** with built-in printer support
2. **Install manufacturer's SDK** for your thermal printer brand
3. **Consider Sunmi devices** - They have built-in thermal printers
4. **Use kiosk mode** to prevent user interference
5. **Implement ESC/POS** for direct printing without dialog

## 📝 Testing Your Setup

1. Navigate to a sale detail page
2. Click "Print Receipt"
3. Check if popup opens with receipt
4. Verify receipt layout on screen (58mm width)
5. Click Print in dialog
6. Check thermal printer output

## 🔗 Additional Resources

- [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API)
- [ESC/POS Command Reference](https://reference.epson-biz.com/modules/ref_escpos/)
- [Star Micronics SDK](https://www.starmicronics.com/support/sdks/)

## 💡 Future Enhancements

Consider implementing:

- Auto-print after sale completion
- Print preview before printing
- Multiple receipt copies option
- Email receipt as alternative
- Save receipt as PDF
- QR code for digital receipt
