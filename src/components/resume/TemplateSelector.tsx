"use client";

import type { TemplateId } from "@/types";

const TEMPLATES: { id: TemplateId; name: string; description: string }[] = [
  { id: "modern", name: "Modern", description: "Clean sidebar layout" },
  { id: "executive", name: "Executive", description: "Bold header, classic" },
  { id: "minimal", name: "Minimal", description: "Whitespace-forward" },
  { id: "student", name: "Student", description: "Highlights education" },
  { id: "tech", name: "Tech", description: "Skills-first, dark accent" },
];

export function TemplateSelector({
  selected,
  onChange,
}: {
  selected: TemplateId;
  onChange: (t: TemplateId) => void;
}) {
  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Template</h3>
      <div className="flex gap-2 flex-wrap">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all border ${
              selected === t.id
                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                : "bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>
    </div>
  );
}
