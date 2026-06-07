"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

const PERKS = [
  "AI resume analysis — instant score & feedback",
  "Full resume rewrite powered by Claude AI",
  "15 professional templates to choose from",
  "PDF export in one tap",
];

export default function WelcomePage() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="screen bg-gray-50 dark:bg-neutral-950 animate-page-in">
      {/* Top accent */}
      <div className="h-1 w-full gradient-brand flex-shrink-0" />

      <div
        className={`flex-1 flex flex-col px-5 pt-10 pb-safe overflow-y-auto transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* Icon */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl gradient-brand flex items-center justify-center shadow-xl shadow-indigo-200 dark:shadow-indigo-900/40">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-400 border-2 border-gray-50 dark:border-neutral-950 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="text-center mb-8">
          <p className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-3">
            Email confirmed ✓
          </p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight mb-4">
            Welcome to<br />ApplyReady 🎉
          </h1>
          <p className="text-gray-500 dark:text-neutral-400 text-sm leading-relaxed max-w-xs mx-auto">
            Your account is all set. You&apos;re one step closer to landing your next job with a resume that gets noticed.
          </p>
        </div>

        {/* Perks */}
        <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl p-5 mb-6 space-y-3">
          <p className="text-xs font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest mb-1">
            What&apos;s waiting for you
          </p>
          {PERKS.map((perk) => (
            <div key={perk} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="text-sm text-gray-700 dark:text-neutral-300">{perk}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => router.push("/dashboard?welcome=1")}
          className="w-full py-4 gradient-brand text-white text-base font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-indigo-900/30 active:scale-[0.98] transition-all"
        >
          Let&apos;s get started <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-center text-xs text-gray-400 dark:text-neutral-600 mt-4">
          A guided tour is waiting for you inside
        </p>
      </div>
    </div>
  );
}
