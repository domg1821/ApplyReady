"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";

const FREE_FEATURES = [
  "1 resume analysis",
  "Resume score (0–100)",
  "ATS compatibility score",
  "Detailed feedback report",
  "Keyword gap analysis",
  "Improvement recommendations",
];

const PRO_FEATURES = [
  "Everything in Free",
  "Unlimited resume analyses",
  "Full AI resume rewrite",
  "5 premium templates",
  "PDF export",
  "Editable resume sections",
  "Priority AI processing",
  "Email support",
];

export function Pricing() {
  const [annual, setAnnual] = useState(true);

  const monthlyPrice = annual ? 12 : 19;
  const annualTotal = 12 * 12;
  const savings = Math.round(((19 - 12) / 19) * 100);

  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-gray-500 mb-8">
            Start free. Upgrade when you&apos;re ready to apply.
          </p>

          <div className="inline-flex items-center gap-2 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                !annual ? "bg-white shadow-sm text-gray-900" : "text-gray-500"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                annual ? "bg-white shadow-sm text-gray-900" : "text-gray-500"
              }`}
            >
              Annual
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                Save {savings}%
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
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

          {/* Pro */}
          <div className="relative card p-8 border-2 border-indigo-200 overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1 gradient-brand" />
            <div className="absolute top-4 right-4">
              <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 gradient-brand text-white rounded-full">
                <Zap className="w-3 h-3" /> Most popular
              </span>
            </div>

            <div className="mb-6">
              <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-2">Pro</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900">${monthlyPrice}</span>
                <span className="text-gray-400">/mo</span>
              </div>
              {annual && (
                <p className="text-sm text-gray-500 mt-1">
                  ${annualTotal}/yr — billed annually
                </p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                Unlimited rewrites, exports, and templates.
              </p>
            </div>

            <Link href="/signup?plan=pro">
              <Button className="w-full mb-6 shadow-premium">
                Start Pro — {annual ? `$${annualTotal}/yr` : `$${monthlyPrice}/mo`}
              </Button>
            </Link>

            <ul className="space-y-3">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-center text-sm text-gray-400 mt-8">
          Cancel anytime. Secure payments via Stripe. 7-day money-back guarantee.
        </p>
      </div>
    </section>
  );
}
