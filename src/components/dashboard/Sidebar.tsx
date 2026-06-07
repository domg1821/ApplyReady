"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { memo, useState } from "react";
import {
  Sparkles, LayoutDashboard, FileText,
  Settings, LogOut, Menu, X, Crown, ClipboardList,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/Badge";
import type { Profile } from "@/types";
import toast from "react-hot-toast";

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/assessment", icon: ClipboardList, label: "Assessment" },
  { href: "/resume/new", icon: FileText, label: "New Resume" },
  { href: "/settings", icon: Settings, label: "Settings" },
] as const;

// ── Inner content extracted so it doesn't recreate on parent re-renders
const SidebarInner = memo(function SidebarInner({
  profile,
  pathname,
  onClose,
}: {
  profile: Profile | null;
  pathname: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const isPro = profile?.subscription_tier === "pro";
  const isLifetime = profile?.subscription_status === "lifetime";

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Logged out");
    router.push("/");
    router.refresh();
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-neutral-900 border-r border-gray-100 dark:border-neutral-800">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-100 dark:border-neutral-800 flex-shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white">ApplyReady</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                  : "text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100 dark:border-neutral-800 space-y-2 flex-shrink-0">
        {!isPro && (
          <Link href="/upgrade" onClick={onClose}>
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-100 dark:border-amber-800/30 hover:shadow-sm transition-shadow cursor-pointer">
              <div className="flex items-center gap-2 mb-0.5">
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400">Lifetime — $15</span>
              </div>
              <p className="text-xs text-amber-600/70 dark:text-amber-500/60">Unlimited rewrites forever</p>
            </div>
          </Link>
        )}

        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300 flex-shrink-0">
            {profile?.full_name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
              {profile?.full_name ?? "User"}
            </p>
            {isLifetime
              ? <span className="text-xs text-amber-500 font-medium">Lifetime</span>
              : isPro
              ? <Badge variant="pro">Pro</Badge>
              : <span className="text-xs text-gray-400 dark:text-neutral-500">Free</span>
            }
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
});

// ── Main export ────────────────────────────────────────────
export function DashboardSidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle — sits just below the safe area notch */}
      <button
        className="lg:hidden fixed left-4 z-50 p-2 bg-white dark:bg-neutral-900 rounded-xl shadow-card border border-gray-100 dark:border-neutral-800"
        style={{ top: "max(1rem, calc(env(safe-area-inset-top) + 0.25rem))" }}
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        {open ? <X className="w-5 h-5 text-gray-700 dark:text-neutral-300" /> : <Menu className="w-5 h-5 text-gray-700 dark:text-neutral-300" />}
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-60 z-40 transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <SidebarInner
          profile={profile}
          pathname={pathname}
          onClose={() => setOpen(false)}
        />
      </aside>
    </>
  );
}
