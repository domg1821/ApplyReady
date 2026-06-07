"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Briefcase, Sparkles, Loader2, ChevronDown, TrendingUp, AlertTriangle, CheckCircle2, ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { BottomNav } from "@/components/layout/BottomNav";
import type { ResumeData } from "@/types";
import toast from "react-hot-toast";

interface MatchData {
  score: number;
  verdict: string;
  summary: string;
  presentKeywords: string[];
  missingKeywords: string[];
  improvements: { area: string; suggestion: string; priority: "high" | "medium" | "low" }[];
  strengthBullets: string[];
  bulletImprovements: { original: string; improved: string }[];
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  const label = score >= 75 ? "Strong Match" : score >= 50 ? "Good Match" : score >= 30 ? "Partial Match" : "Weak Match";
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgb(var(--surface-2))" strokeWidth="2.5" />
          <circle cx="18" cy="18" r="15.9" fill="none" stroke={color} strokeWidth="2.5"
            strokeDasharray={`${score} 100`} strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
          />
        </svg>
        <div className="absolute text-center">
          <p className="text-2xl font-black" style={{ color }}>{score}</p>
          <p className="text-[9px] font-bold" style={{ color: "rgb(var(--text-muted))" }}>/ 100</p>
        </div>
      </div>
      <p className="text-sm font-bold" style={{ color }}>{label}</p>
    </div>
  );
}

