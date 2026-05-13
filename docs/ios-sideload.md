# iOS Sideload Build (Capacitor)

Vallarta Voz wraps the Vite/React app in a Capacitor iOS shell. The webview
loads the bundled `dist/public` assets locally, and runtime API calls go
to the deployed Replit backend (configured in-app from the **Vault →
Settings** screen, or baked in via `VITE_DEFAULT_API_BASE_URL`).

This document covers the **one-time Mac setup** to produce a sideload-able
build. Everything before the Xcode step can be done on Replit; the Xcode
build itself requires macOS.

---

## Prerequisites (Mac)

- macOS 13 Ventura or newer
- Xcode 15+ (from the Mac App Store)
- CocoaPods (`sudo gem install cocoapods` or `brew install cocoapods`)
- A free Apple ID (sufficient for 7-day on-device sideload)
  - Or a paid Apple Developer account ($99/yr) for AltStore-style 7-day
    auto-refresh and 1-year provisioning profiles.

---

## One-time setup

Clone the repo on your Mac and install deps:

```bash
git clone <repo-url> vallarta-voz
cd vallarta-voz
npm install
```

Build the web bundle and the offline vault snapshot:

```bash
npm run build              # produces dist/public
npm run snapshot:vault     # produces client/public/vault-snapshot.json
                           # (run before build if you want it baked in)
```

Add the iOS platform (creates `ios/App/`):

```bash
npx cap add ios
```

Sync the web bundle into the native project:

```bash
npm run cap:sync
```

---

## Open in Xcode and sideload

```bash
npm run cap:ios:open
```

Inside Xcode:

1. **Signing & Capabilities** tab on the `App` target.
2. Set **Team** to your Apple ID (Personal Team is fine for free signing).
3. Change the **Bundle Identifier** to something unique to you (e.g.
   `app.yourname.vallartavoz`) — Apple's free tier rejects identifiers
   that clash with other developers.
4. Connect your iPhone via USB. Trust the computer if prompted.
5. Pick your iPhone in the device selector, then hit **Run** (⌘R).

The first install will fail on the device with a "Untrusted Developer"
error. On the iPhone go to **Settings → General → VPN & Device Management
→ <your Apple ID>** and tap **Trust**. Re-run from Xcode.

A free Apple ID build expires after 7 days — re-run from Xcode (or use
AltStore / Sideloadly to refresh remotely) to renew.

---

## Updating the app

Whenever the web code or vault contents change:

```bash
npm run build              # rebuild web bundle
npm run snapshot:vault     # refresh bundled vault snapshot
npm run cap:sync           # copy into ios/App/App/public/
```

Then re-run from Xcode.

---

## Pointing the app at a backend

The app needs a deployed backend for AI calls (chat, translate, learn
modes). Two options:

1. **Deploy to Replit** (the default expectation). Once published, copy
   the `.replit.app` URL.
2. **Run any Node host** (Render, Fly, Railway, your own VPS) — Capacitor
   only cares about HTTPS reachability.

Set the URL one of two ways:

- **Build-time default**: build with
  `VITE_DEFAULT_API_BASE_URL=https://your-app.replit.app npm run build`
  before `npm run cap:sync`. This bakes the URL in.
- **Runtime override**: open the app, tap **Vault → ⚙ Settings**, paste
  the URL, hit **Save**. It's stored in `@capacitor/preferences` and
  persists across launches.

If both are blank the app runs offline-only against the bundled snapshot.

---

## AltStore / Sideloadly (optional)

For 7-day auto-refresh without Xcode, install
[AltStore](https://altstore.io) on your Mac + iPhone, build the `.ipa`
once via:

```bash
xcodebuild -workspace ios/App/App.xcworkspace -scheme App \
  -configuration Release -archivePath build/App.xcarchive archive
xcodebuild -exportArchive -archivePath build/App.xcarchive \
  -exportPath build/ipa -exportOptionsPlist ios/exportOptions.plist
```

…then open the resulting `.ipa` with AltServer to install + auto-refresh.
A minimal `exportOptions.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>method</key><string>development</string>
    <key>signingStyle</key><string>automatic</string>
    <key>compileBitcode</key><false/>
  </dict>
</plist>
```

---

## What lives where

| File / dir | Purpose |
|---|---|
| `capacitor.config.ts` | App ID, name, web dir, iOS scheme |
| `client/src/lib/api-base.ts` | Runtime backend URL (web vs native) |
| `client/src/pages/vault.tsx` | In-app vault browser (snapshot + live) |
| `script/build-vault-snapshot.ts` | Builds `client/public/vault-snapshot.json` |
| `server/vault/browse.ts` | `/api/vault/tree` + `/api/vault/file` (read-only) |
| `ios/` | Xcode project (created by `npx cap add ios`, gitignored) |
