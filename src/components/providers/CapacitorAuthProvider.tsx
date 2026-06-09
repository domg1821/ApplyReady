"use client";

/**
 * CapacitorAuthProvider
 *
 * Mounted once at the root layout level. Listens for the iOS deep-link
 * applyready://login-callback?code=... that Supabase sends after OAuth.
 *
 * This must be at the root (not inside login/signup pages) so that:
 *  1. The listener is always active — even during page transitions
 *  2. It survives unmounts that would remove a page-level listener
 *
 * Flow:
 *   User taps "Sign in with Apple/Google"
 *   → Browser.open() opens SFSafariViewController
 *   → User authenticates
 *   → Supabase redirects to applyready://login-callback?code=xxx
 *   → iOS catches the custom URL scheme, brings app to foreground
 *   → appUrlOpen fires here
 *   → We exchange the code for a session, close the browser, navigate
 */

import { useEffect } from "react";
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

export function CapacitorAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!isIOS()) return;

    let listenerHandle: { remove: () => void } | null = null;

    const setup = async () => {
      try {
        const { App } = await import("@capacitor/app");
        const { Browser } = await import("@capacitor/browser");

        listenerHandle = await App.addListener("appUrlOpen", async ({ url }) => {
          // Only handle our OAuth callback
          if (!url.startsWith("applyready://login-callback")) return;

          // Close the in-app browser first so it feels instant
          await Browser.close();

          // Parse code from applyready://login-callback?code=xxx
          const urlObj = new URL(url.replace("applyready://", "https://dummy.com/"));
          const code = urlObj.searchParams.get("code");

          if (!code) {
            toast.error("Sign in failed — no code returned.");
            return;
          }

          const supabase = createClient();
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            toast.error("Sign in failed — please try again.");
            return;
          }

          // Navigate based on onboarding state
          try {
            const onboarded = localStorage.getItem("applyready_onboarded");
            router.push(onboarded ? "/dashboard" : "/onboarding");
          } catch {
            router.push("/dashboard");
          }
        });
      } catch {
        // Not in Capacitor — safe to ignore
      }
    };

    setup();
    return () => {
      listenerHandle?.remove();
    };
  }, [router]);

  return <>{children}</>;
}
