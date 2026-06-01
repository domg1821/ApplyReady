import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { rewriteResume, extractResumeFromText } from "@/lib/claude";
import type { ResumeData } from "@/types";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .single();

  if (profile?.subscription_tier !== "pro") {
    return NextResponse.json({ error: "Pro subscription required" }, { status: 403 });
  }

  const { resumeId } = await req.json() as { resumeId: string };
  const { data: resume } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", resumeId)
    .eq("user_id", user.id)
    .single();

  if (!resume) return NextResponse.json({ error: "Resume not found" }, { status: 404 });

  let resumeData: ResumeData | null = resume.resume_data as ResumeData | null;

  if (!resumeData && resume.raw_text) {
    const extracted = await extractResumeFromText(resume.raw_text);
    resumeData = { ...getEmptyData(), ...extracted } as ResumeData;
  }

  if (!resumeData) {
    return NextResponse.json({ error: "No resume data to rewrite" }, { status: 400 });
  }

  const rewritten = await rewriteResume(resumeData);

  const serviceClient = await createServiceClient();
  const { data: updated } = await serviceClient
    .from("resumes")
    .update({
      resume_data: resumeData,
      rewritten_data: rewritten,
      status: "rewritten",
      updated_at: new Date().toISOString(),
    })
    .eq("id", resumeId)
    .select()
    .single();

  return NextResponse.json({ resume: updated });
}

function getEmptyData(): ResumeData {
  return {
    name: "", email: "", phone: "", location: "", linkedin: "", website: "",
    summary: "", desiredRole: "", jobDescription: "",
    experience: [], education: [], skills: [], projects: [], certifications: [],
  };
}
