import { AlertTriangle, AlertCircle, Info, ChevronRight } from "lucide-react";
import type { FeedbackItem } from "@/types";

const SEVERITY_CONFIG = {
  high: {
    icon: AlertTriangle,
    color: "text-red-500",
    bg: "bg-red-50 border-red-100",
    badge: "bg-red-100 text-red-700",
  },
  medium: {
    icon: AlertCircle,
    color: "text-amber-500",
    bg: "bg-amber-50 border-amber-100",
    badge: "bg-amber-100 text-amber-700",
  },
  low: {
    icon: Info,
    color: "text-blue-500",
    bg: "bg-blue-50 border-blue-100",
    badge: "bg-blue-100 text-blue-700",
  },
};

const CATEGORY_LABELS: Record<FeedbackItem["category"], string> = {
  bullet_points: "Bullet Points",
  formatting: "Formatting",
  keywords: "Keywords",
  summary: "Summary",
  achievements: "Achievements",
  general: "General",
};

export function FeedbackList({ feedback }: { feedback: FeedbackItem[] }) {
  const sorted = [...feedback].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.severity] - order[b.severity];
  });

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-5">
        Detailed Feedback
        <span className="ml-2 text-sm font-normal text-gray-400">
          ({feedback.length} items)
        </span>
      </h2>

      <div className="space-y-3">
        {sorted.map((item, i) => {
          const config = SEVERITY_CONFIG[item.severity];
          const Icon = config.icon;
          return (
            <div
              key={i}
              className={`p-4 rounded-xl border ${config.bg}`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${config.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-sm text-gray-900">{item.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.badge}`}>
                      {item.severity}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                      {CATEGORY_LABELS[item.category]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  <div className="flex items-start gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700 font-medium">{item.suggestion}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
