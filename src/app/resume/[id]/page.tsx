"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Sparkles, Download, Edit3, Lock, Loader2, RefreshCw, ArrowLeft,
  BarChart2, FileText, FileDown, Copy, Trash2, TrendingUp,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ScoreCard } from "@/components/analysis/ScoreCard";
import { FeedbackList } from "@/components/analysis/FeedbackList";
import { UpgradeModal } from "@/components/analysis/UpgradeModal";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { TemplateSelector } from "@/components/resume/TemplateSelector";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { BottomNav } from "@/components/layout/BottomNav";
import type { Resume, Analysis, Profile, TemplateId } from "@/types";
import toast from "react-hot-toast";

type LoadingKey = "analyzing" | "rewriting" | "exporting" | "exporting-docx" | "duplicating" | "deleting" | null;
type View = "template" | "analysis";

export default function ResumePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const mountedRef = useRef(true);

  const [resume, setResume] = useState<Resume | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [activeAction, setActiveAction] = useState<LoadingKey>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [view, setView] = useState<View>("template");
  const [template, setTemplate] = useState<TemplateId>("modern");

  const isPro = profile?.subscription_tier === "pro";

  const displayData = useMemo(
    () => resume?.rewritten_data ?? resume?.resume_data ?? null,
    [resume]
  );

  useEffect(() => {
    mountedRef.current = true;
    const supabase = createClient();

    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const [profileResult, resumeResult, analysisResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("resumes").select("*").eq("id", id).eq("user_id", user.id).single(),
        supabase.from("analyses").select("*").eq("resume_id", id)
          .order("created_at", { ascending: false }).limit(1).maybeSingle(),
      ]);

      if (!mountedRef.current) return;
      if (!resumeResult.data) { router.push("/resumes"); return; }

      setProfile(profileResult.data);
      setResume(resumeResult.data);
      setAnalysis(analysisResult.data);
      if (resumeResult.data.template) setTemplate(resumeResult.data.template as TemplateId);
      setPageLoading(false);
    };

    load();
    return () => { mountedRef.current = false; };
  }, [id, router]);

  const handleAnalyze = useCallback(async () => {
    if (!resume?.raw_text && !resume?.resume_data) {
      toast.error("Add resume content first");
      return;
    }
    if (!isPro && (profile?.analyses_used ?? 0) >= 1) {
      setShowUpgrade(true);
      return;
    }
    setActiveAction("analyzing");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: id }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json() as { analysis: Analysis };
      if (!mountedRef.current) return;
      setAnalysis(data.analysis);
      setResume((r) => r ? { ...r, status: "analyzed" } : r);
      setView("analysis");
      toast.success("Analysis complete!");
    } catch {
      toast.error("Analysis failed — please try again.");
    } finally {
      if (mountedRef.current) setActiveAction(null);
    }
  }, [resume, isPro, profile?.analyses_used, id]);

  const handleRewrite = useCallback(async () => {
    if (!isPro) { setShowUpgrade(true); return; }
    setActiveAction("rewriting");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: id }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json() as { resume: Resume };
      if (!mountedRef.current) return;
      setResume(data.resume);
      setView("template");
      toast.success("Resume rewritten!");
    } catch {
      toast.error("Rewrite failed — please try again.");
    } finally {
      if (mountedRef.current) setActiveAction(null);
    }
  }, [isPro, id]);

  const handleExport = useCallback(async () => {
    if (!isPro) { setShowUpgrade(true); return; }
    if (!resume || !displayData) { toast.error("No resume data to export"); return; }
    setActiveAction("exporting");
    try {
      const { exportResumeToPDF } = await import("@/lib/pdf-export");
      await exportResumeToPDF(displayData, template, resume.title ?? "resume");
      toast.success("PDF downloaded!");
    } catch {
      toast.error("Export failed — please try again.");
    } finally {
      if (mountedRef.current) setActiveAction(null);
    }
  }, [isPro, resume, displayData, template]);

  const handleExportDocx = useCallback(async () => {
    if (!isPro) { setShowUpgrade(true); return; }
    if (!displayData) { toast.error("No resume data to export"); return; }
    setActiveAction("exporting-docx");
    try {
      const { exportResumeToDocx } = await import("@/lib/docx-export");
      await exportResumeToDocx(displayData, resume?.title ?? "resume");
      toast.success("Word document downloaded!");
    } catch {
      toast.error("Export failed — please try again.");
    } finally {
      if (mountedRef.current) setActiveAction(null);
    }
  }, [isPro, resume, displayData]);

  const handleDuplicate = useCallback(async () => {
    setActiveAction("duplicating");
    try {
      const res = await fetch(`/api/resume/${id}`, { method: "POST" });
      if (!res.ok) throw new Error();
      const data = await res.json() as { resume: { id: string } };
      toast.success("Resume duplicated!");
      router.push(`/resume/${data.resume.id}`);
    } catch {
      toast.error("Failed to duplicate — please try again.");
      if (mountedRef.current) setActiveAction(null);
    }
  }, [id, router]);

  const handleDelete = useCallback(async () => {
    if (!window.confirm(`Delete "${resume?.title}"? This cannot be undone.`)) return;
    setActiveAction("deleting");
    try {
      const res = await fetch(`/api/resume/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Resume deleted");
      router.push("/resumes");
    } catch {
      toast.error("Failed to delete — please try again.");
      if (mountedRef.current) setActiveAction(null);
    }
  }, [id, resume?.title, router]);

  const saveTemplate = useCallback(async (t: TemplateId) => {
    setTemplate(t);
    const supabase = createClient();
    await supabase.from("resumes").update({ template: t }).eq("id", id);
  }, [id]);

  if (pageLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50 dark:bg-neutral-950">
        <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!resume) return null;

  // ── Template / Document View ──────────────────────────────
  if (view === "template") {
    return (
      <div className="fixed inset-0 flex flex-col bg-gray-100 dark:bg-neutral-800"
        style={{ paddingTop: "env(safe-area-inset-top)" }}>
        {/* Top bar */}
        <div className="bg-white dark:bg-neutral-900 border-b border-gray-100 dark:border-neutral-800 flex-shrink-0 shadow-sm">
          {/* Title row */}
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              onClick={() => router.push("/resumes")}
              className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{resume.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant={resume.status === "rewritten" ? "success" : resume.status === "analyzed" ? "warning" : "default"}>
                  {resume.status}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Analysis button */}
              <button
                onClick={() => analysis ? setView("analysis") : handleAnalyze()}
                disabled={activeAction === "analyzing"}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/40 hover:bg-indigo-100 transition-colors"
              >
                {activeAction === "analyzing" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BarChart2 className="w-3.5 h-3.5" />}
                {analysis ? "Analysis" : "Analyse"}
              </button>
              {/* Edit */}
              <button onClick={() => router.push(`/resume/${id}/edit`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-neutral-300 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors">
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
              {/* Duplicate */}
              <button onClick={handleDuplicate} disabled={!!activeAction}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-neutral-300 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
                title="Duplicate resume">
                {activeAction === "duplicating" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              {/* Delete */}
              <button onClick={handleDelete} disabled={!!activeAction}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                title="Delete resume">
                {activeAction === "deleting" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Template selector carousel */}
          <TemplateSelector selected={template} onChange={saveTemplate} isPro={isPro} />

          {/* Action row */}
          <div className="flex items-center gap-2 px-4 py-2 border-t border-gray-50 dark:border-neutral-800">
            <Button
              onClick={handleRewrite}
              loading={activeAction === "rewriting"}
              size="sm"
              icon={isPro ? <Sparkles className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              className="flex-1"
            >
              {isPro ? "AI Rewrite" : "Rewrite · Pro"}
            </Button>
            <Button
              variant="secondary"
              onClick={handleExport}
              loading={activeAction === "exporting"}
              size="sm"
              icon={isPro ? <Download className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              className="flex-1"
            >
              PDF
            </Button>
            <Button
              variant="secondary"
              onClick={handleExportDocx}
              loading={activeAction === "exporting-docx"}
              size="sm"
              icon={isPro ? <FileDown className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              className="flex-1"
            >
              Word
            </Button>
          </div>
        </div>

        {/* A4 Document area */}
        <div className="flex-1 overflow-y-auto" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 4rem)" }}>
          {displayData ? (
            <ResumePreview data={displayData} template={template} isPro={isPro} fullPage />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
              <div className="w-16 h-16 rounded-2xl bg-gray-200 dark:bg-neutral-700 flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-400 dark:text-neutral-500" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-700 dark:text-neutral-300 mb-1">No content yet</p>
                <p className="text-sm text-gray-400 dark:text-neutral-500 mb-4">Add your resume data to see a preview</p>
                <Button onClick={() => router.push(`/resume/${id}/edit`)} icon={<Edit3 className="w-4 h-4" />} size="sm">
                  Open Editor
                </Button>
              </div>
            </div>
          )}
        </div>

        <BottomNav />
        <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
      </div>
    );
  }

  // ── Analysis View ─────────────────────────────────────────
  return (
    <div className="fixed inset-0 flex flex-col bg-gray-50 dark:bg-neutral-950"
      style={{ paddingTop: "env(safe-area-inset-top)" }}>
      {/* Top bar */}
      <div className="bg-white dark:bg-neutral-900 border-b border-gray-100 dark:border-neutral-800 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => setView("template")}
          className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <p className="font-bold text-gray-900 dark:text-white text-sm">Analysis Report</p>
          <p className="text-xs text-gray-400 dark:text-neutral-500 mt-0.5">{resume.title}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="secondary"
            onClick={handleAnalyze}
            loading={activeAction === "analyzing"}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            size="sm"
          >
            Re-run
          </Button>
          <Button
            onClick={handleRewrite}
            loading={activeAction === "rewriting"}
            size="sm"
            icon={isPro ? <Sparkles className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
          >
            Rewrite
          </Button>
        </div>
      </div>

      {/* Analysis content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 5rem)" }}>
        {analysis ? (
          <>
            <ScoreCard analysis={analysis} />

            {/* What's Next — priority actions */}
            {analysis.feedback?.filter((f) => f.severity === "high").length > 0 && (
              <div className="rounded-2xl p-4" style={{ background: "linear-gradient(135deg, rgba(147,97,253,0.08), rgba(99,102,241,0.08))", border: "1px solid rgba(147,97,253,0.2)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4" style={{ color: "#a855f7" }} />
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#a855f7" }}>Top Priority Fixes</p>
                </div>
                <div className="space-y-2">
                  {analysis.feedback.filter((f) => f.severity === "high").slice(0, 3).map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5 text-white" style={{ backgroundColor: "#a855f7" }}>{i + 1}</span>
                      <div>
                        <p className="text-xs font-semibold" style={{ color: "rgb(var(--text-primary))" }}>{f.title}</p>
                        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "rgb(var(--text-muted))" }}>{f.suggestion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <FeedbackList feedback={analysis.feedback} />
            {!isPro && <LockedRewriteCard onUpgrade={() => setShowUpgrade(true)} />}
          </>
        ) : (
          <div className="card p-8 text-center">
            <BarChart2 className="w-10 h-10 text-gray-300 dark:text-neutral-600 mx-auto mb-3" />
            <p className="font-semibold text-gray-700 dark:text-neutral-300 mb-1">No analysis yet</p>
            <p className="text-sm text-gray-400 dark:text-neutral-500 mb-4">Run an AI analysis to get your ATS score and feedback</p>
            <Button onClick={handleAnalyze} loading={activeAction === "analyzing"} icon={<Sparkles className="w-4 h-4" />}>
              Analyse Resume
            </Button>
          </div>
        )}
      </div>

      <BottomNav />
      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </div>
  );
}

function LockedRewriteCard({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <div className="card p-6 relative overflow-hidden">
      <div className="blur-locked space-y-2 mb-2">
        <div className="h-3 bg-gray-200 dark:bg-neutral-700 rounded w-1/3" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`h-2.5 bg-gray-100 dark:bg-neutral-800 rounded ${i % 3 === 0 ? "w-2/3" : "w-full"}`} />
        ))}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm">
        <Lock className="w-7 h-7 text-indigo-400 mb-2" />
        <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Pro feature</p>
        <p className="text-xs text-gray-500 dark:text-neutral-400 mb-3 text-center max-w-[200px]">
          Unlock your fully rewritten professional resume
        </p>
        <Button onClick={onUpgrade} size="sm" icon={<Sparkles className="w-3.5 h-3.5" />}>
          Unlock — $15 lifetime
        </Button>
      </div>
    </div>
  );
}
