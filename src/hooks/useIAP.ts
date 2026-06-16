"use client";

import { useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

const RC_API_KEY = "appl_ZBPooIGDYkarrIGpQBmnILiScTQ";

// Module-level flag so RC is only configured once per app session
let rcConfigured = false;

export function useIAP() {
  const [loading, setLoading] = useState(false);
  const configuringRef = useRef(false);

  const isIOS = useCallback((): boolean => {
    if (typeof window === "undefined") return false;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cap = (window as any).Capacitor;
      return cap?.getPlatform?.() === "ios";
    } catch {
      return false;
    }
  }, []);

  // Always resolves — safe to call multiple times
  const ensureConfigured = useCallback(async (): Promise<boolean> => {
    if (!isIOS()) return false;
    if (rcConfigured) return true;
    if (configuringRef.current) {
      // Wait for in-progress configure to finish
      await new Promise<void>((resolve) => {
        const interval = setInterval(() => {
          if (!configuringRef.current) { clearInterval(interval); resolve(); }
        }, 100);
      });
      return rcConfigured;
    }
    configuringRef.current = true;
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { Purchases } = await import("@revenuecat/purchases-capacitor");
      await Purchases.configure({
        apiKey: RC_API_KEY,
        appUserID: user?.id ?? undefined,
      });
      rcConfigured = true;
      return true;
    } catch (e) {
      console.error("RevenueCat configure error:", e);
      return false;
    } finally {
      configuringRef.current = false;
    }
  }, [isIOS]);

  // Keep for manual call from upgrade page useEffect (warm start)
  const initializePurchases = useCallback(async (userId: string) => {
    if (!isIOS() || rcConfigured) return;
    try {
      const { Purchases } = await import("@revenuecat/purchases-capacitor");
      await Purchases.configure({ apiKey: RC_API_KEY, appUserID: userId });
      rcConfigured = true;
    } catch (e) {
      console.error("RevenueCat init error:", e);
    }
  }, [isIOS]);

  const purchaseLifetime = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    try {
      // Always ensure configured before attempting purchase
      const ready = await ensureConfigured();
      if (!ready) {
        toast.error("In-app purchases unavailable on this device.");
        return false;
      }

      const { Purchases } = await import("@revenuecat/purchases-capacitor");

      // Get offerings
      const { current } = await Purchases.getOfferings();
      if (!current) {
        toast.error("No offerings found — check RevenueCat dashboard.");
        return false;
      }

      // Find lifetime package — try LIFETIME type first, then by identifier
      const lifetimePackage =
        current.availablePackages.find((p) => p.packageType === "LIFETIME") ??
        current.availablePackages.find((p) =>
          p.identifier.toLowerCase().includes("lifetime")
        );

      if (!lifetimePackage) {
        toast.error("Lifetime package not found — check RevenueCat dashboard.");
        return false;
      }

      // Make the purchase
      const { customerInfo } = await Purchases.purchasePackage({
        aPackage: lifetimePackage,
      });

      // Check any active entitlement (pro, lifetime, or any key)
      const activeEntitlements = customerInfo.entitlements.active;
      const hasProAccess =
        activeEntitlements["pro"] !== undefined ||
        activeEntitlements["lifetime"] !== undefined ||
        Object.keys(activeEntitlements).length > 0;

      if (hasProAccess) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from("profiles")
            .update({ subscription_tier: "pro", subscription_status: "lifetime" })
            .eq("id", user.id);
        }
        toast.success("Welcome to Pro! All features unlocked.");
        return true;
      }

      toast.error("Purchase completed but Pro access not found. Tap Restore.");
      return false;
    } catch (e: unknown) {
      // User cancelled — silent
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = e as any;
      if (
        err?.code === "1" ||
        err?.userCancelled === true ||
        err?.message?.includes("cancelled") ||
        err?.message?.includes("canceled") ||
        err?.underlyingErrorMessage?.includes("cancel")
      ) {
        return false;
      }
      const msg = err?.message ?? err?.underlyingErrorMessage ?? "Purchase failed — please try again.";
      toast.error(msg.length < 120 ? msg : "Purchase failed — please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [ensureConfigured]);

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    try {
      const ready = await ensureConfigured();
      if (!ready) {
        toast.error("In-app purchases unavailable on this device.");
        return false;
      }

      const { Purchases } = await import("@revenuecat/purchases-capacitor");
      const { customerInfo } = await Purchases.restorePurchases();
      const active = customerInfo.entitlements.active;
      const hasProAccess =
        active["pro"] !== undefined ||
        active["lifetime"] !== undefined ||
        Object.keys(active).length > 0;

      if (hasProAccess) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from("profiles")
            .update({ subscription_tier: "pro", subscription_status: "lifetime" })
            .eq("id", user.id);
        }
        toast.success("Purchases restored!");
        return true;
      }

      toast.error("No previous purchases found.");
      return false;
    } catch {
      toast.error("Restore failed — please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [ensureConfigured]);

  return { isIOS, initializePurchases, purchaseLifetime, restorePurchases, loading };
}
