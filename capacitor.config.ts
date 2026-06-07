import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.applyready.app",
  appName: "ApplyReady",
  webDir: "public", // fallback static dir (splash/icons only)

  // ✅ Points the iOS WebView at your live Vercel deployment.
  // This keeps all API routes, server components, and auth working.
  // Replace the URL with your actual Vercel domain before building.
  server: {
    url: "https://apply-ready-nine.vercel.app",
    cleartext: false,
  },

  // iOS-specific settings
  ios: {
    contentInset: "always",
    scrollEnabled: false,
  },

  plugins: {
    // Safe area support
    EdgeToEdge: {
      backgroundColor: "#06060f", // matches dark --bg
    },

    // Push notifications (if added later)
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },

    // Capacitor Browser — needed for OAuth (Google sign-in)
    // Install: npm install @capacitor/browser
    // Usage: import { Browser } from "@capacitor/browser";
    //        await Browser.open({ url: supabaseOAuthUrl });
  },
};

export default config;

/**
 * ─── SETUP STEPS FOR APP STORE ────────────────────────────────────────────
 *
 * 1. Install Capacitor:
 *    npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/haptics
 *    npm install @capacitor-community/rate-app
 *    npx cap init
 *
 * 2. Update capacitor.config.ts server.url to your Vercel domain.
 *    Make sure your Vercel app is deployed and working first.
 *
 * 3. Sync (no build needed — app loads from Vercel):
 *    npx cap add ios
 *    npx cap sync
 *    npx cap open ios  ← opens Xcode (need a Mac or Codemagic)
 *
 * 4. In Xcode:
 *    - Set Bundle ID to "com.applyready.app"
 *    - Add app icons (1024×1024 PNG required)
 *    - Set up signing with your Apple Developer account
 *    - Add URL scheme for OAuth deep link: applyready://
 *
 * 5. Supabase OAuth fix for Capacitor:
 *    - Install: npm install @capacitor/browser
 *    - Add redirect URL in Supabase: applyready://login-callback
 *    - Use Browser.open() instead of window.location for OAuth
 *
 * 6. RevenueCat (replaces Stripe for IAP):
 *    npm install @revenuecat/purchases-capacitor
 *    - Set up products in App Store Connect
 *    - Configure RevenueCat dashboard
 *    - Replace /api/checkout with RevenueCat purchase flow
 */
