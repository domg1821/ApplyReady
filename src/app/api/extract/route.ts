import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractResumeFromText } from "@/lib/claude";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { text } = await req.json() as { text: string };
  if (!text) return NextResponse.json({ error: "text required" }, { status: 400 });

  const data = await extractResumeFromText(text);
  return NextResponse.json({ data });
}
