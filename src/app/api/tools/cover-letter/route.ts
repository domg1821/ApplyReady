import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import type { ResumeData } from "@/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const SYSTEM_PROMPT = `Write a compelling, tailored 3-paragraph cover letter.

Paragraph 1: Opening hook with the company name and role prominently featured, plus the candidate's single most relevant top qualification.
Paragraph 2: 2-3 specific accomplishments drawn directly from their experience that match the role requirements. Use their actual bullet points and achievements — never generic claims.
Paragraph 3: Forward-looking close expressing genuine enthusiasm for this specific company and role, with a clear call to action.

Rules:
- NEVER start with "I am writing to apply" or any variation of it.
- NEVER use generic filler phrases like "I am passionate about", "team player", "fast learner", "detail-oriented", or "hard worker".
- Use ONLY the candidate's actual bullets, achievements, and data — never fabricate or embellish.
- Adjust tone based on the tone parameter: "professional" = polished and formal; "enthusiastic" = energetic and warm; "concise" = tight and direct with shorter sentences.
- Sign off with the candidate's actual name from their resume data.
- Return ONLY the cover letter text. No explanation, no preamble, no heading.`;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: {
    resumeData: ResumeData;
    jobTitle: string;
    company: string;
    jobDescription: string;
    tone: "professional" | "enthusiastic" | "concise";
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { resumeData, jobTitle, company, jobDescription, tone } = body;

  if (!resumeData || !jobTitle || !company || !jobDescription || !tone) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const userMessage = `Candidate resume data:
${JSON.stringify(resumeData, null, 2)}

Target role: ${jobTitle}
Company: ${company}
Tone: ${tone}

Job description:
${jobDescription}`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1200,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const content = response.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    return NextResponse.json({ coverLetter: content.text.trim() });
  } catch (err) {
    console.error("Cover letter generation error:", err);
    return NextResponse.json(
      { error: "AI service temporarily unavailable. Please try again." },
      { status: 500 }
    );
  }
}
