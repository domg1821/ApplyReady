"use client";

import type { TemplateId } from "@/types";

interface TemplateInfo {
  id: TemplateId;
  name: string;
  description: string;
  accent: string;    // header/accent color
  secondary: string; // secondary color
  layout: "left-bar" | "top-bar" | "centered" | "two-col";
  tier: "free" | "pro";
}

const TEMPLATES: TemplateInfo[] = [
  { id: "modern",      name: "Modern",       description: "Two-column indigo",  accent: "#4f46e5", secondary: "#f1f5f9", layout: "left-bar",  tier: "free" },
  { id: "executive",   name: "Executive",    description: "Bold & classic",     accent: "#111827", secondary: "#f9fafb", layout: "top-bar",   tier: "free" },
  { id: "minimal",     name: "Minimal",      description: "Clean whitespace",   accent: "#374151", secondary: "#ffffff", layout: "centered",  tier: "free" },
  { id: "student",     name: "Student",      description: "Education-first",    accent: "#0284c7", secondary: "#f0f9ff", layout: "top-bar",   tier: "free" },
  { id: "tech",        name: "Tech",         description: "Skills-focused",     accent: "#0f172a", secondary: "#1e293b", layout: "left-bar",  tier: "pro"  },
  { id: "creative",    name: "Creative",     description: "Teal + purple",      accent: "#0d9488", secondary: "#7c3aed", layout: "top-bar",   tier: "pro"  },
  { id: "corporate",   name: "Corporate",    description: "Navy + gold",        accent: "#1e3a5f", secondary: "#f59e0b", layout: "top-bar",   tier: "pro"  },
  { id: "bold",        name: "Bold",         description: "Big name energy",    accent: "#111827", secondary: "#111827", layout: "centered",  tier: "pro"  },
  { id: "elegant",     name: "Elegant",      description: "Serif & refined",    accent: "#b45309", secondary: "#fef3c7", layout: "centered",  tier: "pro"  },
  { id: "sidebar-dark",name: "Dark Side",    description: "Dark left sidebar",  accent: "#1a1a2e", secondary: "#818cf8", layout: "left-bar",  tier: "pro"  },
  { id: "classic",     name: "Classic",      description: "Timeless B&W",       accent: "#111827", secondary: "#ffffff", layout: "centered",  tier: "free" },
  { id: "navy",        name: "Navy",         description: "Navy + gold accents", accent: "#0f2444", secondary: "#d4af37", layout: "top-bar",   tier: "pro"  },
  { id: "compact",     name: "Compact",      description: "Fit more, say more", accent: "#059669", secondary: "#ecfdf5", layout: "top-bar",   tier: "pro"  },
  { id: "two-column",  name: "Two Column",   description: "Split layout",       accent: "#dc2626", secondary: "#fef2f2", layout: "two-col",   tier: "pro"  },
  { id: "gradient",    name: "Gradient",     description: "Vibrant & modern",   accent: "#6366f1", secondary: "#ec4899", layout: "top-bar",   tier: "pro"  },
];

