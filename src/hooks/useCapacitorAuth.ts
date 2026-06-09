"use client";

/**
 * useCapacitorAuth
 *
 * Exposes handleOAuth() for login/signup pages.
 *
 * On iOS (Capacitor):
 *   Opens the Supabase OAuth URL in SFSafariViewController via @capacitor/browser.
 *   The deep-link callback (applyready://login-callback?code=...) is handled
 *   globally by CapacitorAuthProvider in the root layout — NOT here — so that
 *   the listener survives page transitions and component unmounts.
 *
 * On web:
 *   Standard Supabase signInWithOAuth (window redirect).
 */

import { useCallback } from "react";
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
  const handleOAuth = useCallback(async (
    provider: "google" | "apple",
    setLoading: (v: "google" | "apple" | null) => void,
  ) => {
    setLoading(provider);
    try {
      const supabase = createClient();

      if (isIOS()) {
        // Get the OAuth URL from Supabase without triggering a browser redirect
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: "applyready://login-callback",
            skipBrowserRedirect: true,
          },
        });
        if (error) { toast.error(error.message); setLoading(null); return; }
        if (data.url) {
          const { Browser } = await import("@capacitor/browser");
          // fullScreen makes it clear this is a separate auth step;
          // when Supabase redirects to applyready:// iOS auto-dismisses it
          await Browser.open({ url: data.url, presentationStyle: "fullScreen" });
        }
        // Loading spinner stays until CapacitorAuthProvider navigates away
        return;
      }

      // Web fallback: standard redirect flow
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) { toast.error(error.message); setLoading(null); }
    } catch (err) {
      console.error("OAuth error", err);
      toast.error("Sign in failed — please try again.");
      setLoading(null);
    }
  }, []);

  return { handleOAuth };
}
