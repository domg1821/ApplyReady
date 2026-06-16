"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, FileText, Sparkles, Loader2, Copy, Check, ChevronDown,
  Lock, Crown, BookMarked,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { BottomNav } from "@/components/layout/BottomNav";
import type { ResumeData } from "@/types";
import { isToolLocked, incrementToolUse, hasFreeTrial } from "@/lib/tool-usage";
import { saveOutput, loadOutputs, type SavedOutput } from "@/lib/saved-outputs";
import toast from "react-hot-toast";
import Link from "next/link";

type Tone = "professional" | "enthusiastic" | "concise";
const TOOL = "cover-letter";

export default function CoverLetterPage() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResume, setSelectedResume] = useState<string>("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState<Tone>("professional");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [userId, setUserId] = useState("");
  const [pageReady, setPageReady] = useState(false);
  const [savedOutputs, setSavedOutputs] = useState<SavedOutput[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);

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
      setSavedOutputs(loadOutputs(user.id, TOOL));
      setPageReady(true);

      // Hard redirect only if not pro AND no free trial left
      if (!pro && !hasFreeTrial(user.id, TOOL)) {
        router.push("/upgrade");
      }
    };
    load();
  }, [router]);

  const generate = async () => {
    if (!selectedResume || !jobTitle || !company) {
      toast.error("Please fill in the required fields");
      return;
    }

    if (!isPro && isToolLocked(isPro, userId, TOOL)) {
      router.push("/upgrade");
      return;
    }

    setLoading(true);
    setResult("");
    try {
      const resume = resumes.find((r) => r.id === selectedResume);
      const resumeData: ResumeData = resume?.rewritten_data ?? resume?.resume_data;

      const res = await fetch("/api/tools/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData, jobTitle, company, jobDescription, tone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.coverLetter);

      // Track free use + save output
      if (!isPro) incrementToolUse(userId, TOOL);
      const label = `Cover Letter for ${company} — ${jobTitle}`;
      saveOutput(userId, { tool: TOOL, label, content: data.coverLetter });
      setSavedOutputs(loadOutputs(userId, TOOL));

      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {
      toast.error("Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!pageReady) {
    return (
      <div className="screen items-center justify-center" style={{ backgroundColor: "rgb(var(--bg))" }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#a855f7" }} />
      </div>
    );
  }

  // No resumes — prompt to create one
  if (resumes.length === 0) {
    return (
      <div className="fixed inset-0 flex flex-col" style={{ backgroundColor: "rgb(var(--bg))" }}>
        <div className="border-b" style={{ backgroundColor: "rgb(var(--surface))", borderColor: "rgb(var(--border))", paddingTop: "max(1rem, env(safe-area-inset-top))" }}>
          <div className="max-w-2xl mx-auto px-5 pb-4 flex items-center gap-3">
            <button onClick={() => router.push("/tools")} className="p-1.5 rounded-xl" style={{ color: "rgb(var(--text-muted))" }}>
              <ArrowLeft className="w-5 h-5" />
            </button>
            <p className="font-bold text-sm" style={{ color: "rgb(var(--text-primary))" }}>Cover Letter</p>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-5 py-10 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(168,85,247,0.1)" }}>
            <FileText className="w-8 h-8" style={{ color: "#a855f7" }} />
          </div>
          <p className="font-bold text-lg mb-2" style={{ color: "rgb(var(--text-primary))" }}>You need a resume first</p>
          <p className="text-sm mb-6" style={{ color: "rgb(var(--text-muted))" }}>Build a resume with Alex and Alex will write your cover letter based on it.</p>
          <Link href="/assessment"><button className="btn-primary mx-auto">Chat with Alex</button></Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  const locked = isToolLocked(isPro, userId, TOOL);
  const isFreeTrialAvailable = !isPro && hasFreeTrial(userId, TOOL);

  return (
    <div className="fixed inset-0 flex flex-col animate-page-in" style={{ backgroundColor: "rgb(var(--bg))" }}>
      {/* Header */}
      <div className="border-b flex-shrink-0" style={{ backgroundColor: "rgb(var(--surface))", borderColor: "rgb(var(--border))", paddingTop: "max(1rem, env(safe-area-inset-top))" }}>
        <div className="max-w-2xl mx-auto px-5 pb-4 flex items-center gap-3">
          <button onClick={() => router.push("/tools")} className="p-1.5 rounded-xl transition-colors" style={{ color: "rgb(var(--text-muted))" }}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(124,58,237,0.15)" }}>
            <FileText className="w-4 h-4" style={{ color: "#a855f7" }} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm" style={{ color: "rgb(var(--text-primary))" }}>Cover Letter</p>
            <p className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>AI-tailored to the role</p>
          </div>
          {savedOutputs.length > 0 && (
            <Link href="/saved-outputs" className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl" style={{ backgroundColor: "rgba(168,85,247,0.1)", color: "#a855f7" }}>
              <BookMarked className="w-3.5 h-3.5" /> {savedOutputs.length} saved
            </Link>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
      <div className="max-w-2xl mx-auto px-5 py-5 pb-28 space-y-4">
        {/* Free trial banner */}
        {isFreeTrialAvailable && (
          <div className="rounded-2xl p-3 flex items-center gap-3" style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.12), rgba(99,102,241,0.12))", border: "1px solid rgba(168,85,247,0.25)" }}>
            <Crown className="w-4 h-4 flex-shrink-0" style={{ color: "#a855f7" }} />
            <p className="text-xs font-medium" style={{ color: "rgb(var(--text-secondary))" }}>
              <span className="font-bold" style={{ color: "#a855f7" }}>1 free generation</span> — try it out! Upgrade to Pro for unlimited.
            </p>
          </div>
        )}

        {/* Resume picker */}
        <div>
          <label className="label">Your resume</label>
          <div className="relative">
            <select value={selectedResume} onChange={(e) => setSelectedResume(e.target.value)} className="input-field appearance-none pr-10">
              {resumes.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "rgb(var(--text-muted))" }} />
          </div>
        </div>

        {/* Job details */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Job title <span style={{ color: "#a855f7" }}>*</span></label>
            <input className="input-field" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Product Manager" />
          </div>
          <div>
            <label className="label">Company <span style={{ color: "#a855f7" }}>*</span></label>
            <input className="input-field" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Stripe" />
          </div>
        </div>

        {/* Tone */}
        <div>
          <label className="label">Tone</label>
          <div className="flex gap-2">
            {(["professional", "enthusiastic", "concise"] as Tone[]).map((t) => (
              <button key={t} onClick={() => setTone(t)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold capitalize transition-all"
                style={{
                  backgroundColor: tone === t ? "rgba(147,97,253,0.15)" : "rgb(var(--surface-2))",
                  color: tone === t ? "#a855f7" : "rgb(var(--text-secondary))",
                  border: `1px solid ${tone === t ? "rgba(147,97,253,0.4)" : "rgb(var(--border))"}`,
                }}>{t}</button>
            ))}
          </div>
        </div>

        {/* Job description */}
        <div>
          <label className="label">Job description <span style={{ color: "rgb(var(--text-muted))" }}>(optional but recommended)</span></label>
          <textarea className="input-field" rows={4} value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste key requirements — Alex will tailor the letter to match…" />
        </div>

        {/* Generate button */}
        {locked ? (
          <Link href="/upgrade">
            <button className="w-full py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)" }}>
              <Lock className="w-5 h-5" /> Unlock with Pro — $14.99
            </button>
          </Link>
        ) : (
          <button onClick={generate} disabled={loading || !jobTitle || !company}
            className="w-full py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)", boxShadow: loading ? "none" : "0 4px 20px rgba(147,97,253,0.4)" }}>
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Writing your cover letter…</> : <><Sparkles className="w-5 h-5" /> Generate Cover Letter</>}
          </button>
        )}

        {/* Result */}
        {result && (
          <div ref={resultRef} className="animate-scale-in">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#a855f7" }}>Your Cover Letter</p>
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>Auto-saved</span>
                <button onClick={copy} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl"
                  style={{ backgroundColor: "rgba(147,97,253,0.1)", color: "#a855f7" }}>
                  {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
              </div>
            </div>
            <div className="card p-5">
              <p className="text-sm leading-7 whitespace-pre-wrap" style={{ color: "rgb(var(--text-primary))" }}>{result}</p>
            </div>
            {/* Post-free-trial upsell */}
            {!isPro && (
              <div className="mt-3 rounded-2xl p-4" style={{ background: "linear-gradient(135deg, #f59e0b22, #ef444422)", border: "1px solid rgba(245,158,11,0.3)" }}>
                <p className="text-sm font-bold mb-1" style={{ color: "rgb(var(--text-primary))" }}>Want unlimited cover letters?</p>
                <p className="text-xs mb-3" style={{ color: "rgb(var(--text-muted))" }}>Upgrade to Pro for unlimited generations + all AI tools. One-time $15.</p>
                <Link href="/upgrade"><button className="w-full py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)" }}>Get Lifetime Pro — $15</button></Link>
              </div>
            )}
          </div>
        )}
      </div>
      </div>

      <BottomNav />
    </div>
  );
}
