"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageSquare, Sparkles, Loader2, ChevronDown, ChevronUp, Lock, Crown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { BottomNav } from "@/components/layout/BottomNav";
import type { ResumeData } from "@/types";
import { isToolLocked, incrementToolUse, hasFreeTrial } from "@/lib/tool-usage";
import { saveOutput } from "@/lib/saved-outputs";
import toast from "react-hot-toast";
import Link from "next/link";

const TOOL = "interview-prep";

interface Question {
  question: string;
  category: "behavioral" | "technical" | "background" | "situational" | "intro";
  whyAsked: string;
  answerFramework: string;
  sampleTalkingPoints: string[];
}

const CATEGORY_STYLE: Record<Question["category"], { label: string; color: string; bg: string }> = {
  behavioral:  { label: "Behavioral",  color: "#f59e0b", bg: "rgba(245,158,11,0.1)"  },
  technical:   { label: "Technical",   color: "#0284c7", bg: "rgba(2,132,199,0.1)"   },
  background:  { label: "Background",  color: "#a855f7", bg: "rgba(168,85,247,0.1)"  },
  situational: { label: "Situational", color: "#10b981", bg: "rgba(16,185,129,0.1)"  },
  intro:       { label: "Intro",       color: "#6366f1", bg: "rgba(99,102,241,0.1)"  },
};

