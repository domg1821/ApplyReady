"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, ArrowLeft, Loader2 } from "lucide-react";
import { AppLogo } from "@/components/ui/AppLogo";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="screen items-center justify-center"><Loader2 className="w-7 h-7 animate-spin text-indigo-400" /></div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const [mode, setMode] = useState<"options" | "email">("options");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "apple" | null>(null);

  const handleOAuth = async (provider: "google" | "apple") => {
    setOauthLoading(provider);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { toast.error(error.message); setOauthLoading(null); }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { toast.error(error.message); setLoading(false); return; }
    toast.success("Welcome back!");
    const onboarded = (() => { try { return localStorage.getItem("applyready_onboarded"); } catch { return null; } })();
    router.push(onboarded ? "/dashboard" : "/onboarding");
    router.refresh();
  };

  return (
    <div className="screen bg-gray-50 dark:bg-neutral-950 animate-page-in">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 flex-shrink-0"
        style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))", paddingBottom: "1.25rem" }}>
        <Link href="/" className="flex items-center gap-2">
          <AppLogo size={28} />
          <span className="font-bold text-gray-900 dark:text-white text-sm">ApplyReady</span>
        </Link>
        <Link href="/signup" className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold">
          Sign up →
        </Link>
      </div>

      {/* Content — centered vertically */}
      <div className="flex-1 overflow-y-auto px-5 flex flex-col justify-center"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="w-full max-w-sm mx-auto">

          {mode === "email" && (
            <button
              onClick={() => setMode("options")}
              className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-neutral-400 font-medium mb-6 hover:text-gray-700 dark:hover:text-neutral-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {mode === "email" ? "Sign in with email" : "Welcome back"}
          </h1>
          <p className="text-gray-400 dark:text-neutral-500 text-sm mb-7">
            {mode === "email" ? "Enter your credentials to continue." : "Sign in to continue building your career."}
          </p>

          {mode === "options" ? (
            <div className="space-y-3">
              <OAuthButton provider="google" loading={oauthLoading === "google"} onClick={() => handleOAuth("google")} />
              <OAuthButton provider="apple" loading={oauthLoading === "apple"} onClick={() => handleOAuth("apple")} />
              <Divider />
              <button
                onClick={() => setMode("email")}
                className="w-full flex items-center justify-center gap-3 py-3.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-2xl text-sm font-semibold text-gray-700 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-800 active:scale-[0.98] transition-all"
              >
                <Mail className="w-4.5 h-4.5 text-gray-400" />
                Continue with Email
              </button>
              <p className="text-center text-xs text-gray-400 dark:text-neutral-600 pt-1">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-indigo-600 dark:text-indigo-400 font-semibold">Sign up free</Link>
              </p>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4 animate-page-in">
              <div>
                <label className="label">Email</label>
                <input
                  className="input-field"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoFocus
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="label mb-0">Password</label>
                  <Link href="/forgot-password" className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    className="input-field pr-11"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" loading={loading} className="w-full" size="lg">
                Sign in
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function OAuthButton({ provider, loading, onClick }: { provider: "google" | "apple"; loading: boolean; onClick: () => void }) {
  if (provider === "google") {
    return (
      <button
        onClick={onClick}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 py-3.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-2xl text-sm font-semibold text-gray-700 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-800 active:scale-[0.98] transition-all shadow-sm disabled:opacity-60"
      >
        {loading ? (
          <span className="w-5 h-5 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
        )}
        Continue with Google
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 py-3.5 bg-black dark:bg-white border border-black dark:border-white rounded-2xl text-sm font-semibold text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-gray-100 active:scale-[0.98] transition-all shadow-sm disabled:opacity-60"
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
      ) : (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
      )}
      Continue with Apple
    </button>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="flex-1 h-px bg-gray-200 dark:bg-neutral-800" />
      <span className="text-xs text-gray-400 dark:text-neutral-600 font-medium">or</span>
      <div className="flex-1 h-px bg-gray-200 dark:bg-neutral-800" />
    </div>
  );
}
