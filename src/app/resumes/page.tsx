import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Plus, ClipboardList, LayoutDashboard } from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";
import { ResumeListCard } from "@/components/resume/ResumeListCard";

// Template accent colors for mini thumbnails
const TEMPLATE_ACCENTS: Record<string, string> = {
  modern:       "#7c3aed",
  executive:    "#111827",
  minimal:      "#6b7280",
  student:      "#0284c7",
  tech:         "#0f172a",
  creative:     "#0d9488",
  corporate:    "#1e3a5f",
  bold:         "#111827",
  elegant:      "#b45309",
  "sidebar-dark":"#1a1a2e",
  classic:      "#374151",
  navy:         "#0f2444",
  compact:      "#059669",
  "two-column": "#dc2626",
  gradient:     "#6366f1",
};

export default async function ResumesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: resumes } = await supabase
    .from("resumes")
    .select("*, analyses(resume_score, ats_score)")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return (
    <div className="min-h-screen flex flex-col animate-page-in" style={{ backgroundColor: "rgb(var(--bg))" }}>
      {/* Header */}
      <div
        className="border-b flex-shrink-0"
        style={{
          backgroundColor: "rgb(var(--surface))",
          borderColor: "rgb(var(--border))",
          paddingTop: "max(1.25rem, env(safe-area-inset-top))",
        }}
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between px-5 pb-4">
          <div className="flex items-center gap-3">
            {/* Home link — visible on desktop where BottomNav is hidden */}
            <Link
              href="/dashboard"
              className="lg:flex hidden items-center justify-center w-8 h-8 rounded-xl transition-colors"
              style={{ color: "rgb(var(--text-muted))" }}
              title="Home"
            >
              <LayoutDashboard className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold" style={{ color: "rgb(var(--text-primary))" }}>My Resumes</h1>
              <p className="text-xs mt-0.5" style={{ color: "rgb(var(--text-muted))" }}>
                {resumes?.length ?? 0} saved
              </p>
            </div>
          </div>
          <Link href="/assessment">
            <button className="btn-primary text-sm">
              <Plus className="w-4 h-4" /> New Resume
            </button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-5 pb-28 max-w-2xl mx-auto w-full">
        {!resumes?.length ? (
          <div className="card p-10 text-center mt-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(147,97,253,0.1)" }}
            >
              <ClipboardList className="w-8 h-8" style={{ color: "#a855f7" }} />
            </div>
            <p className="font-bold mb-1" style={{ color: "rgb(var(--text-primary))" }}>No resumes yet</p>
            <p className="text-sm mb-5" style={{ color: "rgb(var(--text-muted))" }}>
              Chat with Alex to build your first professional resume
            </p>
            <Link href="/assessment">
              <button className="btn-primary text-sm mx-auto">
                <ClipboardList className="w-4 h-4" /> Start with Alex
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {resumes.map((resume: any) => (
              <ResumeListCard
                key={resume.id}
                resume={resume}
                accent={TEMPLATE_ACCENTS[resume.template ?? "modern"] ?? "#7c3aed"}
              />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
