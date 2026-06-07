import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, subscription_status")
    .eq("id", user.id)
    .single();

  // Already lifetime — nothing to do
  if (profile?.subscription_status === "lifetime") {
    return NextResponse.json({ synced: true, tier: "pro", status: "lifetime" });
  }

  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ synced: false });
  }

  const service = await createServiceClient();

  // Check recent checkout sessions for this customer
  const sessions = await stripe.checkout.sessions.list({
    customer: profile.stripe_customer_id,
    limit: 10,
  });

  // Find a successful one
  const paid = sessions.data.find(
    (s) => s.status === "complete" && s.payment_status === "paid"
  );

  if (paid) {
    if (paid.mode === "payment") {
      // Lifetime deal
      await service.from("profiles").update({
        subscription_tier: "pro",
        subscription_status: "lifetime",
      }).eq("id", user.id);
      return NextResponse.json({ synced: true, tier: "pro", status: "lifetime" });
    }

    if (paid.mode === "subscription" && paid.subscription) {
      // Regular subscription
      const sub = await stripe.subscriptions.retrieve(paid.subscription as string);
      const isActive = sub.status === "active" || sub.status === "trialing";
      await service.from("profiles").update({
        subscription_tier: isActive ? "pro" : "free",
        stripe_subscription_id: paid.subscription as string,
        subscription_status: sub.status,
      }).eq("id", user.id);
      return NextResponse.json({ synced: true, tier: isActive ? "pro" : "free", status: sub.status });
    }
  }

  return NextResponse.json({ synced: false });
}
