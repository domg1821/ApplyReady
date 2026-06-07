import Anthropic from "@anthropic-ai/sdk";
import type { ResumeData, Analysis } from "@/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
const MODEL = "claude-sonnet-4-5"; // faster than 4-6 for structured outputs

export async function analyzeResume(
  rawText: string
): Promise<Omit<Analysis, "id" | "resume_id" | "user_id" | "created_at">> {
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1500,
    messages: [{
      role: "user",
      content: `You are an expert resume coach. Analyze this resume and return ONLY a valid JSON object with no markdown.

RESUME:
${rawText.slice(0, 6000)}

JSON schema:
{
  "resume_score": number (0-100),
  "ats_score": number (0-100),
  "summary_feedback": string (2-3 sentences),
  "keywords_present": string[],
  "keywords_missing": string[],
  "feedback": [{
    "category": "bullet_points"|"formatting"|"keywords"|"summary"|"achievements"|"general",
    "severity": "high"|"medium"|"low",
    "title": string,
    "description": string,
    "suggestion": string
  }]
}

Rules: Be specific. Give 5-8 feedback items. Score honestly. Return ONLY JSON.`,
    }],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response");

  // Strip any accidental markdown code fences
  const cleaned = content.text.replace(/^```json?\n?/, "").replace(/\n?```$/, "").trim();
  return JSON.parse(cleaned) as Omit<Analysis, "id" | "resume_id" | "user_id" | "created_at">;
}

export async function rewriteResume(resumeData: ResumeData): Promise<ResumeData> {
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 4000,
    messages: [{
      role: "user",
      content: `You are an expert resume writer. Rewrite and optimize this resume. Return ONLY the improved JSON object — same structure as input, no markdown.

STRICT RULES:
1. Never invent experience, education, or certifications
2. Never add fake metrics not in the original
3. Never change company names, job titles, dates, or institutions
4. Only improve wording, clarity, and impact
5. Make bullets achievement-focused with strong action verbs
6. Remove "responsible for", "helped with", "worked on"
7. Every bullet starts with a past-tense action verb
8. Same number of bullets per role
9. Optimize for ATS keywords naturally

INPUT:
${JSON.stringify(resumeData)}

Return ONLY the improved JSON. No explanation.`,
    }],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response");
  const cleaned = content.text.replace(/^```json?\n?/, "").replace(/\n?```$/, "").trim();
  return JSON.parse(cleaned) as ResumeData;
}

export async function extractResumeFromText(rawText: string): Promise<Partial<ResumeData>> {
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 2500,
    messages: [{
      role: "user",
      content: `Extract structured resume data from this text. Return ONLY valid JSON — no markdown.

TEXT:
${rawText.slice(0, 5000)}

JSON schema (omit fields you can't find):
{
  "name": string, "email": string, "phone": string, "location": string,
  "linkedin": string, "website": string, "summary": string,
  "experience": [{"id":"uuid","company":string,"title":string,"location":string,"startDate":string,"endDate":string,"current":boolean,"bullets":string[]}],
  "education": [{"id":"uuid","institution":string,"degree":string,"field":string,"startDate":string,"endDate":string,"gpa":string}],
  "skills": string[],
  "projects": [{"id":"uuid","name":string,"description":string,"technologies":string[],"url":string}],
  "certifications": [{"id":"uuid","name":string,"issuer":string,"date":string,"url":string}]
}

Return ONLY JSON.`,
    }],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response");
  const cleaned = content.text.replace(/^```json?\n?/, "").replace(/\n?```$/, "").trim();
  return JSON.parse(cleaned) as Partial<ResumeData>;
}