function TemplateThumbnail({ t, selected }: { t: TemplateInfo; selected: boolean }) {
  const isLeftBar = t.layout === "left-bar";
  const isCentered = t.layout === "centered";
  const isTwoCol = t.layout === "two-col";

  return (
    <div
      className={`w-full h-full bg-white rounded overflow-hidden border-2 transition-all ${
        selected ? "border-indigo-500 shadow-md" : "border-transparent"
      }`}
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      {isLeftBar ? (
        <div className="flex h-full">
          <div className="w-5 h-full flex-shrink-0" style={{ backgroundColor: t.accent }} />
          <div className="flex-1 p-1 space-y-0.5">
            <div className="h-1.5 rounded-sm w-3/4" style={{ backgroundColor: t.accent, opacity: 0.8 }} />
            <div className="h-0.5 rounded-sm w-full bg-gray-200" />
            <div className="h-0.5 rounded-sm w-5/6 bg-gray-200" />
            <div className="h-0.5 rounded-sm bg-gray-100 w-4/5" />
            <div className="h-0.5 rounded-sm bg-gray-100 w-full" />
            <div className="h-0.5 rounded-sm bg-gray-100 w-3/4" />
          </div>
        </div>
      ) : isCentered ? (
        <div className="p-1 flex flex-col items-center gap-0.5">
          <div className="h-1.5 rounded-sm w-1/2" style={{ backgroundColor: t.accent }} />
          <div className="h-px rounded-sm w-3/4 bg-gray-300" />
          <div className="h-0.5 rounded-sm w-4/5 bg-gray-200 mt-0.5" />
          <div className="h-0.5 rounded-sm w-full bg-gray-100" />
          <div className="h-0.5 rounded-sm w-5/6 bg-gray-100" />
          <div className="h-0.5 rounded-sm w-3/4 bg-gray-100" />
        </div>
      ) : isTwoCol ? (
        <div className="flex h-full">
          <div className="w-5 h-full flex-shrink-0 p-0.5 space-y-0.5" style={{ backgroundColor: t.secondary }}>
            <div className="h-1 rounded-sm w-full" style={{ backgroundColor: t.accent, opacity: 0.7 }} />
            <div className="h-0.5 rounded-sm w-4/5 bg-gray-400 opacity-50" />
            <div className="h-0.5 rounded-sm w-3/4 bg-gray-400 opacity-40" />
          </div>
          <div className="flex-1 p-1 space-y-0.5">
            <div className="h-1 rounded-sm w-3/4" style={{ backgroundColor: t.accent, opacity: 0.8 }} />
            <div className="h-0.5 rounded-sm w-full bg-gray-200" />
            <div className="h-0.5 rounded-sm w-5/6 bg-gray-100" />
            <div className="h-0.5 rounded-sm w-full bg-gray-100" />
          </div>
        </div>
      ) : (
        // top-bar
        <div className="flex flex-col h-full">
          <div className="px-1 py-1 flex-shrink-0" style={{ backgroundColor: t.accent }}>
            <div className="h-1 rounded-sm w-1/2 bg-white opacity-80" />
            <div className="h-0.5 rounded-sm w-3/4 mt-0.5 bg-white opacity-40" />
          </div>
          <div className="flex-1 p-1 space-y-0.5">
            <div className="h-0.5 rounded-sm w-full bg-gray-200" />
            <div className="h-0.5 rounded-sm w-5/6 bg-gray-100" />
            <div className="h-0.5 rounded-sm w-full bg-gray-100" />
            <div className="h-0.5 rounded-sm w-4/5 bg-gray-100" />
          </div>
        </div>
      )}
    </div>
  );
}

export function TemplateSelector({
  selected,
  onChange,
  isPro = false,
}: {
  selected: TemplateId;
  onChange: (t: TemplateId) => void;
  isPro?: boolean;
}) {
  return (
    <div className="flex-shrink-0">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 dark:border-neutral-800">
        <p className="text-xs font-bold text-gray-500 dark:text-neutral-400 uppercase tracking-widest">Templates</p>
        <span className="text-xs text-gray-300 dark:text-neutral-600">{TEMPLATES.length} designs</span>
      </div>
      <div className="flex gap-2.5 px-4 py-3 overflow-x-auto scrollbar-hide">
        {TEMPLATES.map((t) => {
          const locked = t.tier === "pro" && !isPro;
          const isSelected = selected === t.id;
          return (
            <button
              key={t.id}
              onClick={() => !locked && onChange(t.id)}
              className={`flex-shrink-0 flex flex-col gap-1 transition-all active:scale-95 ${locked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              title={locked ? `${t.name} — Pro only` : t.name}
            >
              {/* Thumbnail */}
              <div
                className={`w-14 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  isSelected
                    ? "border-indigo-500 shadow-lg shadow-indigo-100 dark:shadow-indigo-900/30 scale-105"
                    : "border-gray-200 dark:border-neutral-700 hover:border-indigo-300"
                }`}
              >
                <TemplateThumbnail t={t} selected={isSelected} />
              </div>
              {/* Label */}
              <p className={`text-center text-[10px] font-semibold leading-tight ${
                isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-neutral-400"
              }`}>
                {t.name}
              </p>
              {locked && (
                <p className="text-center text-[9px] text-amber-500 font-bold -mt-0.5">Pro</p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
