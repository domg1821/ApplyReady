"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) { toast.error(error.message); setLoading(false); return; }
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="screen bg-gray-50 dark:bg-neutral-950 animate-page-in">
      <div className="flex items-center px-5 flex-shrink-0" style={{ paddingTop: "max(1rem, env(safe-area-inset-top))", paddingBottom: "1rem" }}>
        <Link href="/login" className="flex items-center gap-2 text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to login</span>
        </Link>
      </div>

      <div className="flex-1 flex flex-col justify-center px-5 pb-safe">
        <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center mb-6">
          <Sparkles className="w-6 h-6 text-white" />
        </div>

        {!sent ? (
          <>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Reset password</h1>
            <p className="text-gray-500 dark:text-neutral-400 text-sm mb-8">
              Enter your email and we&apos;ll send you a reset link.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email address</label>
                <input
                  className="input-field"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <Button type="submit" loading={loading} className="w-full" size="lg">
                Send reset link
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Check your inbox</h2>
            <p className="text-gray-500 dark:text-neutral-400 text-sm mb-6">
              We sent a reset link to{" "}
              <span className="font-semibold text-gray-700 dark:text-neutral-300">{email}</span>.
              It expires in 1 hour.
            </p>
            <Link href="/login">
              <Button variant="secondary" className="mx-auto">Back to login</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
