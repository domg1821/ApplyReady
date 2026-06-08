import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  FileText, Briefcase, Linkedin, MessageSquare,
  LayoutList, ArrowRight, Lock, Sparkles, Crown, LayoutDashboard,
} from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";

const TOOLS = [
  {
    href: "/tools/cover-letter",
    icon: FileText,
    title: "Cover Letter",
    description: "AI writes a tailored cover letter from your resume + job details",
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.1)",
    pro: true,
    badge: "Most popular",
  },
  {
    href: "/tools/job-match",
    icon: Briefcase,
    title: "Job Match Analyzer",
    description: "Paste a job description and see your match score + what to improve",
    color: "#0284c7",
    bg: "rgba(2,132,199,0.1)",
    pro: true,
    badge: null,
  },
  {
    href: "/tools/linkedin-bio",
    icon: Linkedin,
    title: "LinkedIn Bio Writer",
    description: "Generate a compelling LinkedIn About section from your resume",
    color: "#0d9488",
    bg: "rgba(13,148,136,0.1)",
    pro: true,
    badge: null,
  },
  {
    href: "/tools/interview-prep",
    icon: MessageSquare,
    title: "Interview Prep",
    description: "Get 8 tailored interview questions with answer frameworks",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    pro: true,
    badge: "New",
  },
  {
    href: "/tracker",
    icon: LayoutList,
    title: "Application Tracker",
    description: "Track every job you apply to — from applied to offer",
    color: "#10b981",
    bg: "rgba(16,185,129,0.1)",
    pro: false,
    badge: null,
  },
];

export default async function ToolsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .single();

  const isPro = profile?.subscription_tier === "pro";

  return (
    <div className="fixed inset-0 flex flex-col animate-page-in" style={{ backgroundColor: "rgb(var(--bg))" }}>
      {/* Header */}
      <div
        className="border-b flex-shrink-0"
        style={{
          backgroundColor: "rgb(var(--surface))",
          borderColor: "rgb(var(--border))",
          paddingTop: "max(1.25rem, env(safe-area-inset-top))",
        }}
      >
        <div className="max-w-2xl mx-auto px-5 pb-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}
              >
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold" style={{ color: "rgb(var(--text-primary))" }}>
                AI Tools
              </h1>
            </div>
            {/* Desktop home link — BottomNav is hidden on lg */}
            <Link
              href="/dashboard"
              className="hidden lg:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors"
              style={{ color: "rgb(var(--text-muted))" }}
            >
              <LayoutDashboard className="w-4 h-4" /> Home
            </Link>
          </div>
          <p className="text-sm" style={{ color: "rgb(var(--text-muted))" }}>
            Everything you need to land the job — powered by Alex
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
      <div className="max-w-2xl mx-auto px-5 py-5 pb-28">
        {/* Pro banner for free users */}
        {!isPro && (
          <Link href="/upgrade">
            <div
              className="rounded-2xl p-4 mb-5 flex items-center justify-between gap-3"
              style={{ background: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)" }}
            >
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-white flex-shrink-0" />
                <div>
                  <p className="font-bold text-white text-sm">Unlock all AI tools — $15 lifetime</p>
                  <p className="text-white/70 text-xs">Cover letter, job match, interview prep + more</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-white flex-shrink-0" />
            </div>
          </Link>
        )}

        {/* Tool cards */}
        <div className="space-y-2.5">
          {TOOLS.map((tool) => {
            const locked = tool.pro && !isPro;
            const Icon = tool.icon;

            return (
              <Link
                key={tool.href}
                href={locked ? "/upgrade" : tool.href}
                className="block"
              >
                <div className="card p-4 group cursor-pointer transition-all duration-150 hover:translate-x-0.5">
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: tool.bg }}
                    >
                      <Icon className="w-6 h-6" style={{ color: tool.color }} />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-sm" style={{ color: "rgb(var(--text-primary))" }}>
                          {tool.title}
                        </p>
                        {tool.badge && (
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide"
                            style={{ backgroundColor: tool.bg, color: tool.color }}
                          >
                            {tool.badge}
                          </span>
                        )}
                        {locked && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 uppercase tracking-wide">
                            Pro
                          </span>
                        )}
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: "rgb(var(--text-muted))" }}>
                        {tool.description}
                      </p>
                    </div>

                    {/* Arrow / Lock */}
                    <div className="flex-shrink-0">
                      {locked ? (
                        <Lock className="w-4 h-4" style={{ color: "rgb(var(--text-muted))" }} />
                      ) : (
                        <ArrowRight
                          className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                          style={{ color: "rgb(var(--text-muted))" }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Saved Outputs link */}
        <Link href="/saved-outputs">
          <div className="card p-4 flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(147,97,253,0.1)" }}>
              <Sparkles className="w-5 h-5" style={{ color: "#a855f7" }} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm" style={{ color: "rgb(var(--text-primary))" }}>Saved Outputs</p>
              <p className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>View your past cover letters, bios & prep</p>
            </div>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" style={{ color: "rgb(var(--text-muted))" }} />
          </div>
        </Link>

        {/* Assessment reminder */}
        <div
          className="mt-2 rounded-2xl p-4 border"
          style={{
            backgroundColor: "rgba(147,97,253,0.06)",
            borderColor: "rgba(147,97,253,0.15)",
          }}
        >
          <p className="text-xs font-bold mb-1" style={{ color: "#a855f7" }}>💡 Tip</p>
          <p className="text-xs leading-relaxed" style={{ color: "rgb(var(--text-secondary))" }}>
            All AI tools work best when you have a complete resume. Tap the{" "}
            <span className="font-bold" style={{ color: "#a855f7" }}>+ button</span> below to chat with Alex and build yours.
          </p>
        </div>
      </div>
      </div>

      <BottomNav />
    </div>
  );
}
