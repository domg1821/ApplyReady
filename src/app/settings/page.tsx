"use client";

import { useEffect, useState } from "react";
import { User, Crown, CreditCard, LogOut, Save, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useRouter } from "next/navigation";
import type { Profile } from "@/types";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const router = useRouter();
  const { checkout, manageSubscription, loading: subLoading } = useSubscription();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
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
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: name })
      .eq("id", profile.id);
    if (error) toast.error("Failed to save");
    else toast.success("Profile updated");
    setSaving(false);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  const isPro = profile?.subscription_tier === "pro";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      {/* Profile */}
      <section className="card p-6 mb-5">
        <div className="flex items-center gap-3 mb-5">
          <User className="w-5 h-5 text-gray-400" />
          <h2 className="font-semibold text-gray-900">Profile</h2>
        </div>
        <div className="space-y-4">
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
              className="input-field"
              value={profile?.email ?? ""}
              disabled
              readOnly
            />
          </div>
          <Button onClick={saveName} loading={saving} icon={<Save className="w-4 h-4" />} size="sm">
            Save changes
          </Button>
        </div>
      </section>

      {/* Billing */}
      <section id="billing" className="card p-6 mb-5">
        <div className="flex items-center gap-3 mb-5">
          <Crown className="w-5 h-5 text-indigo-500" />
          <h2 className="font-semibold text-gray-900">Subscription</h2>
          <Badge variant={isPro ? "pro" : "default"}>
            {isPro ? "Pro" : "Free"}
          </Badge>
        </div>

        {isPro ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              You&apos;re on the Pro plan. Enjoy unlimited rewrites, PDF export, and all templates.
            </p>
            <Button
              variant="secondary"
              onClick={manageSubscription}
              loading={subLoading}
              icon={<CreditCard className="w-4 h-4" />}
              size="sm"
            >
              Manage billing
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              You&apos;re on the Free plan (1 analysis). Upgrade to Pro for unlimited rewrites and exports.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button
                onClick={() => checkout(process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID ?? "")}
                loading={subLoading}
                size="sm"
              >
                Monthly — $19/mo
              </Button>
              <Button
                variant="secondary"
                onClick={() => checkout(process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID ?? "")}
                loading={subLoading}
                size="sm"
              >
                Annual — $12/mo · Save 37%
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* Account */}
      <section className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <LogOut className="w-5 h-5 text-gray-400" />
          <h2 className="font-semibold text-gray-900">Account</h2>
        </div>
        <Button variant="danger" onClick={handleLogout} size="sm">
          Log out
        </Button>
      </section>
    </div>
  );
}
