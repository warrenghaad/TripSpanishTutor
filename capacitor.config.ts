import type { CapacitorConfig } from "@capacitor/cli";

// Capacitor wraps the bundled Vite build (dist/public) into a native iOS
// shell. The webview loads the bundled assets locally at app start; runtime
// API calls go to the URL stored in `@capacitor/preferences` under
// `apiBaseUrl` (set on first launch from the in-app Settings screen, or
// falling back to `DEFAULT_API_BASE_URL` baked in below).
//
// Build pipeline:
//   1. `npm run build`              — produces dist/public
//   2. `npm run cap:sync`           — copies dist/public into ios/App/App/public
//   3. `npm run cap:ios:open`       — opens Xcode for sideload-signing
//
// The actual `npx cap add ios` and Xcode build steps must be run on a Mac
// (Capacitor requires Xcode + CocoaPods). See docs/ios-sideload.md.

const config: CapacitorConfig = {
  appId: "app.vallartavoz.companion",
  appName: "Vallarta Voz",
  webDir: "dist/public",
  ios: {
    contentInset: "automatic",
    // Sideload builds use a 7-day Apple ID provisioning profile by default;
    // see docs/ios-sideload.md for the AltStore / Sideloadly refresh path.
    scheme: "VallartaVoz",
  },
  server: {
    // Webview serves bundled assets from the app sandbox; runtime API
    // requests are made to the configured base URL via lib/api-base.ts.
    androidScheme: "https",
    iosScheme: "capacitor",
  },
};

export default config;
