"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import toast from "react-hot-toast";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export function useSubscription() {
  const [loading, setLoading] = useState(false);

  const checkout = async (priceId: string, mode: "subscription" | "payment" = "subscription") => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, mode }),
      });

      if (!res.ok) throw new Error("Failed to create checkout session");

      const { sessionId } = await res.json() as { sessionId: string };
      const stripe = await stripePromise;
      await stripe?.redirectToCheckout({ sessionId });
    } catch {
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const manageSubscription = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const { url } = await res.json() as { url: string };
      window.location.href = url;
    } catch {
      toast.error("Failed to open billing portal.");
    } finally {
      setLoading(false);
    }
  };

  return { checkout, manageSubscription, loading };
}