export default function JobMatchPage() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResume, setSelectedResume] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MatchData | null>(null);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const [{ data: profile }, { data: resumeList }] = await Promise.all([
        supabase.from("profiles").select("subscription_tier").eq("id", user.id).single(),
        supabase.from("resumes").select("id, title, resume_data, rewritten_data").eq("user_id", user.id).order("updated_at", { ascending: false }),
      ]);
      if (profile?.subscription_tier !== "pro") { router.push("/upgrade"); return; }
      setIsPro(true);
      setResumes(resumeList ?? []);
      if (resumeList?.length) setSelectedResume(resumeList[0].id);
    };
    load();
  }, [router]);

  const analyze = async () => {
    if (!selectedResume || !jobDescription) { toast.error("Select a resume and paste the job description"); return; }
    setLoading(true); setResult(null);
    try {
      const resume = resumes.find((r) => r.id === selectedResume);
      const resumeData: ResumeData = resume?.rewritten_data ?? resume?.resume_data;
      const res = await fetch("/api/tools/job-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData, jobDescription, jobTitle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.matchData);
    } catch { toast.error("Analysis failed. Please try again."); }
    finally { setLoading(false); }
  };

  if (!isPro) return <div className="screen items-center justify-center" style={{ backgroundColor: "rgb(var(--bg))" }}><Loader2 className="w-6 h-6 animate-spin" style={{ color: "#a855f7" }} /></div>;

  const priorityColor = { high: "#ef4444", medium: "#f59e0b", low: "#10b981" };

  return (
    <div className="min-h-screen animate-page-in" style={{ backgroundColor: "rgb(var(--bg))" }}>
      <div className="border-b" style={{ backgroundColor: "rgb(var(--surface))", borderColor: "rgb(var(--border))", paddingTop: "max(1rem, env(safe-area-inset-top))" }}>
        <div className="max-w-2xl mx-auto px-5 pb-4 flex items-center gap-3">
          <button onClick={() => router.push("/tools")} className="p-1.5 rounded-xl" style={{ color: "rgb(var(--text-muted))" }}><ArrowLeft className="w-5 h-5" /></button>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(2,132,199,0.15)" }}><Briefcase className="w-4 h-4" style={{ color: "#0284c7" }} /></div>
          <div>
            <p className="font-bold text-sm" style={{ color: "rgb(var(--text-primary))" }}>Job Match Analyzer</p>
            <p className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>See how well your resume fits</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-5 pb-28 space-y-4">
        <div>
          <label className="label">Your resume</label>
          <div className="relative">
            <select value={selectedResume} onChange={(e) => setSelectedResume(e.target.value)} className="input-field appearance-none pr-10">
              {resumes.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "rgb(var(--text-muted))" }} />
          </div>
        </div>

        <div>
          <label className="label">Job title <span style={{ color: "rgb(var(--text-muted))" }}>(optional)</span></label>
          <input className="input-field" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Senior Product Manager" />
        </div>

        <div>
          <label className="label">Job description <span style={{ color: "#0284c7" }}>*</span></label>
          <textarea className="input-field" rows={6} value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste the full job description here — requirements, responsibilities, qualifications…" />
        </div>

        <button onClick={analyze} disabled={loading || !jobDescription} className="w-full py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #0284c7, #0d9488)", boxShadow: loading ? "none" : "0 4px 20px rgba(2,132,199,0.35)" }}>
          {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing your match…</> : <><Sparkles className="w-5 h-5" /> Analyze Match</>}
        </button>

        {result && (
          <div className="space-y-4 animate-scale-in">
            {/* Score */}
            <div className="card p-6 flex flex-col items-center gap-2">
              <ScoreRing score={result.score} />
              <p className="text-sm text-center leading-relaxed mt-1" style={{ color: "rgb(var(--text-secondary))" }}>{result.summary}</p>
            </div>

            {/* Keywords present */}
            {result.presentKeywords?.length > 0 && (
              <div className="card p-4">
                <div className="flex items-center gap-2 mb-3"><CheckCircle2 className="w-4 h-4 text-emerald-500" /><p className="text-xs font-bold uppercase tracking-widest text-emerald-500">Keywords Matched</p></div>
                <div className="flex flex-wrap gap-1.5">
                  {result.presentKeywords.map((k) => <span key={k} className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">{k}</span>)}
                </div>
              </div>
            )}

            {/* Missing keywords */}
            {result.missingKeywords?.length > 0 && (
              <div className="card p-4">
                <div className="flex items-center gap-2 mb-3"><AlertTriangle className="w-4 h-4 text-amber-500" /><p className="text-xs font-bold uppercase tracking-widest text-amber-500">Missing Keywords</p></div>
                <div className="flex flex-wrap gap-1.5">
                  {result.missingKeywords.map((k) => <span key={k} className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">{k}</span>)}
                </div>
              </div>
            )}

            {/* Improvements */}
            {result.improvements?.length > 0 && (
              <div className="card p-4">
                <div className="flex items-center gap-2 mb-3"><TrendingUp className="w-4 h-4" style={{ color: "#a855f7" }} /><p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#a855f7" }}>Improvements</p></div>
                <div className="space-y-3">
                  {result.improvements.map((imp, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-0.5 flex-shrink-0"
                        style={{ backgroundColor: `${priorityColor[imp.priority]}15`, color: priorityColor[imp.priority] }}>
                        {imp.priority}
                      </span>
                      <div>
                        <p className="text-xs font-semibold mb-0.5" style={{ color: "rgb(var(--text-primary))" }}>{imp.area}</p>
                        <p className="text-xs leading-relaxed" style={{ color: "rgb(var(--text-secondary))" }}>{imp.suggestion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bullet improvements */}
            {result.bulletImprovements?.length > 0 && (
              <div className="card p-4">
                <div className="flex items-center gap-2 mb-3"><ArrowUpRight className="w-4 h-4" style={{ color: "#0284c7" }} /><p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#0284c7" }}>Suggested Bullet Rewrites</p></div>
                <div className="space-y-3">
                  {result.bulletImprovements.map((b, i) => (
                    <div key={i} className="space-y-1.5">
                      <p className="text-xs line-through" style={{ color: "rgb(var(--text-muted))" }}>• {b.original}</p>
                      <p className="text-xs font-medium" style={{ color: "rgb(var(--text-primary))" }}>→ {b.improved}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
