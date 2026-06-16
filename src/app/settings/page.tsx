"use client";

import { useEffect, useState } from "react";
import {
  User, Crown, LogOut, Save, Loader2, Infinity,
  Moon, Sun, Bell, Shield, Trash2, ChevronRight, CreditCard, ArrowLeft,
  Mail, ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { BottomNav } from "@/components/layout/BottomNav";
import { useRouter } from "next/navigation";
import type { Profile } from "@/types";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { checkout, manageSubscription, loading: subLoading } = useSubscription();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [onIOS, setOnIOS] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setOnIOS((window as any).Capacitor?.getPlatform?.() === "ios");
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(data);
      setName(data?.full_name ?? "");
      setLoading(false);
    };
    load();
  }, [router]);

  const saveName = async () => {
    if (!profile) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update({ full_name: name }).eq("id", profile.id);
    if (error) toast.error("Failed to save"); else toast.success("Saved!");
    setSaving(false);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== "DELETE") { toast.error('Type "DELETE" to confirm'); return; }
    setDeleting(true);
    try {
      const res = await fetch("/api/account/delete", { method: "DELETE" });
      if (!res.ok) throw new Error();
      await createClient().auth.signOut();
      router.push("/");
      toast.success("Account deleted.");
    } catch {
      toast.error("Failed to delete account. Contact support.");
      setDeleting(false);
    }
  };

  const isPro = profile?.subscription_tier === "pro";
  const isLifetime = profile?.subscription_status === "lifetime";

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50 dark:bg-neutral-950">
        <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 flex flex-col animate-page-in"
      style={{ backgroundColor: "rgb(var(--bg))" }}
    >
      {/* Header */}
      <div
        className="border-b flex-shrink-0"
        style={{ backgroundColor: "rgb(var(--surface))", borderColor: "rgb(var(--border))", paddingTop: "max(1rem, env(safe-area-inset-top))" }}
      >
        <div className="max-w-2xl mx-auto px-5 pb-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 rounded-xl transition-colors"
            style={{ color: "rgb(var(--text-muted))" }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold" style={{ color: "rgb(var(--text-primary))" }}>Settings</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
      <div className="max-w-2xl mx-auto px-5 pb-28">

        {/* Profile */}
        <Section icon={User} title="Profile">
          <div className="space-y-3">
            <div>
              <label className="label">Full name</label>
              <input
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                className="input-field opacity-60 cursor-not-allowed"
                value={profile?.email ?? ""}
                disabled
                readOnly
              />
            </div>
            <Button onClick={saveName} loading={saving} size="sm" icon={<Save className="w-4 h-4" />}>
              Save changes
            </Button>
          </div>
        </Section>

        {/* Appearance */}
        <Section icon={theme === "dark" ? Moon : Sun} title="Appearance">
          <div
            className="flex items-center justify-between cursor-pointer py-1 select-none"
            onClick={toggleTheme}
          >
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</p>
              <p className="text-xs text-gray-400 dark:text-neutral-500 mt-0.5">
                {theme === "dark" ? "On — enjoying the dark side" : "Off — keeping it light"}
              </p>
            </div>
            <div className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${theme === "dark" ? "bg-indigo-600" : "bg-gray-200 dark:bg-neutral-700"}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${theme === "dark" ? "left-7" : "left-1"}`} />
            </div>
          </div>
        </Section>

        {/* Notifications */}
        <Section icon={Bell} title="Notifications">
          <div className="flex items-center justify-between py-1 opacity-60 cursor-not-allowed">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Email updates</p>
              <p className="text-xs text-gray-400 dark:text-neutral-500 mt-0.5">Tips, new features & job insights</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 dark:text-neutral-600" />
          </div>
          <p className="text-xs text-gray-300 dark:text-neutral-700 mt-1">Coming soon</p>
        </Section>

        {/* Plan */}
        <Section icon={Crown} title="Plan">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant={isPro ? "pro" : "default"}>
              {isLifetime ? "Lifetime" : isPro ? "Pro" : "Free"}
            </Badge>
          </div>
          {isLifetime ? (
            <div className="flex items-start gap-2.5 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40 rounded-xl">
              <Infinity className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Lifetime Access</p>
                <p className="text-xs text-amber-600/70 dark:text-amber-500/60 mt-0.5">No renewals, ever. All features unlocked.</p>
              </div>
            </div>
          ) : isPro ? (
            onIOS ? (
              <p className="text-xs text-gray-400 dark:text-neutral-500">
                Purchased via App Store
              </p>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={manageSubscription}
                loading={subLoading}
                icon={<CreditCard className="w-4 h-4" />}
              >
                Manage billing
              </Button>
            )
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 dark:text-neutral-400">
                You&apos;re on the free plan. Upgrade to unlock unlimited rewrites, all 15 templates, and PDF export.
              </p>
              <Button
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-0"
                size="sm"
                onClick={() => router.push("/upgrade")}
                icon={<Infinity className="w-4 h-4" />}
              >
                Get Lifetime Access — $14.99
              </Button>
            </div>
          )}
        </Section>

        {/* Support */}
        <Section icon={Mail} title="Support">
          <div className="space-y-2">
            <a
              href="mailto:domgbp21@gmail.com?subject=ApplyReady%20Support"
              className="flex items-center justify-between py-1 group"
            >
              <div>
                <p className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>Contact Support</p>
                <p className="text-xs mt-0.5" style={{ color: "rgb(var(--text-muted))" }}>domgbp21@gmail.com</p>
              </div>
              <ExternalLink className="w-4 h-4" style={{ color: "rgb(var(--text-muted))" }} />
            </a>
          </div>
        </Section>

        {/* Privacy */}
        <Section icon={Shield} title="Privacy & Security">
          <div className="space-y-2 text-sm text-gray-500 dark:text-neutral-400">
            <p>Your resume data is encrypted and never used to train AI models.</p>
            <button
              onClick={() => router.push("/forgot-password")}
              className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm hover:underline"
            >
              Change password →
            </button>
            <div className="flex items-center gap-4 pt-1">
              <Link href="/privacy-policy" className="text-xs font-semibold hover:underline" style={{ color: "#a855f7" }}>
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-xs font-semibold hover:underline" style={{ color: "#a855f7" }}>
                Terms of Service
              </Link>
            </div>
          </div>
        </Section>

        {/* Account */}
        <Section icon={LogOut} title="Account">
          <div className="space-y-3">
            <Button
              variant="secondary"
              onClick={handleLogout}
              size="sm"
              icon={<LogOut className="w-4 h-4" />}
            >
              Log out
            </Button>
            <button
              onClick={() => setShowDelete(true)}
              className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Delete account
            </button>
          </div>
        </Section>

        <div className="text-center mt-2 mb-4 space-y-1">
          <p className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
            ApplyReady · Version 1.0.0
          </p>
          <p className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
            Built with ❤️ for job seekers everywhere
          </p>
        </div>
      </div>
      </div>

      {/* Delete modal */}
      <Modal open={showDelete} onClose={() => setShowDelete(false)} title="Delete Account">
        <div className="space-y-4">
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/40 rounded-xl">
            <p className="text-sm text-red-700 dark:text-red-400">
              This will permanently delete your account and all your resumes. This cannot be undone.
            </p>
          </div>
          <div>
            <label className="label">
              Type <span className="font-mono font-bold text-gray-900 dark:text-white">DELETE</span> to confirm
            </label>
            <input
              className="input-field"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="DELETE"
            />
          </div>
          <Button
            variant="danger"
            className="w-full"
            onClick={handleDeleteAccount}
            loading={deleting}
            disabled={deleteInput !== "DELETE"}
          >
            Permanently delete my account
          </Button>
        </div>
      </Modal>

      <BottomNav />
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-4 mb-3">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-indigo-400 dark:text-indigo-500" />
        <h2 className="text-xs font-bold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">{title}</h2>
      </div>
      {children}
    </div>
  );
}
