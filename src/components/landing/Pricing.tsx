"use client";

import Link from "next/link";
import { Check, Zap, Infinity } from "lucide-react";
import { Button } from "@/components/ui/Button";

const FREE_FEATURES = [
  "1 resume analysis",
  "Resume score (0–100)",
  "ATS compatibility score",
  "Detailed feedback report",
  "Keyword gap analysis",
  "Improvement recommendations",
];

const LIFETIME_FEATURES = [
  "Everything in Free",
  "Unlimited resume analyses",
  "Full AI resume rewrite",
  "5 premium templates",
  "PDF export & download",
  "Editable resume sections",
  "Priority AI processing",
  "All future features included",
  "Lifetime priority support",
  "Pay once, use forever",
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-gray-500">
            Start free. Pay once. Get Pro for life.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free */}
          <div className="card p-8">
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Free</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900">$0</span>
                <span className="text-gray-400">/forever</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Analyze your resume once, see exactly what to fix.
              </p>
            </div>

            <Link href="/signup">
              <Button variant="secondary" className="w-full mb-6">
                Get started free
              </Button>
            </Link>

            <ul className="space-y-3">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Lifetime */}
          <div className="relative card p-8 border-2 border-amber-200 overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-400 to-orange-400" />
            <div className="absolute top-4 right-4">
              <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full">
                <Zap className="w-3 h-3" /> Best value
              </span>
            </div>

            <div className="mb-6">
              <p className="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-2">Lifetime</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900">$15</span>
                <span className="text-gray-400">once</span>
              </div>
              <p className="text-sm text-emerald-600 font-semibold mt-1">Never pay again.</p>
              <p className="text-sm text-gray-500 mt-1">
                One payment. Pro access forever.
              </p>
            </div>

            <Link href="/signup?plan=lifetime">
              <Button className="w-full mb-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-0 shadow-md">
                <Infinity className="w-4 h-4" />
                Get Lifetime Access — $15
              </Button>
            </Link>

            <ul className="space-y-3">
              {LIFETIME_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-center text-sm text-gray-400 mt-8">
          Secure payments via Stripe. 7-day money-back guarantee.
        </p>
      </div>
    </section>
  );
}
