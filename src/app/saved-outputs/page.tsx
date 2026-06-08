"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, FileText, Linkedin, MessageSquare,
  Briefcase, Copy, Trash2, Check, LayoutDashboard,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { loadOutputs, deleteOutput, type SavedOutput } from "@/lib/saved-outputs";
import { BottomNav } from "@/components/layout/BottomNav";
import toast from "react-hot-toast";
import Link from "next/link";

const TOOL_META: Record<SavedOutput["tool"], { label: string; icon: React.ElementType; color: string; bg: string }> = {
  "cover-letter":   { label: "Cover Letter",   icon: FileText,      color: "#a855f7", bg: "rgba(168,85,247,0.1)"  },
  "linkedin-bio":   { label: "LinkedIn Bio",   icon: Linkedin,      color: "#0d9488", bg: "rgba(13,148,136,0.1)"  },
  "interview-prep": { label: "Interview Prep", icon: MessageSquare, color: "#f59e0b", bg: "rgba(245,158,11,0.1)"  },
  "job-match":      { label: "Job Match",      icon: Briefcase,     color: "#0284c7", bg: "rgba(2,132,199,0.1)"   },
};

function timeSince(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function SavedOutputsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [outputs, setOutputs] = useState<SavedOutput[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [filter, setFilter] = useState<SavedOutput["tool"] | "all">("all");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);
      setOutputs(loadOutputs(user.id));
    };
    load();
  }, [router]);

  const handleDelete = (id: string) => {
    if (!userId) return;
    deleteOutput(userId, id);
    setOutputs(loadOutputs(userId));
    toast.success("Deleted");
  };

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopied(id);
    toast.success("Copied!");
    setTimeout(() => setCopied(null), 2000);
  };

  const filtered = filter === "all" ? outputs : outputs.filter((o) => o.tool === filter);

  return (
    <div className="fixed inset-0 flex flex-col animate-page-in" style={{ backgroundColor: "rgb(var(--bg))" }}>
      {/* Header */}
      <div
        className="border-b"
        style={{ backgroundColor: "rgb(var(--surface))", borderColor: "rgb(var(--border))", paddingTop: "max(1rem, env(safe-area-inset-top))" }}
      >
        <div className="max-w-2xl mx-auto px-5 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="p-1.5 rounded-xl" style={{ color: "rgb(var(--text-muted))" }}>
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <p className="font-bold text-base" style={{ color: "rgb(var(--text-primary))" }}>Saved Outputs</p>
                <p className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>{outputs.length} saved · auto-saved from AI tools</p>
              </div>
            </div>
            <Link href="/dashboard" className="hidden lg:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl" style={{ color: "rgb(var(--text-muted))" }}>
              <LayoutDashboard className="w-4 h-4" /> Home
            </Link>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
            {(["all", "cover-letter", "linkedin-bio", "interview-prep", "job-match"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  backgroundColor: filter === f ? "rgba(147,97,253,0.15)" : "rgb(var(--surface-2))",
                  color: filter === f ? "#a855f7" : "rgb(var(--text-muted))",
                  border: `1px solid ${filter === f ? "rgba(147,97,253,0.3)" : "rgb(var(--border))"}`,
                }}
              >
                {f === "all" ? "All" : TOOL_META[f].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
      <div className="max-w-2xl mx-auto px-5 py-5 pb-28">
        {filtered.length === 0 ? (
          <div className="card p-10 text-center mt-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "rgba(147,97,253,0.1)" }}>
              <FileText className="w-7 h-7" style={{ color: "#a855f7" }} />
            </div>
            <p className="font-bold mb-1" style={{ color: "rgb(var(--text-primary))" }}>No saved outputs yet</p>
            <p className="text-sm mb-4" style={{ color: "rgb(var(--text-muted))" }}>
              When you generate a cover letter, LinkedIn bio, or interview prep, it auto-saves here.
            </p>
            <Link href="/tools">
              <button className="btn-primary text-sm mx-auto">Go to AI Tools</button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((output) => {
              const meta = TOOL_META[output.tool];
              const Icon = meta.icon;
              const isOpen = expanded === output.id;

              return (
                <div key={output.id} className="card overflow-hidden">
                  {/* Header */}
                  <button
                    onClick={() => setExpanded(isOpen ? null : output.id)}
                    className="w-full text-left p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: meta.bg }}>
                        <Icon className="w-4 h-4" style={{ color: meta.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate" style={{ color: "rgb(var(--text-primary))" }}>{output.label}</p>
                        <p className="text-xs mt-0.5" style={{ color: "rgb(var(--text-muted))" }}>
                          {meta.label} · {timeSince(output.savedAt)}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full flex-shrink-0" style={{ backgroundColor: meta.bg, color: meta.color }}>
                        {isOpen ? "Hide" : "View"}
                      </span>
                    </div>
                  </button>

                  {/* Expanded content */}
                  {isOpen && (
                    <div className="border-t px-4 pb-4 pt-3 space-y-3" style={{ borderColor: "rgb(var(--border))" }}>
                      <div className="rounded-xl p-4" style={{ backgroundColor: "rgb(var(--surface-2))" }}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "rgb(var(--text-primary))" }}>
                          {output.content}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCopy(output.content, output.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
                          style={{ backgroundColor: meta.bg, color: meta.color }}
                        >
                          {copied === output.id ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                        </button>
                        <button
                          onClick={() => handleDelete(output.id)}
                          className="px-4 py-2.5 rounded-xl text-xs font-semibold transition-all"
                          style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#ef4444" }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      </div>

      <BottomNav />
    </div>
  );
}
