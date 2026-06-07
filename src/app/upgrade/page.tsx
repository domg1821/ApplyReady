"use client";

import { useSubscription } from "@/hooks/useSubscription";
import toast from "react-hot-toast";
import { Infinity, CheckCircle2, Sparkles, ArrowRight, Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const INCLUDED = [
  "Unlimited AI resume rewrites — forever",
  "Cover Letter Generator — tailored to every job",
  "Job Match Analyzer — paste any job, see your match score",
  "LinkedIn Bio Writer — optimized About section in one click",
  "Interview Prep — 8 tailored questions with answer frameworks",
  "AI Assessment chat with resume generation",
  "All 15 professional templates",
  "PDF & Word export in one tap",
  "Every future feature automatically included",
  "Priority support",
];

export default function UpgradePage() {
  const { checkout, loading } = useSubscription();

  return (
    <div className="screen bg-gray-50 dark:bg-neutral-950 animate-page-in">
      {/* Top accent */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-400 to-orange-500 flex-shrink-0" />

      {/* Back nav */}
      <div className="flex items-center px-5 pt-3 flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-1.5 text-sm font-medium text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-neutral-300 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>
      </div>

      <div className="flex-1 flex flex-col px-5 pt-6 pb-safe overflow-y-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 self-start px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-5">
          <Infinity className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">Lifetime Access</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight mb-2">
          Pay once.<br />Use forever.
        </h1>
        <p className="text-gray-500 dark:text-neutral-400 text-sm leading-relaxed mb-5">
          No subscriptions. No renewals. One payment of{" "}
          <span className="font-bold text-gray-900 dark:text-white">$15</span>{" "}
          and every Pro feature is yours — now and every future update.
        </p>

        {/* Price card */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-5 mb-5 shadow-lg shadow-amber-100 dark:shadow-amber-900/20 flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white/70 text-xs font-semibold uppercase tracking-wider">One-time price</span>
            <span className="text-white/50 text-sm line-through">$99+/yr</span>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-5xl font-black text-white">$15</span>
            <span className="text-white/60 text-base">forever</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-white/50" />
            <span className="text-white/60 text-xs">Secure checkout · 7-day money-back guarantee</span>
          </div>
        </div>

        {/* Features */}
        <p className="text-xs font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest mb-3 flex-shrink-0">
          Everything included
        </p>
        <div className="space-y-2.5 mb-6 flex-shrink-0">
          {INCLUDED.map((item) => (
            <div key={item} className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700 dark:text-neutral-300">{item}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Button
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-0 shadow-lg shadow-amber-100 dark:shadow-amber-900/20"
          loading={loading}
          onClick={() => {
            const priceId = process.env.NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID;
            if (!priceId) { toast.error("Checkout unavailable — please try again later."); return; }
            checkout(priceId, "payment");
          }}
          size="lg"
        >
          <ArrowRight className="w-5 h-5" />
          Get Lifetime Access — $15
        </Button>

        <div className="flex items-center justify-center gap-1.5 mt-3 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-gray-300 dark:text-neutral-700" />
          <p className="text-xs text-gray-400 dark:text-neutral-600 text-center">
            Instant access after payment.
          </p>
        </div>
      </div>
    </div>
  );
}