function QuestionCard({ q, index }: { q: Question; index: number }) {
  const [open, setOpen] = useState(false);
  const style = CATEGORY_STYLE[q.category] ?? CATEGORY_STYLE.background;

  return (
    <div className="card overflow-hidden">
      <button className="w-full text-left p-4" onClick={() => setOpen((o) => !o)}>
        <div className="flex items-start gap-3">
          <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
            style={{ backgroundColor: style.bg, color: style.color }}>
            {index + 1}
          </span>
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{ backgroundColor: style.bg, color: style.color }}>
                {style.label}
              </span>
            </div>
            <p className="text-sm font-semibold leading-snug" style={{ color: "rgb(var(--text-primary))" }}>{q.question}</p>
          </div>
          <div className="flex-shrink-0 mt-0.5" style={{ color: "rgb(var(--text-muted))" }}>
            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 animate-slide-in-up border-t" style={{ borderColor: "rgb(var(--border))" }}>
          <div className="pt-3">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "rgb(var(--text-muted))" }}>Why they ask this</p>
            <p className="text-xs leading-relaxed" style={{ color: "rgb(var(--text-secondary))" }}>{q.whyAsked}</p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: style.color }}>How to answer</p>
            <p className="text-xs leading-relaxed" style={{ color: "rgb(var(--text-secondary))" }}>{q.answerFramework}</p>
          </div>

          {q.sampleTalkingPoints?.length > 0 && (
            <div className="rounded-xl p-3" style={{ backgroundColor: style.bg }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: style.color }}>Your talking points</p>
              <ul className="space-y-1.5">
                {q.sampleTalkingPoints.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "rgb(var(--text-primary))" }}>
                    <span className="mt-0.5 flex-shrink-0" style={{ color: style.color }}>•</span>
                    <span className="leading-relaxed">{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function InterviewPrepPage() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResume, setSelectedResume] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isPro, setIsPro] = useState(false);
  const [userId, setUserId] = useState("");
  const [pageReady, setPageReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const [{ data: profile }, { data: resumeList }] = await Promise.all([
        supabase.from("profiles").select("subscription_tier").eq("id", user.id).single(),
        supabase.from("resumes").select("id, title, resume_data, rewritten_data").eq("user_id", user.id).order("updated_at", { ascending: false }),
      ]);
      const pro = profile?.subscription_tier === "pro";
      setIsPro(pro);
      setUserId(user.id);
      setResumes(resumeList ?? []);
      if (resumeList?.length) setSelectedResume(resumeList[0].id);
      setPageReady(true);
      if (!pro && !hasFreeTrial(user.id, TOOL)) router.push("/upgrade");
    };
    load();
  }, [router]);

  const generate = async () => {
    if (!selectedResume || !jobTitle) { toast.error("Select a resume and enter the job title"); return; }
    if (!isPro && isToolLocked(isPro, userId, TOOL)) { router.push("/upgrade"); return; }
    setLoading(true); setQuestions([]);
    try {
      const resume = resumes.find((r) => r.id === selectedResume);
      const resumeData: ResumeData = resume?.rewritten_data ?? resume?.resume_data;
      const res = await fetch("/api/tools/interview-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData, jobTitle, jobDescription }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQuestions(data.questions);
      if (!isPro) incrementToolUse(userId, TOOL);
      saveOutput(userId, { tool: TOOL, label: `Interview Prep — ${jobTitle}`, content: data.questions.map((q: Question, i: number) => `${i+1}. ${q.question}`).join("\n") });
    } catch { toast.error("Generation failed. Please try again."); }
    finally { setLoading(false); }
  };

  if (!pageReady) return <div className="screen items-center justify-center" style={{ backgroundColor: "rgb(var(--bg))" }}><Loader2 className="w-6 h-6 animate-spin" style={{ color: "#a855f7" }} /></div>;

  if (resumes.length === 0) return (
    <div className="fixed inset-0 flex flex-col" style={{ backgroundColor: "rgb(var(--bg))" }}>
      <div className="border-b" style={{ backgroundColor: "rgb(var(--surface))", borderColor: "rgb(var(--border))", paddingTop: "max(1rem, env(safe-area-inset-top))" }}>
        <div className="max-w-2xl mx-auto px-5 pb-4 flex items-center gap-3">
          <button onClick={() => router.push("/tools")} className="p-1.5 rounded-xl" style={{ color: "rgb(var(--text-muted))" }}><ArrowLeft className="w-5 h-5" /></button>
          <p className="font-bold text-sm" style={{ color: "rgb(var(--text-primary))" }}>Interview Prep</p>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-5 py-10 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(245,158,11,0.1)" }}>
          <MessageSquare className="w-8 h-8" style={{ color: "#f59e0b" }} />
        </div>
        <p className="font-bold text-lg mb-2" style={{ color: "rgb(var(--text-primary))" }}>You need a resume first</p>
        <p className="text-sm mb-6" style={{ color: "rgb(var(--text-muted))" }}>Build a resume with Alex and I&apos;ll tailor interview questions to your background.</p>
        <Link href="/assessment"><button className="btn-primary mx-auto">Chat with Alex</button></Link>
      </div>
      <BottomNav />
    </div>
  );

  const locked = isToolLocked(isPro, userId, TOOL);

  return (
    <div className="fixed inset-0 flex flex-col animate-page-in" style={{ backgroundColor: "rgb(var(--bg))" }}>
      <div className="border-b" style={{ backgroundColor: "rgb(var(--surface))", borderColor: "rgb(var(--border))", paddingTop: "max(1rem, env(safe-area-inset-top))" }}>
        <div className="max-w-2xl mx-auto px-5 pb-4 flex items-center gap-3">
          <button onClick={() => router.push("/tools")} className="p-1.5 rounded-xl" style={{ color: "rgb(var(--text-muted))" }}><ArrowLeft className="w-5 h-5" /></button>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(245,158,11,0.15)" }}><MessageSquare className="w-4 h-4" style={{ color: "#f59e0b" }} /></div>
          <div>
            <p className="font-bold text-sm" style={{ color: "rgb(var(--text-primary))" }}>Interview Prep</p>
            <p className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>8 tailored questions with answer guides</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
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
          <label className="label">Job title you&apos;re interviewing for <span style={{ color: "#f59e0b" }}>*</span></label>
          <input className="input-field" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Senior Software Engineer" />
        </div>

        <div>
          <label className="label">Job description <span style={{ color: "rgb(var(--text-muted))" }}>(optional — improves accuracy)</span></label>
          <textarea className="input-field" rows={4} value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste the job description for role-specific questions…" />
        </div>

        {!isPro && hasFreeTrial(userId, TOOL) && (
          <div className="rounded-2xl p-3 flex items-center gap-3" style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(239,68,68,0.1))", border: "1px solid rgba(245,158,11,0.25)" }}>
            <Crown className="w-4 h-4 flex-shrink-0" style={{ color: "#f59e0b" }} />
            <p className="text-xs font-medium" style={{ color: "rgb(var(--text-secondary))" }}>
              <span className="font-bold" style={{ color: "#f59e0b" }}>1 free generation</span> — try it out! Upgrade to Pro for unlimited.
            </p>
          </div>
        )}

        {locked ? (
          <Link href="/upgrade">
            <button className="w-full py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2" style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)" }}>
              <Lock className="w-5 h-5" /> Unlock with Pro — $15
            </button>
          </Link>
        ) : (
          <button onClick={generate} disabled={loading || !jobTitle} className="w-full py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)", boxShadow: loading ? "none" : "0 4px 20px rgba(245,158,11,0.35)" }}>
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating questions…</> : <><Sparkles className="w-5 h-5" /> Generate Interview Questions</>}
          </button>
        )}

        {questions.length > 0 && (
          <div className="space-y-2.5 animate-scale-in">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgb(var(--text-muted))" }}>
              {questions.length} questions — tap to expand
            </p>
            {questions.map((q, i) => <QuestionCard key={i} q={q} index={i} />)}
          </div>
        )}
      </div>
      </div>

      <BottomNav />
    </div>
  );
}
