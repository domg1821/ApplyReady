import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Plus, FileText, ArrowRight, BarChart3, Crown } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: resumes }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("resumes")
      .select("*, analyses(resume_score, ats_score)")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(10),
  ]);

  const isPro = profile?.subscription_tier === "pro";
  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Hey, {firstName} 👋
          </h1>
          <p className="text-gray-500 mt-1">
            {resumes?.length
              ? `You have ${resumes.length} resume${resumes.length !== 1 ? "s" : ""}.`
              : "Create your first resume to get started."}
          </p>
        </div>
        <Link href="/resume/new">
          <button className="btn-primary">
            <Plus className="w-4 h-4" />
            New resume
          </button>
        </Link>
      </div>

      {/* Upgrade banner (free users) */}
      {!isPro && (
        <div className="card p-5 mb-6 bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center flex-shrink-0">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Upgrade to Pro</p>
              <p className="text-sm text-gray-500">
                Unlock full AI rewrites, PDF export, and 5 premium templates.
              </p>
            </div>
          </div>
          <Link href="/settings#billing">
            <button className="btn-primary text-sm flex-shrink-0">
              Upgrade now <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Resumes", value: resumes?.length ?? 0, icon: FileText },
          {
            label: "Best ATS Score",
            value: resumes?.length
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ? `${Math.max(...(resumes.map((r: any) => r.analyses?.[0]?.ats_score ?? 0)))}`
              : "—",
            icon: BarChart3,
          },
          {
            label: "Plan",
            value: isPro ? "Pro" : "Free",
            icon: Crown,
            highlight: isPro,
          },
          {
            label: "Analyses Used",
            value: profile?.analyses_used ?? 0,
            icon: BarChart3,
          },
        ].map((stat) => (
          <div key={stat.label} className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-500">{stat.label}</span>
            </div>
            <p className={`text-2xl font-bold ${stat.highlight ? "gradient-text" : "text-gray-900"}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Resume list */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Resumes</h2>
        {!resumes?.length ? (
          <EmptyState />
        ) : (
          <div className="grid gap-3">
            {// eslint-disable-next-line @typescript-eslint/no-explicit-any
          resumes.map((resume: any) => (
              <ResumeRow key={resume.id} resume={resume} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card p-12 text-center">
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
        <FileText className="w-7 h-7 text-indigo-400" />
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">No resumes yet</h3>
      <p className="text-sm text-gray-500 mb-6">
        Upload your resume or start from scratch to get your AI analysis.
      </p>
      <Link href="/resume/new">
        <button className="btn-primary mx-auto">
          <Plus className="w-4 h-4" /> Create your first resume
        </button>
      </Link>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ResumeRow({ resume }: { resume: any }) {
  const analysis = resume.analyses?.[0];
  const statusColors = {
    draft: "default" as const,
    analyzed: "warning" as const,
    rewritten: "success" as const,
  };

  return (
    <Link href={`/resume/${resume.id}`}>
      <div className="card p-4 hover:shadow-card-hover transition-shadow duration-200 cursor-pointer group">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-gray-900 truncate">{resume.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(resume.updated_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {analysis && (
              <div className="hidden sm:flex items-center gap-3 text-sm">
                <span className="text-gray-500">
                  Score: <strong className="text-gray-900">{analysis.resume_score}</strong>
                </span>
                <span className="text-gray-500">
                  ATS: <strong className="text-gray-900">{analysis.ats_score}</strong>
                </span>
              </div>
            )}
            <Badge variant={statusColors[resume.status as keyof typeof statusColors]}>
              {resume.status}
            </Badge>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
          </div>
        </div>
      </div>
    </Link>
  );
}
