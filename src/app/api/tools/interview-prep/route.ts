import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import type { ResumeData } from "@/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const SYSTEM_PROMPT = `Generate exactly 8 interview questions for this candidate applying for the given role.

Question mix (follow this exactly):
- 2 behavioral questions (STAR format — Situation, Task, Action, Result)
- 2 technical or role-specific questions based on the job description
- 2 questions about the candidate's specific background and experience
- 1 situational / hypothetical question relevant to the role
- 1 "tell me about yourself" variant (e.g., "Walk me through your background", "What brought you to this field?")

For each question return an object with:
{
  "question": string,
  "category": "behavioral" | "technical" | "background" | "situational" | "intro",
  "whyAsked": string (1 sentence explaining what interviewers are evaluating),
  "answerFramework": string (2-3 sentences with concrete tips, referencing the candidate's actual resume data where relevant),
  "sampleTalkingPoints": string[] (exactly 2-3 bullet points drawn from this candidate's specific experience, companies, and accomplishments)
}

Rules:
- Use the candidate's ACTUAL data — their real companies, titles, projects, achievements.
- Questions must be specific to this role and this person, not generic.
- sampleTalkingPoints must reference their real experience, not placeholders.
- Output ONLY the marker followed by the JSON array on the next line. No preamble, no explanation after:

###QUESTIONS###
[ ... ]`;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: {
    resumeData: ResumeData;
    jobTitle: string;
    jobDescription: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { resumeData, jobTitle, jobDescription } = body;

  if (!resumeData || !jobTitle || !jobDescription) {
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
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const content = response.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    const text = content.text.trim();
    const marker = "###QUESTIONS###";

    if (!text.includes(marker)) {
      throw new Error("Response did not contain expected marker");
    }

    const jsonPart = text.slice(text.indexOf(marker) + marker.length).trim();
    const cleanJson = jsonPart
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const questions = JSON.parse(cleanJson);
    return NextResponse.json({ questions });
  } catch (err) {
    console.error("Interview prep error:", err);
    return NextResponse.json(
      { error: "AI service temporarily unavailable. Please try again." },
      { status: 500 }
    );
  }
}
