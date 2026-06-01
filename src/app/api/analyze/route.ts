import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { analyzeResume } from "@/lib/claude";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { resumeId } = await req.json() as { resumeId: string };
  if (!resumeId) return NextResponse.json({ error: "resumeId required" }, { status: 400 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier, analyses_used")
    .eq("id", user.id)
    .single();

  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  if (profile.subscription_tier !== "pro" && profile.analyses_used >= 1) {
    return NextResponse.json({ error: "Analysis limit reached. Upgrade to Pro." }, { status: 403 });
  }

  const { data: resume } = await supabase
    .from("resumes")
    .select("raw_text")
    .eq("id", resumeId)
    .eq("user_id", user.id)
    .single();

  if (!resume?.raw_text) {
    return NextResponse.json({ error: "No resume text found" }, { status: 400 });
  }

  const result = await analyzeResume(resume.raw_text);

  const serviceClient = await createServiceClient();

  const { data: analysis, error } = await serviceClient
    .from("analyses")
    .insert({
      resume_id: resumeId,
      user_id: user.id,
      ...result,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to save analysis" }, { status: 500 });
  }

  await serviceClient
    .from("resumes")
    .update({ status: "analyzed", updated_at: new Date().toISOString() })
    .eq("id", resumeId);

  await serviceClient
    .from("profiles")
    .update({ analyses_used: profile.analyses_used + 1 })
    .eq("id", user.id);

  return NextResponse.json({ analysis });
}
