"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sparkles, Download, Edit3, Lock, Loader2, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ScoreCard } from "@/components/analysis/ScoreCard";
import { FeedbackList } from "@/components/analysis/FeedbackList";
import { UpgradeModal } from "@/components/analysis/UpgradeModal";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { TemplateSelector } from "@/components/resume/TemplateSelector";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { Resume, Analysis, Profile, TemplateId } from "@/types";
import toast from "react-hot-toast";

export default function ResumePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [resume, setResume] = useState<Resume | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [activeTab, setActiveTab] = useState<"analysis" | "preview">("analysis");
  const [template, setTemplate] = useState<TemplateId>("modern");

  const isPro = profile?.subscription_tier === "pro";

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const [{ data: profileData }, { data: resumeData }, { data: analysisData }] =
        await Promise.all([
          supabase.from("profiles").select("*").eq("id", user.id).single(),
          supabase.from("resumes").select("*").eq("id", id).eq("user_id", user.id).single(),
          supabase.from("analyses").select("*").eq("resume_id", id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        ]);

      if (!resumeData) { router.push("/dashboard"); return; }

      setProfile(profileData);
      setResume(resumeData);
      setAnalysis(analysisData);
      if (resumeData.template) setTemplate(resumeData.template as TemplateId);
      setLoading(false);
    };
    load();
  }, [id, router]);

  const handleAnalyze = async () => {
    if (!resume?.raw_text) {
      toast.error("No resume text to analyze");
      return;
    }
    if (!isPro && (profile?.analyses_used ?? 0) >= 1) {
      setShowUpgrade(true);
      return;
    }

    setAnalyzing(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: id }),
      });
      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json() as { analysis: Analysis };
      setAnalysis(data.analysis);
      setResume((r) => r ? { ...r, status: "analyzed" } : r);
      toast.success("Analysis complete!");
    } catch {
      toast.error("Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRewrite = async () => {
    if (!isPro) { setShowUpgrade(true); return; }
    setRewriting(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: id }),
      });
      if (!res.ok) throw new Error("Rewrite failed");
      const data = await res.json() as { resume: Resume };
      setResume(data.resume);
      toast.success("Resume rewritten!");
      setActiveTab("preview");
    } catch {
      toast.error("Rewrite failed. Please try again.");
    } finally {
      setRewriting(false);
    }
  };

  const handleExport = async () => {
    if (!isPro) { setShowUpgrade(true); return; }
    setExporting(true);
    try {
      const res = await fetch("/api/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: id, template }),
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${resume?.title ?? "resume"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded!");
    } catch {
      toast.error("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!resume) return null;

  const displayData = resume.rewritten_data ?? resume.resume_data;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">{resume.title}</h1>
            <Badge
              variant={
                resume.status === "rewritten"
                  ? "success"
                  : resume.status === "analyzed"
                  ? "warning"
                  : "default"
              }
            >
              {resume.status}
            </Badge>
          </div>
          <p className="text-sm text-gray-400">
            Last updated{" "}
            {new Date(resume.updated_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!analysis && (
            <Button onClick={handleAnalyze} loading={analyzing} icon={<Sparkles className="w-4 h-4" />}>
              Analyze Resume
            </Button>
          )}
          {analysis && (
            <>
              <Button variant="secondary" onClick={handleAnalyze} loading={analyzing} icon={<RefreshCw className="w-4 h-4" />}>
                Re-analyze
              </Button>
              <Button
                onClick={handleRewrite}
                loading={rewriting}
                icon={isPro ? <Sparkles className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              >
                {isPro ? "AI Rewrite" : "AI Rewrite · Pro"}
              </Button>
              <Button
                variant="secondary"
                onClick={handleExport}
                loading={exporting}
                icon={isPro ? <Download className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              >
                Export PDF
              </Button>
            </>
          )}
          <Button variant="ghost" onClick={() => router.push(`/resume/${id}/edit`)} icon={<Edit3 className="w-4 h-4" />}>
            Edit
          </Button>
        </div>
      </div>

      {/* No text state */}
      {!resume.raw_text && !resume.resume_data && (
        <div className="card p-10 text-center">
          <p className="text-gray-500 mb-4">No resume content yet. Edit your resume to add your information.</p>
          <Button onClick={() => router.push(`/resume/${id}/edit`)} icon={<Edit3 className="w-4 h-4" />}>
            Open Resume Builder
          </Button>
        </div>
      )}

      {/* Tabs */}
      {(analysis || displayData) && (
        <>
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit mb-6">
            {(["analysis", "preview"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all capitalize ${
                  activeTab === tab ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "analysis" && analysis && (
            <div className="space-y-5 animate-fade-in">
              <ScoreCard analysis={analysis} />
              <FeedbackList feedback={analysis.feedback} />

              {/* Blurred preview for free users */}
              {!isPro && (
                <div className="card p-6 relative overflow-hidden">
                  <div className="blur-locked">
                    <h3 className="font-semibold text-gray-900 mb-4">AI Rewritten Resume</h3>
                    <div className="space-y-2">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className={`h-3 bg-gray-200 rounded ${i % 3 === 0 ? "w-1/3" : "w-full"}`} />
                      ))}
                    </div>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm">
                    <Lock className="w-8 h-8 text-indigo-400 mb-3" />
                    <p className="font-semibold text-gray-900 mb-1">Pro feature</p>
                    <p className="text-sm text-gray-500 mb-4 text-center max-w-xs">
                      Upgrade to see your fully rewritten professional resume
                    </p>
                    <Button onClick={() => setShowUpgrade(true)} icon={<Sparkles className="w-4 h-4" />}>
                      Unlock Full Rewrite
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "preview" && (
            <div className="space-y-5 animate-fade-in">
              {isPro && (
                <TemplateSelector
                  selected={template}
                  onChange={setTemplate}
                />
              )}
              {displayData ? (
                <ResumePreview data={displayData} template={template} isPro={isPro} />
              ) : (
                <div className="card p-10 text-center">
                  <p className="text-gray-500">No preview available yet. Run an analysis first.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </div>
  );
}
