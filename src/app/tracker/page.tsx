"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Plus, LayoutList, Building2, Calendar,
  X, Check, ChevronRight, Trash2, LayoutDashboard, Loader2,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { BottomNav } from "@/components/layout/BottomNav";
import toast from "react-hot-toast";

type Status = "applied" | "interviewing" | "offer" | "rejected";

interface Application {
  id: string;
  company: string;
  role: string;
  status: Status;
  date_applied: string;
  location?: string;
  notes?: string;
}

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; dot: string }> = {
  applied:      { label: "Applied",      color: "#6366f1", bg: "rgba(99,102,241,0.1)",  dot: "#6366f1" },
  interviewing: { label: "Interviewing", color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  dot: "#f59e0b" },
  offer:        { label: "Offer! 🎉",   color: "#10b981", bg: "rgba(16,185,129,0.1)",  dot: "#10b981" },
  rejected:     { label: "Rejected",    color: "#6b7280", bg: "rgba(107,114,128,0.1)", dot: "#6b7280" },
};

const FILTERS: { key: Status | "all"; label: string }[] = [
  { key: "all",         label: "All"          },
  { key: "applied",     label: "Applied"      },
  { key: "interviewing",label: "Interviewing" },
  { key: "offer",       label: "Offers"       },
  { key: "rejected",    label: "Rejected"     },
];

// localStorage fallback keys
const LS_KEY = "applyready_tracker";
const LS_MIGRATED_KEY = "applyready_tracker_migrated";

function lsLoad(): Application[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]"); }
  catch { return []; }
}

