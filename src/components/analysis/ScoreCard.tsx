import { ScoreRing } from "@/components/ui/ScoreRing";
import { getScoreLabel } from "@/lib/utils";
import type { Analysis } from "@/types";

export function ScoreCard({ analysis }: { analysis: Analysis }) {
  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Resume Scores</h2>
      <div className="flex flex-wrap gap-8 justify-center sm:justify-start mb-6">
        <div className="flex flex-col items-center gap-2">
          <ScoreRing score={analysis.resume_score} label="Overall Score" />
          <span className="text-xs font-semibold text-gray-500">
            {getScoreLabel(analysis.resume_score)}
          </span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <ScoreRing
            score={analysis.ats_score}
            label="ATS Score"
            color={analysis.ats_score >= 80 ? "#10b981" : analysis.ats_score >= 60 ? "#f59e0b" : "#ef4444"}
          />
          <span className="text-xs font-semibold text-gray-500">ATS Compatibility</span>
        </div>
      </div>

      <div className="p-4 bg-gray-50 rounded-xl">
        <p className="text-sm text-gray-600 leading-relaxed">{analysis.summary_feedback}</p>
      </div>

      {/* Keywords */}
      {(analysis.keywords_missing.length > 0 || analysis.keywords_present.length > 0) && (
        <div className="mt-5 grid sm:grid-cols-2 gap-4">
          {analysis.keywords_present.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">
                Keywords Found ✓
              </p>
              <div className="flex flex-wrap gap-1.5">
                {analysis.keywords_present.slice(0, 8).map((kw) => (
                  <span key={kw} className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
          {analysis.keywords_missing.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-2">
                Keywords Missing ✗
              </p>
              <div className="flex flex-wrap gap-1.5">
                {analysis.keywords_missing.slice(0, 8).map((kw) => (
                  <span key={kw} className="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded-full border border-red-100">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
