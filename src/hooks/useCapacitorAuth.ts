"use client";

/**
 * Capacitor-aware OAuth hook.
 *
 * On iOS:
 *   - Apple  → native ASAuthorizationAppleIDProvider via @capacitor-community/apple-sign-in
 *   - Google → Supabase OAuth URL opened in SFSafariViewController via @capacitor/browser
 *              Deep-link callback: applyready://login-callback?code=...
 *
 * On web:
 *   - Both providers → standard Supabase signInWithOAuth (window redirect)
 */

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (window as any).Capacitor?.getPlatform?.() === "ios";
  } catch {
    return false;
  }
}

export function useCapacitorAuth() {
  const router = useRouter();

  // ── Handle deep-link callback from Browser plugin (Google OAuth on iOS) ──
  useEffect(() => {
    if (!isIOS()) return;

    let listenerHandle: { remove: () => void } | null = null;

    const setup = async () => {
      try {
        const { App } = await import("@capacitor/app");
        const { Browser } = await import("@capacitor/browser");

        listenerHandle = await App.addListener("appUrlOpen", async ({ url }) => {
          if (!url.startsWith("applyready://login-callback")) return;

          // Extract the code from the deep link
          const urlObj = new URL(url.replace("applyready://", "https://dummy.com/"));
          const code = urlObj.searchParams.get("code");

          if (code) {
            const supabase = createClient();
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) {
              toast.error("Sign in failed — please try again.");
            } else {
              // Check if user has completed onboarding
              try {
                const onboarded = localStorage.getItem("applyready_onboarded");
                router.push(onboarded ? "/dashboard" : "/onboarding");
              } catch {
                router.push("/dashboard");
              }
            }
          }

          await Browser.close();
        });
      } catch {
        // Plugin not available (web environment) — safe to ignore
      }
    };

    setup();
    return () => { listenerHandle?.remove(); };
  }, [router]);

  // ── Native Apple Sign In (iOS only) ──────────────────────────────────────
  const handleNativeAppleSignIn = useCallback(async () => {
    try {
      const { SignInWithApple } = await import("@capacitor-community/apple-sign-in");
      const result = await SignInWithApple.authorize({
        clientId: "com.applyready.app",
        redirectURI: "applyready://login-callback",
        scopes: "email name",
        state: "apple-signin",
        nonce: Math.random().toString(36).substring(2),
      });

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithIdToken({
        provider: "apple",
        token: result.response.identityToken,
      });

      if (error) {
        toast.error(error.message);
        return false;
      }

      const onboarded = (() => { try { return localStorage.getItem("applyready_onboarded"); } catch { return null; } })();
      router.push(onboarded ? "/dashboard" : "/onboarding");
      return true;
    } catch (e: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = e as any;
      // User cancelled (error code 1001) — silent
      if (err?.code === "1001" || err?.message?.includes("cancel")) return false;
      toast.error("Apple sign in failed — please try again.");
      return false;
    }
  }, [router]);

  // ── Main OAuth handler ────────────────────────────────────────────────────
  const handleOAuth = useCallback(async (
    provider: "google" | "apple",
    setLoading: (v: "google" | "apple" | null) => void,
  ) => {
    setLoading(provider);
    try {
      const supabase = createClient();

      if (isIOS() && provider === "apple") {
        // Native Apple Sign In sheet
        await handleNativeAppleSignIn();
        return;
      }

      if (isIOS() && provider === "google") {
        // Open Google OAuth in SFSafariViewController, return via deep link
        const { Browser } = await import("@capacitor/browser");
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: "applyready://login-callback",
            skipBrowserRedirect: true,
          },
        });
        if (error) { toast.error(error.message); return; }
        if (data.url) await Browser.open({ url: data.url, presentationStyle: "popover" });
        // Callback handled by appUrlOpen listener above
        return;
      }

      // Web — standard redirect
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) toast.error(error.message);
    } finally {
      setLoading(null);
    }
  }, [handleNativeAppleSignIn]);

  return { handleOAuth };
}