export default function TrackerPage() {
  const router = useRouter();
  const [apps, setApps] = useState<Application[]>([]);
  const [filter, setFilter] = useState<Status | "all">("all");
  const [showAdd, setShowAdd] = useState(false);
  const [showDetail, setShowDetail] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    company: "", role: "", location: "", notes: "",
    status: "applied" as Status,
    date_applied: new Date().toISOString().slice(0, 10),
  });

  const fetchApps = useCallback(async () => {
    const res = await fetch("/api/tracker");
    if (!res.ok) return;
    const { applications } = await res.json();
    setApps(applications ?? []);
  }, []);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);

      // Try to migrate localStorage data once
      const migrated = localStorage.getItem(LS_MIGRATED_KEY);
      if (!migrated) {
        const local = lsLoad();
        if (local.length > 0) {
          try {
            await Promise.all(local.map((a) =>
              fetch("/api/tracker", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  company: a.company,
                  role: a.role,
                  status: a.status,
                  dateApplied: a.date_applied ?? (a as unknown as Record<string, string>).dateApplied,
                  location: a.location,
                  notes: a.notes,
                }),
              })
            ));
            toast.success(`Migrated ${local.length} application${local.length > 1 ? "s" : ""} to your account`);
            localStorage.setItem(LS_MIGRATED_KEY, "1");
          } catch {
            // Migration failed — will retry next time
          }
        } else {
          localStorage.setItem(LS_MIGRATED_KEY, "1");
        }
      }

      await fetchApps();
      setLoading(false);
    };
    init();
  }, [router, fetchApps]);

  const addApp = async () => {
    if (!form.company || !form.role) { toast.error("Company and role are required"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      await fetchApps();
      setShowAdd(false);
      setForm({ company: "", role: "", location: "", notes: "", status: "applied", date_applied: new Date().toISOString().slice(0, 10) });
      toast.success("Application saved!");
    } catch {
      toast.error("Failed to save application");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id: string, status: Status) => {
    // Optimistic update
    setApps((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
    if (showDetail?.id === id) setShowDetail((d) => d ? { ...d, status } : d);
    try {
      const res = await fetch(`/api/tracker/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
    } catch {
      toast.error("Failed to update status");
      await fetchApps(); // revert on failure
    }
  };

  const deleteApp = async (id: string) => {
    setApps((prev) => prev.filter((a) => a.id !== id));
    setShowDetail(null);
    try {
      const res = await fetch(`/api/tracker/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Removed");
    } catch {
      toast.error("Failed to delete");
      await fetchApps();
    }
  };

  const filtered = filter === "all" ? apps : apps.filter((a) => a.status === filter);
  const counts = { all: apps.length, applied: 0, interviewing: 0, offer: 0, rejected: 0 };
  apps.forEach((a) => { counts[a.status] = (counts[a.status] ?? 0) + 1; });

  if (loading || !userId) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: "rgb(var(--bg))" }}>
        <Loader2 className="w-7 h-7 animate-spin" style={{ color: "#a855f7" }} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col animate-page-in" style={{ backgroundColor: "rgb(var(--bg))" }}>
      {/* Header */}
      <div className="border-b flex-shrink-0"
        style={{ backgroundColor: "rgb(var(--surface))", borderColor: "rgb(var(--border))", paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}>
        <div className="max-w-2xl mx-auto px-5 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button onClick={() => router.push("/tools")} className="p-1.5 rounded-xl active:scale-95 transition-transform" style={{ color: "rgb(var(--text-muted))" }}>
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(16,185,129,0.15)" }}>
                <LayoutList className="w-4 h-4" style={{ color: "#10b981" }} />
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: "rgb(var(--text-primary))" }}>Job Tracker</p>
                <p className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>{apps.length} applications · synced to account</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="hidden lg:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors" style={{ color: "rgb(var(--text-muted))" }}>
                <LayoutDashboard className="w-4 h-4" /> Home
              </Link>
              <button onClick={() => setShowAdd(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-white active:scale-95 transition-transform"
                style={{ background: "linear-gradient(135deg, #10b981, #0284c7)" }}>
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {(["applied","interviewing","offer","rejected"] as Status[]).map((s) => {
              const cfg = STATUS_CONFIG[s];
              return (
                <div key={s} className="rounded-xl p-2 text-center" style={{ backgroundColor: cfg.bg }}>
                  <p className="text-lg font-black" style={{ color: cfg.color }}>{counts[s]}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wide" style={{ color: cfg.color }}>{s === "interviewing" ? "Inter." : s}</p>
                </div>
              );
            })}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
            {FILTERS.map((f) => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95"
                style={{
                  backgroundColor: filter === f.key ? "rgba(147,97,253,0.15)" : "rgb(var(--surface-2))",
                  color: filter === f.key ? "#a855f7" : "rgb(var(--text-muted))",
                  border: `1px solid ${filter === f.key ? "rgba(147,97,253,0.3)" : "rgb(var(--border))"}`,
                }}>
                {f.label} {f.key !== "all" && counts[f.key as Status] > 0 && `(${counts[f.key as Status]})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto min-h-0">
      <div className="max-w-2xl mx-auto px-5 py-4 pb-28">
        {filtered.length === 0 ? (
          <div className="card p-10 text-center mt-4">
            <LayoutList className="w-10 h-10 mx-auto mb-3" style={{ color: "rgb(var(--text-muted))" }} />
            <p className="font-bold mb-1" style={{ color: "rgb(var(--text-primary))" }}>No applications yet</p>
            <p className="text-sm mb-5" style={{ color: "rgb(var(--text-muted))" }}>Track every role you apply to — synced to your account</p>
            <button onClick={() => setShowAdd(true)} className="btn-primary mx-auto text-sm">
              <Plus className="w-4 h-4" /> Add your first application
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((app) => {
              const cfg = STATUS_CONFIG[app.status];
              return (
                <button key={app.id} onClick={() => setShowDetail(app)} className="card p-4 w-full text-left cursor-pointer group transition-all hover:translate-x-0.5 active:scale-[0.99]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgb(var(--surface-2))" }}>
                      <Building2 className="w-5 h-5" style={{ color: "rgb(var(--text-muted))" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ color: "rgb(var(--text-primary))" }}>{app.company}</p>
                      <p className="text-xs truncate" style={{ color: "rgb(var(--text-muted))" }}>{app.role}{app.location ? ` · ${app.location}` : ""}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ backgroundColor: cfg.bg }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
                        <span className="text-[10px] font-bold" style={{ color: cfg.color }}>{cfg.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4" style={{ color: "rgb(var(--text-muted))" }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Calendar className="w-3 h-3" style={{ color: "rgb(var(--text-muted))" }} />
                    <span className="text-[10px]" style={{ color: "rgb(var(--text-muted))" }}>
                      Applied {new Date(app.date_applied).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-md rounded-3xl p-6 animate-slide-in-up" style={{ backgroundColor: "rgb(var(--surface))", border: "1px solid rgb(var(--border))" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg" style={{ color: "rgb(var(--text-primary))" }}>Add Application</h3>
              <button onClick={() => setShowAdd(false)} className="p-2 rounded-xl" style={{ backgroundColor: "rgb(var(--surface-2))", color: "rgb(var(--text-muted))" }}><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Company <span style={{ color: "#a855f7" }}>*</span></label>
                  <input className="input-field" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="e.g. Google" />
                </div>
                <div>
                  <label className="label">Status</label>
                  <select className="input-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Status })}>
                    <option value="applied">Applied</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Role <span style={{ color: "#a855f7" }}>*</span></label>
                <input className="input-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="e.g. Product Manager" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Location</label>
                  <input className="input-field" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Remote / NYC" />
                </div>
                <div>
                  <label className="label">Date applied</label>
                  <input className="input-field" type="date" value={form.date_applied} onChange={(e) => setForm({ ...form, date_applied: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea className="input-field" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Referral, salary range, recruiter name…" />
              </div>
              <button
                onClick={addApp}
                disabled={saving}
                className="w-full py-3.5 rounded-2xl text-white font-bold flex items-center justify-center gap-2 mt-1 active:scale-[0.98] transition-transform disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #10b981, #0284c7)" }}>
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" /> Save Application</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-md rounded-3xl p-6 animate-slide-in-up" style={{ backgroundColor: "rgb(var(--surface))", border: "1px solid rgb(var(--border))" }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="font-bold text-lg" style={{ color: "rgb(var(--text-primary))" }}>{showDetail.company}</p>
                <p className="text-sm" style={{ color: "rgb(var(--text-muted))" }}>{showDetail.role}</p>
              </div>
              <button onClick={() => setShowDetail(null)} className="p-2 rounded-xl" style={{ backgroundColor: "rgb(var(--surface-2))", color: "rgb(var(--text-muted))" }}><X className="w-4 h-4" /></button>
            </div>

            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "rgb(var(--text-muted))" }}>Update Status</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {(["applied","interviewing","offer","rejected"] as Status[]).map((s) => {
                const cfg = STATUS_CONFIG[s];
                const active = showDetail.status === s;
                return (
                  <button key={s} onClick={() => updateStatus(showDetail.id, s)}
                    className="py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95"
                    style={{ backgroundColor: active ? cfg.bg : "rgb(var(--surface-2))", color: active ? cfg.color : "rgb(var(--text-muted))", border: `1px solid ${active ? cfg.color + "40" : "rgb(var(--border))"}` }}>
                    {cfg.label}
                  </button>
                );
              })}
            </div>

            {showDetail.notes && (
              <div className="rounded-xl p-3 mb-4" style={{ backgroundColor: "rgb(var(--surface-2))" }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "rgb(var(--text-muted))" }}>Notes</p>
                <p className="text-sm" style={{ color: "rgb(var(--text-primary))" }}>{showDetail.notes}</p>
              </div>
            )}

            <button onClick={() => deleteApp(showDetail.id)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-red-500 border border-red-500/20 hover:bg-red-500/5 active:scale-[0.98] transition-all">
              <Trash2 className="w-4 h-4" /> Delete this application
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
