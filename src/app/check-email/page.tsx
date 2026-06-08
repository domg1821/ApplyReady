"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Sparkles, Mail, ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "your email";
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const resend = async () => {
    setResending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      toast.error("Couldn't resend. Try signing up again.");
    } else {
      setResent(true);
      toast.success("Email resent!");
    }
    setResending(false);
  };

  return (
    <div className="screen bg-gray-50 dark:bg-neutral-950 items-center justify-center px-5 animate-page-in" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      {/* Animated envelope */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-2xl shadow-indigo-200 dark:shadow-indigo-900/40">
          <Mail className="w-12 h-12 text-white" />
        </div>
        {/* Ping rings */}
        <div className="absolute inset-0 rounded-3xl bg-indigo-400/30 animate-ping" />
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-400 border-2 border-white dark:border-neutral-950 flex items-center justify-center">
          <span className="text-white text-xs font-bold">1</span>
        </div>
      </div>

      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-6 h-6 rounded-lg gradient-brand flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
        <span className="text-sm font-bold text-gray-400 dark:text-neutral-500">ApplyReady</span>
      </div>

      {/* Message */}
      <div className="text-center max-w-xs">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Check your inbox
        </h1>
        <p className="text-gray-500 dark:text-neutral-400 text-sm leading-relaxed mb-2">
          We sent a confirmation link to
        </p>
        <p className="font-semibold text-gray-900 dark:text-white text-sm mb-6 bg-gray-100 dark:bg-neutral-800 px-4 py-2 rounded-xl inline-block">
          {email}
        </p>
        <p className="text-gray-400 dark:text-neutral-500 text-xs leading-relaxed mb-8">
          Click the link in the email to confirm your account and get started. Check your spam folder if you don&apos;t see it.
        </p>

        {/* Actions */}
        <div className="space-y-3">
          {!resent ? (
            <button
              onClick={resend}
              disabled={resending}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/40 rounded-2xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${resending ? "animate-spin" : ""}`} />
              {resending ? "Resending…" : "Resend confirmation email"}
            </button>
          ) : (
            <div className="w-full py-3 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40 rounded-2xl text-center">
              ✓ Email resent successfully
            </div>
          )}

          <Link href="/login">
            <button className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200 transition-colors">
              Back to login <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={<div className="screen items-center justify-center"><Mail className="w-8 h-8 text-indigo-400 animate-pulse" /></div>}>
      <CheckEmailContent />
    </Suspense>
  );
}
