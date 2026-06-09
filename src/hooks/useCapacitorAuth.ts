"use client";

/**
 * Capacitor-aware OAuth hook.
 *
 * On iOS (Capacitor):
 *   Both Apple and Google OAuth are opened in SFSafariViewController
 *   via @capacitor/browser. After sign-in, Supabase redirects to
 *   applyready://login-callback?code=... which is caught by the
 *   App.addListener("appUrlOpen") handler below and exchanged for a session.
 *
 * On web:
 *   Standard Supabase signInWithOAuth (window redirect).
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

  // ── Deep-link callback handler (iOS only) ────────────────────────────────
  // Fires when Supabase redirects back to applyready://login-callback?code=...
  useEffect(() => {
    if (!isIOS()) return;

    let listenerHandle: { remove: () => void } | null = null;

    const setup = async () => {
      try {
        const { App } = await import("@capacitor/app");
        const { Browser } = await import("@capacitor/browser");

        listenerHandle = await App.addListener("appUrlOpen", async ({ url }) => {
          if (!url.startsWith("applyready://login-callback")) return;

          // Parse the code out of applyready://login-callback?code=xxx
          const urlObj = new URL(url.replace("applyready://", "https://dummy.com/"));
          const code = urlObj.searchParams.get("code");

          if (code) {
            const supabase = createClient();
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) {
              toast.error("Sign in failed — please try again.");
            } else {
              try {
                const onboarded = localStorage.getItem("applyready_onboarded");
                router.push(onboarded ? "/dashboard" : "/onboarding");
              } catch {
                router.push("/dashboard");
              }
            }
          }

          // Close the in-app browser
          await Browser.close();
        });
      } catch {
        // Not in a Capacitor environment — safe to ignore
      }
    };

    setup();
    return () => { listenerHandle?.remove(); };
  }, [router]);

  // ── Main OAuth handler ────────────────────────────────────────────────────
  const handleOAuth = useCallback(async (
    provider: "google" | "apple",
    setLoading: (v: "google" | "apple" | null) => void,
  ) => {
    setLoading(provider);
    try {
      const supabase = createClient();

      if (isIOS()) {
        // On iOS: get the OAuth URL from Supabase, open in SFSafariViewController
        // skipBrowserRedirect: true prevents Supabase from doing window.location redirect
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: "applyready://login-callback",
            skipBrowserRedirect: true,
          },
        });
        if (error) { toast.error(error.message); return; }
        if (data.url) {
          const { Browser } = await import("@capacitor/browser");
          await Browser.open({ url: data.url, presentationStyle: "popover" });
        }
        // Session is set by the appUrlOpen listener above when the deep link fires
        return;
      }

      // Web: standard redirect
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) toast.error(error.message);
    } finally {
      // On iOS we don't clear loading here — the appUrlOpen handler navigates away
      // On web the page redirects so this never runs
      if (!isIOS()) setLoading(null);
    }
  }, []);

  return { handleOAuth };
}
