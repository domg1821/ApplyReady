"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles, FileText, Brain, Download,
  ArrowRight, Infinity, CheckCircle2, Zap,
} from "lucide-react";
import { AppLogo } from "@/components/ui/AppLogo";

const TOTAL_SLIDES = 3;

export default function OnboardingPage() {
  const router = useRouter();
  const [slide, setSlide] = useState(0);
  const slideKeyRef = useRef(0);
  const [slideKey, setSlideKey] = useState(0);
  const navigatingRef = useRef(false);

  const goNext = useCallback(() => {
    if (navigatingRef.current) return;
    if (slide >= TOTAL_SLIDES - 1) return;
    navigatingRef.current = true;
    slideKeyRef.current += 1;
    setSlide(slide + 1);
    setSlideKey(slideKeyRef.current);
    setTimeout(() => { navigatingRef.current = false; }, 380);
  }, [slide]);

  const finish = useCallback((plan?: "free" | "lifetime") => {
    try { localStorage.setItem("applyready_onboarded", "1"); } catch {}
    if (plan === "lifetime") {
      try { sessionStorage.setItem("selectedPlan", "lifetime"); } catch {}
    }
    router.replace("/dashboard?welcome=1");
  }, [router]);

  return (
    <div className="screen overflow-hidden bg-white dark:bg-neutral-950">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <AppLogo size={28} />
          <span className="text-sm font-bold text-gray-900 dark:text-white">ApplyReady</span>
        </div>
        <button
          onClick={() => finish()}
          className="text-sm text-gray-400 dark:text-neutral-500 font-medium px-2 py-1"
        >
          Skip
        </button>
      </div>

      {/* Slide */}
      <div key={slideKey} className="flex-1 flex flex-col px-5 pt-3 pb-0 overflow-hidden animate-slide-in-right">
        {slide === 0 && <SlideHero />}
        {slide === 1 && <SlideSteps />}
        {slide === 2 && <SlidePlans onPlan={finish} />}
      </div>

      {/* Bottom nav */}
      <div className="flex items-center justify-between px-5 pb-safe pt-3 flex-shrink-0">
        <Dots total={TOTAL_SLIDES} active={slide} />
        {slide < TOTAL_SLIDES - 1 ? (
          <button
            onClick={goNext}
            className="flex items-center gap-2 px-6 py-3 text-white text-sm font-semibold rounded-2xl shadow-lg active:scale-95 transition-transform select-none"
            style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", boxShadow: "0 8px 25px rgba(79,70,229,0.35)" }}
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}

function Dots({ total, active }: { total: number; active: number }) {
  return (
    <div className="flex gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? "w-6 bg-indigo-600 dark:bg-indigo-400" : "w-1.5 bg-gray-200 dark:bg-neutral-700"}`} />
      ))}
    </div>
  );
}

function SlideHero() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-xs space-y-3">
          <div className="bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-xs font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">Before</span>
              <span className="ml-auto text-xs font-bold text-red-400">Score: 42</span>
            </div>
            <div className="space-y-2">
              <div className="h-2 bg-gray-200 dark:bg-neutral-700 rounded-full w-2/3" />
              <div className="h-2 bg-gray-100 dark:bg-neutral-800 rounded-full" />
              <div className="h-2 bg-gray-100 dark:bg-neutral-800 rounded-full w-5/6" />
              <div className="h-2 bg-gray-100 dark:bg-neutral-800 rounded-full" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-gray-100 dark:bg-neutral-800" />
            <div className="w-9 h-9 rounded-full flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 h-px bg-gray-100 dark:bg-neutral-800" />
          </div>
          <div className="bg-white dark:bg-neutral-900 border-2 border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-4 shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">After · AI</span>
              <span className="ml-auto text-xs font-bold text-emerald-500">Score: 91</span>
            </div>
            <div className="space-y-2">
              <div className="h-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-full w-2/3" />
              <div className="h-2 bg-gray-100 dark:bg-neutral-800 rounded-full" />
              <div className="h-2 bg-gray-100 dark:bg-neutral-800 rounded-full w-4/5" />
              <div className="h-2 bg-gray-100 dark:bg-neutral-800 rounded-full" />
              <div className="h-2 bg-gray-100 dark:bg-neutral-800 rounded-full w-3/4" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1">
            {[
              { icon: Brain, label: "AI Analysis", color: "text-indigo-500" },
              { icon: FileText, label: "Rewritten", color: "text-violet-500" },
              { icon: Download, label: "PDF Export", color: "text-emerald-500" },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-xl p-2 text-center">
                <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
                <p className="text-xs text-gray-400 dark:text-neutral-500 leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-shrink-0 pb-2">
        <p className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-3">AI-Powered</p>
        <h2 className="text-[28px] font-bold text-gray-900 dark:text-white leading-tight mb-3">Your resume,<br />rebuilt by AI.</h2>
        <p className="text-gray-400 dark:text-neutral-500 text-sm leading-relaxed">Chat with Alex, your AI coach. Get an ATS score, feedback, and a fully rewritten professional resume.</p>
      </div>
    </div>
  );
}

