"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Linkedin, Sparkles, Loader2, Copy, Check,
  ChevronDown, Lock, Crown, BookMarked,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { BottomNav } from "@/components/layout/BottomNav";
import type { ResumeData } from "@/types";
import { isToolLocked, incrementToolUse, hasFreeTrial } from "@/lib/tool-usage";
import { saveOutput, loadOutputs, type SavedOutput } from "@/lib/saved-outputs";
import toast from "react-hot-toast";
import Link from "next/link";

type Tone = "professional" | "conversational" | "bold";
const TOOL = "linkedin-bio";

export default function LinkedInBioPage() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResume, setSelectedResume] = useState("");
  const [tone, setTone] = useState<Tone>("professional");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [userId, setUserId] = useState("");
  const [pageReady, setPageReady] = useState(false);
  const [savedOutputs, setSavedOutputs] = useState<SavedOutput[]>([]);

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
      if (!pro && !hasFreeTrial(user.id, TOOL)) router.push("/upgrade");
    };
    load();
  }, [router]);

  const generate = async () => {
    if (!selectedResume) { toast.error("Select a resume first"); return; }
    if (!isPro && isToolLocked(isPro, userId, TOOL)) { router.push("/upgrade"); return; }
    setLoading(true); setResult("");
    try {
      const resume = resumes.find((r) => r.id === selectedResume);
      const resumeData: ResumeData = resume?.rewritten_data ?? resume?.resume_data;
      const res = await fetch("/api/tools/linkedin-bio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData, tone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.bio);
      if (!isPro) incrementToolUse(userId, TOOL);
      const resumeTitle = resumes.find((r) => r.id === selectedResume)?.title ?? "Resume";
      saveOutput(userId, { tool: TOOL, label: `LinkedIn Bio — ${resumeTitle}`, content: data.bio });
      setSavedOutputs(loadOutputs(userId, TOOL));
    } catch { toast.error("Generation failed. Please try again."); }
    finally { setLoading(false); }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!pageReady) return (
    <div className="screen items-center justify-center" style={{ backgroundColor: "rgb(var(--bg))" }}>
      <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#a855f7" }} />
    </div>
  );

  if (resumes.length === 0) return (
    <div className="fixed inset-0 flex flex-col" style={{ backgroundColor: "rgb(var(--bg))" }}>
      <div className="border-b" style={{ backgroundColor: "rgb(var(--surface))", borderColor: "rgb(var(--border))", paddingTop: "max(1rem, env(safe-area-inset-top))" }}>
        <div className="max-w-2xl mx-auto px-5 pb-4 flex items-center gap-3">
          <button onClick={() => router.push("/tools")} className="p-1.5 rounded-xl" style={{ color: "rgb(var(--text-muted))" }}><ArrowLeft className="w-5 h-5" /></button>
          <p className="font-bold text-sm" style={{ color: "rgb(var(--text-primary))" }}>LinkedIn Bio Writer</p>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-5 py-10 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(13,148,136,0.1)" }}>
          <Linkedin className="w-8 h-8" style={{ color: "#0d9488" }} />
        </div>
        <p className="font-bold text-lg mb-2" style={{ color: "rgb(var(--text-primary))" }}>You need a resume first</p>
        <p className="text-sm mb-6" style={{ color: "rgb(var(--text-muted))" }}>Build a resume with Alex and I&apos;ll write your LinkedIn bio from it.</p>
        <Link href="/assessment"><button className="btn-primary mx-auto">Chat with Alex</button></Link>
      </div>
      <BottomNav />
    </div>
  );

  const locked = isToolLocked(isPro, userId, TOOL);
  const wordCount = result ? result.split(/\s+/).length : 0;

  return (
    <div className="fixed inset-0 flex flex-col animate-page-in" style={{ backgroundColor: "rgb(var(--bg))" }}>
      <div className="border-b" style={{ backgroundColor: "rgb(var(--surface))", borderColor: "rgb(var(--border))", paddingTop: "max(1rem, env(safe-area-inset-top))" }}>
        <div className="max-w-2xl mx-auto px-5 pb-4 flex items-center gap-3">
          <button onClick={() => router.push("/tools")} className="p-1.5 rounded-xl" style={{ color: "rgb(var(--text-muted))" }}><ArrowLeft className="w-5 h-5" /></button>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(13,148,136,0.15)" }}><Linkedin className="w-4 h-4" style={{ color: "#0d9488" }} /></div>
          <div className="flex-1">
            <p className="font-bold text-sm" style={{ color: "rgb(var(--text-primary))" }}>LinkedIn Bio Writer</p>
            <p className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>Generate your About section</p>
          </div>
          {savedOutputs.length > 0 && (
            <Link href="/saved-outputs" className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl" style={{ backgroundColor: "rgba(13,148,136,0.1)", color: "#0d9488" }}>
              <BookMarked className="w-3.5 h-3.5" /> {savedOutputs.length}
            </Link>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
      <div className="max-w-2xl mx-auto px-5 py-5 pb-28 space-y-4">
        {!isPro && hasFreeTrial(userId, TOOL) && (
          <div className="rounded-2xl p-3 flex items-center gap-3" style={{ background: "linear-gradient(135deg, rgba(13,148,136,0.1), rgba(2,132,199,0.1))", border: "1px solid rgba(13,148,136,0.25)" }}>
            <Crown className="w-4 h-4 flex-shrink-0" style={{ color: "#0d9488" }} />
            <p className="text-xs font-medium" style={{ color: "rgb(var(--text-secondary))" }}>
              <span className="font-bold" style={{ color: "#0d9488" }}>1 free generation</span> — try it out! Upgrade to Pro for unlimited.
            </p>
          </div>
        )}

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
          <label className="label">Tone & style</label>
          <div className="space-y-2">
            {([
              { id: "professional" as Tone, label: "Professional", desc: "Polished, formal, traditional industries" },
              { id: "conversational" as Tone, label: "Conversational", desc: "Warm, approachable, relatable" },
              { id: "bold" as Tone, label: "Bold", desc: "Confident, punchy, stands out" },
            ]).map((t) => (
              <button key={t.id} onClick={() => setTone(t.id)}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                style={{ backgroundColor: tone === t.id ? "rgba(13,148,136,0.1)" : "rgb(var(--surface-2))", border: `1px solid ${tone === t.id ? "rgba(13,148,136,0.4)" : "rgb(var(--border))"}` }}>
                <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0" style={{ borderColor: tone === t.id ? "#0d9488" : "rgb(var(--border))" }}>
                  {tone === t.id && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#0d9488" }} />}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "rgb(var(--text-primary))" }}>{t.label}</p>
                  <p className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>{t.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl p-3" style={{ backgroundColor: "rgba(13,148,136,0.08)", border: "1px solid rgba(13,148,136,0.2)" }}>
          <p className="text-xs" style={{ color: "#0d9488" }}>💡 LinkedIn About sections perform best at 200–280 words. Alex will target this range.</p>
        </div>

        {locked ? (
          <Link href="/upgrade">
            <button className="w-full py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2" style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)" }}>
              <Lock className="w-5 h-5" /> Unlock with Pro — $14.99
            </button>
          </Link>
        ) : (
          <button onClick={generate} disabled={loading} className="w-full py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #0d9488, #0284c7)", boxShadow: loading ? "none" : "0 4px 20px rgba(13,148,136,0.35)" }}>
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Writing your bio…</> : <><Sparkles className="w-5 h-5" /> Generate LinkedIn Bio</>}
          </button>
        )}

        {result && (
          <div className="animate-scale-in">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#0d9488" }}>Your LinkedIn About ({wordCount} words)</p>
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>Auto-saved</span>
                <button onClick={copy} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl" style={{ backgroundColor: "rgba(13,148,136,0.1)", color: "#0d9488" }}>
                  {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
              </div>
            </div>
            <div className="card p-5">
              <p className="text-sm leading-7 whitespace-pre-wrap" style={{ color: "rgb(var(--text-primary))" }}>{result}</p>
            </div>
            {!isPro && (
              <div className="mt-3 rounded-2xl p-4" style={{ background: "linear-gradient(135deg, rgba(13,148,136,0.12), rgba(2,132,199,0.12))", border: "1px solid rgba(13,148,136,0.25)" }}>
                <p className="text-sm font-bold mb-1" style={{ color: "rgb(var(--text-primary))" }}>Want unlimited LinkedIn bios?</p>
                <p className="text-xs mb-3" style={{ color: "rgb(var(--text-muted))" }}>Pro gives you unlimited + all AI tools. One-time $15 forever.</p>
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
