"use client";

import { useEffect, useState } from "react";
import { GuidedTour } from "@/components/onboarding/GuidedTour";
import toast from "react-hot-toast";

export function DashboardWelcome({
  showTour,
  showUpgraded,
}: {
  showTour: boolean;
  showUpgraded: boolean;
}) {
  const [tourActive, setTourActive] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (showUpgraded) {
        // Sync subscription status with Stripe before showing the success message
        try {
          const res = await fetch("/api/stripe/sync", { method: "POST" });
          const data = await res.json() as { synced: boolean; tier?: string; status?: string };

          if (data.synced && data.tier === "pro") {
            if (data.status === "lifetime") {
              toast.success("🎉 Lifetime access unlocked! Welcome to Pro.");
            } else {
              toast.success("🎉 Pro plan activated! You're all set.");
            }
            // Reload so the UI reflects the new tier
            window.history.replaceState({}, "", "/dashboard");
            window.location.reload();
            return;
          } else {
            toast.error("Payment received but upgrade pending — try refreshing in a moment.");
          }
        } catch {
          toast.error("Couldn't verify upgrade. Please refresh.");
        }
        window.history.replaceState({}, "", "/dashboard");
      }

      if (showTour) {
        const t = setTimeout(() => setTourActive(true), 800);
        return () => clearTimeout(t);
      }
    };

    run();
  }, [showTour, showUpgraded]);

  const handleTourFinish = () => {
    setTourActive(false);
    window.history.replaceState({}, "", "/dashboard");
  };

  if (!tourActive) return null;
  return <GuidedTour onFinish={handleTourFinish} />;
}
