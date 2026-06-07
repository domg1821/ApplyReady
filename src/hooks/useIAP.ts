"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

const RC_API_KEY = "appl_ZBPooIGDYkarrIGpQBmnILiScTQ";

export function useIAP() {
  const [loading, setLoading] = useState(false);

  const isIOS = useCallback((): boolean => {
    if (typeof window === "undefined") return false;
    try {
      // Check if running in Capacitor native iOS
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cap = (window as any).Capacitor;
      return cap?.getPlatform?.() === "ios";
    } catch {
      return false;
    }
  }, []);

  const initializePurchases = useCallback(async (userId: string) => {
    if (!isIOS()) return;
    try {
      const { Purchases } = await import("@revenuecat/purchases-capacitor");
      await Purchases.configure({ apiKey: RC_API_KEY, appUserID: userId });
    } catch (e) {
      console.error("RevenueCat init error:", e);
    }
  }, [isIOS]);

  const purchaseLifetime = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    try {
      const { Purchases } = await import("@revenuecat/purchases-capacitor");

      // Get the default offering
      const { current } = await Purchases.getOfferings();
      if (!current) {
        toast.error("Purchase unavailable — please try again.");
        return false;
      }

      // Find the lifetime package
      const lifetimePackage = current.availablePackages.find(
        (p) => p.packageType === "LIFETIME" || p.identifier === "lifetime"
      );

      if (!lifetimePackage) {
        toast.error("Lifetime package not found.");
        return false;
      }

      // Make the purchase
      const { customerInfo } = await Purchases.purchasePackage({
        aPackage: lifetimePackage,
      });

      // Check entitlement
      const hasProAccess = customerInfo.entitlements.active["pro"] !== undefined;

      if (hasProAccess) {
        // Update Supabase profile to pro
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from("profiles")
            .update({ subscription_tier: "pro" })
            .eq("id", user.id);
        }
        toast.success("Welcome to Pro! All features unlocked 🎉");
        return true;
      }

      return false;
    } catch (e: unknown) {
      // User cancelled = not an error
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((e as any)?.code === "1" || (e as any)?.userCancelled) {
        return false;
      }
      toast.error("Purchase failed — please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    try {
      const { Purchases } = await import("@revenuecat/purchases-capacitor");
      const { customerInfo } = await Purchases.restorePurchases();
      const hasProAccess = customerInfo.entitlements.active["pro"] !== undefined;

      if (hasProAccess) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from("profiles")
            .update({ subscription_tier: "pro" })
            .eq("id", user.id);
        }
        toast.success("Purchases restored!");
        return true;
      } else {
        toast.error("No previous purchases found.");
        return false;
      }
    } catch {
      toast.error("Restore failed — please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { isIOS, initializePurchases, purchaseLifetime, restorePurchases, loading };
}
