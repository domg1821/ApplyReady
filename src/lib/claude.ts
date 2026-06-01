import Anthropic from "@anthropic-ai/sdk";
import type { ResumeData, Analysis } from "@/types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const MODEL = "claude-sonnet-4-6";

export async function analyzeResume(
  rawText: string
): Promise<Omit<Analysis, "id" | "resume_id" | "user_id" | "created_at">> {
  const prompt = `You are an expert resume coach and ATS optimization specialist. Analyze the following resume and provide detailed, actionable feedback.

RESUME TEXT:
${rawText}

Respond with a JSON object matching this exact schema:
{
  "resume_score": number (0-100, overall quality score),
  "ats_score": number (0-100, ATS compatibility score),
  "summary_feedback": string (2-3 sentence overall assessment),
  "keywords_present": string[] (relevant keywords already in resume),
  "keywords_missing": string[] (important keywords that should be added),
  "feedback": [
    {
      "category": "bullet_points" | "formatting" | "keywords" | "summary" | "achievements" | "general",
      "severity": "high" | "medium" | "low",
      "title": string (short title for this issue),
      "description": string (what the problem is),
      "suggestion": string (specific actionable suggestion to fix it)
    }
  ]
}

Rules:
- Be specific and constructive, not generic
- Focus on ATS optimization and recruiter appeal
- Identify weak bullet points that lack metrics/achievements
- Flag missing quantifiable results
- Note formatting issues that hurt ATS parsing
- Provide 5-10 feedback items
- Score honestly - a good resume should score 70-85, exceptional 85+
- Return ONLY valid JSON, no markdown, no explanation`;

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");

  const parsed = JSON.parse(content.text) as Omit<
    Analysis,
    "id" | "resume_id" | "user_id" | "created_at"
  >;
  return parsed;
}

export async function rewriteResume(
  resumeData: ResumeData
): Promise<ResumeData> {
  const prompt = `You are an expert resume writer specializing in creating ATS-optimized, recruiter-approved resumes for competitive job markets.

ORIGINAL RESUME DATA:
${JSON.stringify(resumeData, null, 2)}

Your task is to rewrite and optimize this resume. Return an improved version as a JSON object with the EXACT same structure as the input.

STRICT RULES - YOU MUST FOLLOW THESE:
1. NEVER invent or fabricate experience, education, or certifications not in the original
2. NEVER add fake metrics or numbers not mentioned or inferable from the original
3. NEVER change company names, job titles, dates, or institutions
4. ONLY improve the wording, clarity, and impact of existing information
5. Make bullet points achievement-focused using strong action verbs
6. Optimize for ATS systems - use industry-standard keywords
7. Make the professional summary compelling and specific to the desired role
8. Improve bullet points to be concise (1-2 lines), quantified where possible from provided data
9. Remove weak filler phrases like "responsible for", "helped with", "worked on"
10. Ensure every bullet starts with a strong past-tense action verb
11. Keep the same number of bullet points per role (do not add or remove)
12. If desiredRole is provided, tailor wording toward that role

Return ONLY the improved JSON object with identical structure to the input. No markdown, no explanation.`;

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");

  return JSON.parse(content.text) as ResumeData;
}

export async function extractResumeFromText(
  rawText: string
): Promise<Partial<ResumeData>> {
  const prompt = `Extract structured resume data from the following resume text. Return a JSON object.

RESUME TEXT:
${rawText}

Return a JSON object with this structure (omit fields you cannot find):
{
  "name": string,
  "email": string,
  "phone": string,
  "location": string,
  "linkedin": string,
  "website": string,
  "summary": string,
  "experience": [
    {
      "id": "uuid-style string",
      "company": string,
      "title": string,
      "location": string,
      "startDate": string,
      "endDate": string,
      "current": boolean,
      "bullets": string[]
    }
  ],
  "education": [
    {
      "id": "uuid-style string",
      "institution": string,
      "degree": string,
      "field": string,
      "startDate": string,
      "endDate": string,
      "gpa": string
    }
  ],
  "skills": string[],
  "projects": [
    {
      "id": "uuid-style string",
      "name": string,
      "description": string,
      "technologies": string[],
      "url": string
    }
  ],
  "certifications": [
    {
      "id": "uuid-style string",
      "name": string,
      "issuer": string,
      "date": string,
      "url": string
    }
  ]
}

Return ONLY valid JSON. No markdown.`;

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 3000,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");

  return JSON.parse(content.text) as Partial<ResumeData>;
}
