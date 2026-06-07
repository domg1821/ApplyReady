"use client";

import { useState, useEffect } from "react";
import { X, ArrowRight, Sparkles } from "lucide-react";

const STEPS = [
  {
    title: "Welcome to ApplyReady 🎉",
    body: "This is your dashboard. All your resumes live here. Let's take a 30-second tour to get you started.",
    position: "center",
  },
  {
    title: "Create a Resume",
    body: "Tap 'New Resume' to upload a PDF, paste your text, or start from scratch.",
    position: "top",
  },
  {
    title: "Resume Assessment",
    body: "Answer a few questions about your background and our AI will build a professional resume for you.",
    position: "center",
  },
  {
    title: "Analyse & Rewrite",
    body: "Once your resume is ready, run an AI analysis to get your score, then let the AI rewrite it for maximum impact.",
    position: "center",
  },
  {
    title: "You're all set!",
    body: "Start by creating your first resume. Tap the button in the top-right to begin.",
    position: "center",
    last: true,
  },
];

interface GuidedTourProps {
  onFinish: () => void;
}

export function GuidedTour({ onFinish }: GuidedTourProps) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 500);
    return () => clearTimeout(t);
  }, []);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    setVisible(false);
    setTimeout(onFinish, 300);
  };

  if (!visible) return null;

  const current = STEPS[step];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pb-8 px-4">
      {/* Dim overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={handleFinish} />

      {/* Tour card */}
      <div className="relative w-full max-w-sm bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Top gradient bar */}
        <div className="h-1 w-full gradient-brand" />

        <div className="p-6">
          {/* Step indicator */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === step
                      ? "w-5 bg-indigo-600 dark:bg-indigo-400"
                      : i < step
                      ? "w-1.5 bg-indigo-300 dark:bg-indigo-700"
                      : "w-1.5 bg-gray-200 dark:bg-neutral-700"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={handleFinish}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-start gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl gradient-brand flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1">{current.title}</h3>
              <p className="text-gray-500 dark:text-neutral-400 text-sm leading-relaxed">{current.body}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleFinish}
              className="flex-1 py-3 text-sm font-medium text-gray-500 dark:text-neutral-500 border border-gray-200 dark:border-neutral-700 rounded-2xl hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
            >
              Skip tour
            </button>
            <button
              onClick={handleNext}
              className="flex-1 py-3 text-sm font-semibold text-white gradient-brand rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-md"
            >
              {current.last ? "Let's go!" : "Next"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
