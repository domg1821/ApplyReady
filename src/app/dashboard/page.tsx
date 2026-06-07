import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Plus, FileText, ArrowRight, Crown, Wand2, Briefcase, FileCheck, BookMarked, LayoutList } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { DashboardWelcome } from "@/components/dashboard/DashboardWelcome";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string; upgraded?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const isWelcome = params.welcome === "1";
  const isUpgraded = params.upgraded === "1";

  const [{ data: profile }, { data: resumes }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("resumes")
      .select("*, analyses(resume_score, ats_score)")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(3),
  ]);

  const isPro = profile?.subscription_tier === "pro";
  const firstName = profile?.full_name?.split(" ")[0] ?? "there";
  const bestAts = resumes?.length
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? Math.max(...resumes.map((r: any) => r.analyses?.[0]?.ats_score ?? 0)) || null
    : null;

  return (
    <div className="animate-page-in flex flex-col gap-5">
      <DashboardWelcome showTour={isWelcome} showUpgraded={isUpgraded} />

      {/* Greeting */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "rgb(var(--text-primary))" }}>
            Hey, {firstName} 👋
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "rgb(var(--text-muted))" }}>
            {isPro ? "Lifetime Pro · All features unlocked" : "Welcome back to ApplyReady"}
          </p>
        </div>
        <Link href="/assessment">
          <button className="btn-primary text-sm">
            <Plus className="w-4 h-4" /> New
          </button>
        </Link>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3 flex-shrink-0">
        {[
          { label: "Resumes", value: resumes?.length ?? 0, color: "#a855f7" },
          { label: "Best ATS", value: bestAts ?? "—", color: "#10b981" },
          { label: "Plan", value: isPro ? "Pro ✦" : "Free", color: isPro ? "#f59e0b" : "rgb(var(--text-muted))" },
        ].map((stat) => (
          <div key={stat.label} className="card p-3 text-center">
            <p className="text-xl font-black" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs mt-0.5" style={{ color: "rgb(var(--text-muted))" }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 flex-shrink-0">
        <Link href="/assessment">
          <div className="card p-4 cursor-pointer group h-full transition-all">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform"
              style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)", boxShadow: "0 4px 12px rgba(147,97,253,0.35)" }}>
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-bold" style={{ color: "rgb(var(--text-primary))" }}>Chat with Alex</p>
            <p className="text-xs mt-0.5" style={{ color: "rgb(var(--text-muted))" }}>Build a new resume</p>
          </div>
        </Link>
        <Link href="/tools">
          <div className="card p-4 cursor-pointer group h-full transition-all">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform"
              style={{ background: "linear-gradient(135deg, #0284c7, #0d9488)", boxShadow: "0 4px 12px rgba(2,132,199,0.3)" }}>
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-bold" style={{ color: "rgb(var(--text-primary))" }}>AI Tools</p>
            <p className="text-xs mt-0.5" style={{ color: "rgb(var(--text-muted))" }}>Cover letter & more</p>
          </div>
        </Link>
      </div>

      {/* Upgrade banner */}
      {!isPro && (
        <Link href="/upgrade" className="flex-shrink-0">
          <div
            className="rounded-2xl p-4 flex items-center justify-between gap-3"
            style={{
              background: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
              boxShadow: "0 4px 20px rgba(245,158,11,0.3)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.2)" }}>
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">Lifetime Access — $15</p>
                <p className="text-white/70 text-xs">Cover letter · Interview prep · All 15 templates · Forever</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-white flex-shrink-0" />
          </div>
        </Link>
      )}

      {/* Quick links row */}
      <div className="grid grid-cols-2 gap-3 flex-shrink-0">
        <Link href="/tracker">
          <div className="card p-3 cursor-pointer group flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(16,185,129,0.1)" }}>
              <LayoutList className="w-4 h-4" style={{ color: "#10b981" }} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold" style={{ color: "rgb(var(--text-primary))" }}>Job Tracker</p>
              <p className="text-[10px]" style={{ color: "rgb(var(--text-muted))" }}>Track applications</p>
            </div>
          </div>
        </Link>
        <Link href="/saved-outputs">
          <div className="card p-3 cursor-pointer group flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(147,97,253,0.1)" }}>
              <BookMarked className="w-4 h-4" style={{ color: "#a855f7" }} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold" style={{ color: "rgb(var(--text-primary))" }}>Saved Outputs</p>
              <p className="text-[10px]" style={{ color: "rgb(var(--text-muted))" }}>Cover letters & more</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent resumes */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgb(var(--text-muted))" }}>Recent Resumes</p>
          <Link href="/resumes" className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#a855f7" }}>
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {!resumes?.length ? (
          <div className="card p-6 text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "rgba(147,97,253,0.1)" }}>
              <FileText className="w-6 h-6" style={{ color: "#a855f7" }} />
            </div>
            <p className="font-bold text-sm mb-1" style={{ color: "rgb(var(--text-primary))" }}>No resumes yet</p>
            <p className="text-xs mb-4" style={{ color: "rgb(var(--text-muted))" }}>Chat with Alex to build your first resume</p>
            <Link href="/assessment">
              <button className="btn-primary text-sm mx-auto">Start with Alex</button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {resumes.map((resume: any) => {
              const analysis = resume.analyses?.[0];
              const statusColors = {
                draft:    "default" as const,
                analyzed: "warning" as const,
                rewritten:"success" as const,
              };
              return (
                <Link key={resume.id} href={`/resume/${resume.id}`}>
                  <div className="card p-4 cursor-pointer group flex items-center gap-3 hover:translate-x-0.5 transition-all duration-150">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(147,97,253,0.1)" }}>
                      <FileCheck className="w-4 h-4" style={{ color: "#a855f7" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ color: "rgb(var(--text-primary))" }}>{resume.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                          {new Date(resume.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                        {analysis && (
                          <span className="text-xs font-medium" style={{ color: "#10b981" }}>· ATS {analysis.ats_score}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={statusColors[resume.status as keyof typeof statusColors]}>
                        {resume.status}
                      </Badge>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" style={{ color: "rgb(var(--text-muted))" }} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
