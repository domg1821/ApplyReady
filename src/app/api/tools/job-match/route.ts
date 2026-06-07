import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import type { ResumeData } from "@/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const SYSTEM_PROMPT = `Analyze how well a resume matches a job description and return a structured evaluation.

Return a JSON object with this exact shape:
{
  "score": number (0-100),
  "verdict": "Strong Match" | "Good Match" | "Partial Match" | "Weak Match",
  "summary": string (exactly 2 sentences summarizing the overall fit),
  "presentKeywords": string[] (keywords/skills from the job description that appear in the resume),
  "missingKeywords": string[] (important keywords/skills from the job description that are absent),
  "improvements": Array<{ "area": string, "suggestion": string, "priority": "high" | "medium" | "low" }>,
  "strengthBullets": string[] (existing resume bullets that align well with this role),
  "bulletImprovements": Array<{ "original": string, "improved": string }>
}

Scoring criteria:
- Keyword overlap between resume skills/experience and job requirements
- Relevance of past experience to the target role
- Skills match (technical and soft)
- Job title alignment and seniority level

Verdict thresholds: 80-100 = Strong Match, 60-79 = Good Match, 40-59 = Partial Match, 0-39 = Weak Match

Be honest and accurate. Do not inflate scores. The candidate depends on this to make real decisions.

Output ONLY the marker and JSON on the next line — no explanation before or after:
###MATCH_DATA###
{ ... }`;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: {
    resumeData: ResumeData;
    jobDescription: string;
    jobTitle: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { resumeData, jobDescription, jobTitle } = body;

  if (!resumeData || !jobDescription || !jobTitle) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const userMessage = `Candidate resume data:
${JSON.stringify(resumeData, null, 2)}

Target job title: ${jobTitle}

Job description:
${jobDescription}`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const content = response.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    const text = content.text.trim();
    const marker = "###MATCH_DATA###";

    if (!text.includes(marker)) {
      throw new Error("Response did not contain expected marker");
    }

    const jsonPart = text.slice(text.indexOf(marker) + marker.length).trim();
    const cleanJson = jsonPart
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const matchData = JSON.parse(cleanJson);
    return NextResponse.json({ matchData });
  } catch (err) {
    console.error("Job match error:", err);
    return NextResponse.json(
      { error: "AI service temporarily unavailable. Please try again." },
      { status: 500 }
    );
  }
}
