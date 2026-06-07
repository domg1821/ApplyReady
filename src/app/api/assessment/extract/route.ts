import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const SYSTEM_PROMPT = `You are a resume data extractor. Extract structured resume data from the provided text and return it as JSON. Be thorough and accurate. Only extract what is explicitly stated — never invent data.

Return EXACTLY this JSON schema with no extra text, no markdown, no code fences:
{
  "desiredRole": "most recent job title or stated target role",
  "industry": "inferred industry",
  "jobType": "full-time",
  "name": "",
  "email": "",
  "phone": "",
  "location": "",
  "linkedin": "",
  "website": "",
  "summary": "professional summary if present, else empty string",
  "experience": [{ "id": "exp-1", "company": "", "title": "", "location": "", "startDate": "YYYY-MM", "endDate": "YYYY-MM", "current": false, "bullets": [] }],
  "education": [{ "id": "edu-1", "institution": "", "degree": "", "field": "", "startDate": "", "endDate": "YYYY-MM", "gpa": "" }],
  "skills": [],
  "projects": [{ "id": "proj-1", "name": "", "description": "", "technologies": [], "url": "" }],
  "certifications": [{ "id": "cert-1", "name": "", "issuer": "", "date": "YYYY-MM", "url": "" }],
  "volunteerWork": [],
  "extracurriculars": [],
  "relevantCoursework": [],
  "jobDescription": ""
}`;

// POST /api/assessment/extract — extract structured resume data from pasted plain text
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { rawText } = body as { rawText?: string };

    if (!rawText || rawText.trim().length === 0) {
      return NextResponse.json(
        { error: "rawText is required and cannot be empty" },
        { status: 400 }
      );
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: rawText,
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    let parsedData: Record<string, unknown>;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      console.error("Failed to parse Claude response as JSON:", responseText);
      return NextResponse.json(
        { error: "Could not extract resume data" },
        { status: 400 }
      );
    }

    // Inject user email if the extracted email field is empty
    if (!parsedData.email) {
      parsedData.email = user.email ?? "";
    }

    return NextResponse.json({ resumeData: parsedData });
  } catch (error) {
    console.error("Unexpected error in POST /api/assessment/extract:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