function SlideSteps() {
  const steps = [
    { num: "01", text: "Chat with Alex — your AI resume coach", icon: FileText },
    { num: "02", text: "AI optimizes and rewrites your resume for maximum impact", icon: Brain },
    { num: "03", text: "Choose a template, download your PDF, apply", icon: Zap },
  ];
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-xs space-y-3">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-4 bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl px-4 py-4">
              <span className="text-xs font-black text-indigo-200 dark:text-indigo-800 w-5 flex-shrink-0">{step.num}</span>
              <p className="flex-1 text-sm font-medium text-gray-800 dark:text-neutral-200">{step.text}</p>
              <div className="w-9 h-9 rounded-xl bg-white dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                <step.icon className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-shrink-0 pb-2">
        <p className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-3">3 Simple Steps</p>
        <h2 className="text-[28px] font-bold text-gray-900 dark:text-white leading-tight mb-3">From blank page<br />to hired.</h2>
        <p className="text-gray-400 dark:text-neutral-500 text-sm leading-relaxed">No forms. No guessing. Just a fast, guided AI experience that turns your background into a polished resume.</p>
      </div>
    </div>
  );
}

function SlidePlans({ onPlan }: { onPlan: (p: "free" | "lifetime") => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 pb-5">
        <p className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-3">Choose a plan</p>
        <h2 className="text-[28px] font-bold text-gray-900 dark:text-white leading-tight mb-2">Start free or<br />go all in.</h2>
        <p className="text-gray-400 dark:text-neutral-500 text-sm">One payment of $15 unlocks everything — forever.</p>
      </div>
      <div className="flex-1 flex flex-col justify-center gap-3 pb-2">
        <button onClick={() => onPlan("free")} className="w-full text-left bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl p-5 active:scale-[0.98] transition-transform">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-gray-500 dark:text-neutral-400">Free</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">$0</span>
          </div>
          <ul className="space-y-2">
            {["1 AI resume rewrite", "Alex the AI coach included", "Personalised resume guide"].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-400 dark:text-neutral-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-gray-300 dark:text-neutral-600 flex-shrink-0" /> {f}
              </li>
            ))}
          </ul>
        </button>
        <button onClick={() => onPlan("lifetime")} className="w-full text-left rounded-2xl p-5 shadow-lg active:scale-[0.98] transition-transform relative overflow-hidden" style={{ background: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)", boxShadow: "0 8px 30px rgba(245,158,11,0.35)" }}>
          <div className="absolute top-3.5 right-3.5 bg-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded-full">
            <span className="text-xs font-bold text-white">Best value</span>
          </div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-bold text-white/70">Lifetime</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white">$15</span>
              <span className="text-white/50 text-xs">once</span>
            </div>
          </div>
          <p className="text-white/60 text-xs mb-3">Pay once. Pro forever.</p>
          <ul className="space-y-2 mb-4">
            {["Unlimited AI rewrites", "15 templates + PDF export", "Every future feature included"].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-white/80">
                <Infinity className="w-3.5 h-3.5 text-white/60 flex-shrink-0" /> {f}
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-center gap-2 bg-white/15 rounded-xl py-2.5">
            <span className="text-sm font-bold text-white">Get Lifetime Access</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </div>
        </button>
      </div>
      <p className="text-center text-xs text-gray-300 dark:text-neutral-700 flex-shrink-0 pb-2">Secure checkout · Cancel anytime</p>
    </div>
  );
}
