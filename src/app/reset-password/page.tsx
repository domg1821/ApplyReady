"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast.error("Passwords don't match"); return; }
    if (password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { toast.error(error.message); setLoading(false); return; }
    toast.success("Password updated!");
    router.push("/dashboard");
  };

  return (
    <div className="screen bg-gray-50 dark:bg-neutral-950">
      <div className="flex items-center justify-center px-5 flex-shrink-0" style={{ paddingTop: "max(1rem, env(safe-area-inset-top))", paddingBottom: "1rem" }}>
        <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-5 pb-safe">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">New password</h1>
        <p className="text-gray-500 dark:text-neutral-400 text-sm mb-8">
          Enter a new password for your account.
        </p>
        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="label">New password</label>
            <div className="relative">
              <input className="input-field pr-11" type={show ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="label">Confirm password</label>
            <input className="input-field" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat password" />
          </div>
          <Button type="submit" loading={loading} className="w-full" size="lg">
            Update password
          </Button>
        </form>
      </div>
    </div>
  );
}
