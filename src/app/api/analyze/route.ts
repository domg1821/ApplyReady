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
    .select("raw_text, resume_data, rewritten_data")
    .eq("id", resumeId)
    .eq("user_id", user.id)
    .single();

  if (!resume) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  // Build text to analyze — prefer raw_text, fall back to structured data
  let textToAnalyze = resume.raw_text ?? "";
  if (!textToAnalyze && (resume.rewritten_data || resume.resume_data)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d: any = resume.rewritten_data ?? resume.resume_data;
    const lines: string[] = [];
    if (d.name) lines.push(d.name);
    if (d.desiredRole) lines.push(d.desiredRole);
    if (d.summary) lines.push(d.summary);
    if (d.experience?.length) {
      for (const exp of d.experience) {
        lines.push(`${exp.title} at ${exp.company} (${exp.startDate ?? ""} – ${exp.current ? "Present" : exp.endDate ?? ""})`);
        for (const b of exp.bullets ?? []) lines.push(`• ${b}`);
      }
    }
    if (d.education?.length) {
      for (const edu of d.education) {
        lines.push(`${edu.degree} in ${edu.field} — ${edu.institution} ${edu.endDate ?? ""}`);
      }
    }
    if (d.skills?.length) lines.push(`Skills: ${d.skills.join(", ")}`);
    if (d.certifications?.length) {
      for (const c of d.certifications) lines.push(`${c.name} — ${c.issuer} ${c.date ?? ""}`);
    }
    if (d.projects?.length) {
      for (const p of d.projects) lines.push(`Project: ${p.name} — ${p.description ?? ""}`);
    }
    if (d.volunteerWork?.length) {
      for (const v of d.volunteerWork) lines.push(`Volunteer: ${v.role} at ${v.organization} — ${v.description ?? ""}`);
    }
    if (d.extracurriculars?.length) lines.push(`Activities: ${d.extracurriculars.join(", ")}`);
    if (d.relevantCoursework?.length) lines.push(`Relevant Coursework: ${d.relevantCoursework.join(", ")}`);
    textToAnalyze = lines.join("\n");
  }

  if (!textToAnalyze.trim()) {
    return NextResponse.json({ error: "No resume content found to analyze" }, { status: 400 });
  }

  const result = await analyzeResume(textToAnalyze);

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
