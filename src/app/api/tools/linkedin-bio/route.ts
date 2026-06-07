import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import type { ResumeData } from "@/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const SYSTEM_PROMPT = `Write a LinkedIn About section (200-280 words) for this professional.

Structure:
1. Hook sentence — who they are and what makes them distinct. NEVER start with "I".
2. Core expertise paragraph — their primary domain, skills, and what they're known for professionally.
3. 2-3 career highlights — specific, quantified achievements drawn from their actual experience.
4. What they're currently seeking or open to (career focus, collaboration, opportunities).
5. Soft call-to-action ending — e.g., "Feel free to connect" or "Always open to a conversation."

Rules:
- NEVER use any of these phrases: "passionate professional", "results-driven", "self-starter", "team player", "hard worker", "detail-oriented", "dynamic", "synergy", "leverage", "thought leader".
- Use the candidate's ACTUAL data — companies, job titles, real achievements — never generic claims.
- Adjust tone based on the tone parameter: "professional" = polished and authoritative; "conversational" = warm and approachable, first-person throughout; "bold" = confident, punchy, direct.
- Stay within 200-280 words. Count carefully.
- Return ONLY the bio text. No heading, no label, no explanation.`;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: {
    resumeData: ResumeData;
    tone: "professional" | "conversational" | "bold";
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { resumeData, tone } = body;

  if (!resumeData || !tone) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const userMessage = `Candidate resume data:
${JSON.stringify(resumeData, null, 2)}

Tone: ${tone}`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const content = response.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    return NextResponse.json({ bio: content.text.trim() });
  } catch (err) {
    console.error("LinkedIn bio generation error:", err);
    return NextResponse.json(
      { error: "AI service temporarily unavailable. Please try again." },
      { status: 500 }
    );
  }
}
