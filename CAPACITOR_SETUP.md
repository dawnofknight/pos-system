# Capacitor Android Wrapper – Setup & Developer Workflow

This repo is now scaffolded with Capacitor and an Android platform so you can run the Next.js app inside a native Android shell, which will enable native integrations like Bluetooth receipt printing (RPP02N).

## Prerequisites
- Android Studio installed (SDK + Platform tools)
- Java/JDK (Android Studio bundles this)
- A device or emulator

## Scripts
- `npm run cap:add:android` – add Android platform (already done)
- `npm run cap:sync` – sync web assets/config/plugins to Android
- `npm run cap:open:android` – open the Android project in Android Studio

## Dev Workflow
1. Start Next.js dev server:
   - `npm run dev`
2. Open the Android project:
   - `npm run cap:open:android`
3. Run the app on an emulator/device from Android Studio.

### Important: Dev Server URL
The Capacitor config uses `http://10.0.2.2:3000` so the Android emulator can reach your host machine's localhost. If you run on a physical device, change the URL to your machine's local IP, e.g.:

```ts
// capacitor.config.ts
server: {
  url: 'http://192.168.1.123:3000',
  clearText: true,
}
```

Then run `npm run cap:sync`.

## Production Build (optional)
If you want to ship without a dev server, you can use static export:
1. Configure Next.js for export (ensure pages don’t rely on SSR-only features).
2. Run `next build && next export` to generate `out/`.
3. Update Capacitor config `webDir: 'out'` (already set).
4. Run `npm run cap:sync` to copy assets.

## Next Steps: Native Printing
With the Android wrapper in place, you can integrate printing via:
- A Capacitor plugin that sends ESC/POS bytes over Bluetooth SPP (RFCOMM UUID `00001101-0000-1000-8000-00805F9B34FB`).
- Or the vendor SDK (Rongta/Iware) bridged via a Capacitor plugin with methods like `connect`, `printText`, `printImage`.

I will scaffold the plugin and a JS API (`src/lib/print.js`) once you confirm the printer connection method (Bluetooth SPP vs USB) and whether you prefer a generic ESC/POS bridge or the vendor SDK.

