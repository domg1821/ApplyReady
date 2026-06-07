"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Trash2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Props {
  resume: {
    id: string;
    title: string;
    status: "draft" | "analyzed" | "rewritten";
    updated_at: string;
    template?: string;
  };
  accent: string;
}

const STATUS_COLORS = {
  draft:     "default" as const,
  analyzed:  "warning" as const,
  rewritten: "success" as const,
};

export function ResumeListCard({ resume, accent }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!showConfirm) { setShowConfirm(true); return; }
    setDeleting(true);
    try {
      const res = await fetch(`/api/resume/${resume.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Resume deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete — please try again");
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="card p-4 group flex items-center gap-4 relative overflow-hidden"
      style={{ transition: "transform 0.15s" }}
      onMouseLeave={() => setShowConfirm(false)}>

      {/* Mini template thumbnail */}
      <div className="w-12 h-14 rounded-xl overflow-hidden flex-shrink-0 border" style={{ borderColor: "rgb(var(--border))" }}>
        <div className="h-3 w-full" style={{ backgroundColor: accent }} />
        <div className="p-1 space-y-0.5" style={{ backgroundColor: "white" }}>
          <div className="h-1 rounded-sm w-3/4" style={{ backgroundColor: accent, opacity: 0.6 }} />
          <div className="h-0.5 rounded-sm w-full bg-gray-200" />
          <div className="h-0.5 rounded-sm w-5/6 bg-gray-100" />
          <div className="h-0.5 rounded-sm w-full bg-gray-100" />
          <div className="h-0.5 rounded-sm w-4/5 bg-gray-100" />
          <div className="h-0.5 rounded-sm w-3/4 bg-gray-100" />
        </div>
      </div>

      {/* Info — link to detail */}
      <Link href={`/resume/${resume.id}`} className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate" style={{ color: "rgb(var(--text-primary))" }}>{resume.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
            {new Date(resume.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <p className="text-[10px] mt-0.5 capitalize" style={{ color: "rgb(var(--text-muted))" }}>
          {resume.template ?? "modern"} template
        </p>
      </Link>

      {/* Right side */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Badge variant={STATUS_COLORS[resume.status]}>{resume.status === "analyzed" ? "draft" : resume.status}</Badge>

        {/* Delete button */}
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-1.5 rounded-xl transition-all"
          style={{
            backgroundColor: showConfirm ? "rgba(239,68,68,0.15)" : "transparent",
            color: showConfirm ? "#ef4444" : "rgb(var(--text-muted))",
          }}
          title={showConfirm ? "Tap again to confirm delete" : "Delete resume"}
        >
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>

        <Link href={`/resume/${resume.id}`}>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" style={{ color: "rgb(var(--text-muted))" }} />
        </Link>
      </div>

      {/* Confirm overlay */}
      {showConfirm && (
        <div
          className="absolute inset-0 flex items-center justify-center gap-3 backdrop-blur-sm"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={(e) => e.preventDefault()}
        >
          <p className="text-white text-sm font-semibold">Delete &quot;{resume.title}&quot;?</p>
          <button onClick={handleDelete} className="px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-xl">
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
          </button>
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowConfirm(false); }}
            className="px-4 py-2 rounded-xl text-sm font-bold" style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white" }}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
