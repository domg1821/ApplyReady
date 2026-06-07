import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type"); // "signup" | "recovery" | etc.

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Password reset — go to reset page
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/reset-password`);
      }

      // New signup — go to welcome page
      return NextResponse.redirect(`${origin}/welcome`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=confirmation_failed`);
}
