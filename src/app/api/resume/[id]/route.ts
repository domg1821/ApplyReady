import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// DELETE /api/resume/[id] — delete a resume (owner only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify resume belongs to user
    const { data: resume, error: fetchError } = await supabase
      .from("resumes")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !resume) {
      return NextResponse.json(
        { error: "Resume not found or access denied" },
        { status: 404 }
      );
    }

    const serviceClient = await createServiceClient();

    // Delete dependent analyses first
    const { error: analysesDeleteError } = await serviceClient
      .from("analyses")
      .delete()
      .eq("resume_id", id);

    if (analysesDeleteError) {
      console.error("Error deleting analyses:", analysesDeleteError);
      return NextResponse.json(
        { error: "Failed to delete resume analyses" },
        { status: 500 }
      );
    }

    // Delete the resume
    const { error: resumeDeleteError } = await serviceClient
      .from("resumes")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (resumeDeleteError) {
      console.error("Error deleting resume:", resumeDeleteError);
      return NextResponse.json(
        { error: "Failed to delete resume" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error in DELETE /api/resume/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/resume/[id] — duplicate a resume
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the resume and verify ownership
    const { data: original, error: fetchError } = await supabase
      .from("resumes")
      .select("id, title, resume_data, rewritten_data, template, raw_text")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !original) {
      return NextResponse.json(
        { error: "Resume not found or access denied" },
        { status: 404 }
      );
    }

    // Insert duplicate
    const { data: newResume, error: insertError } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        title: `${original.title} (Copy)`,
        status: "draft",
        resume_data: original.resume_data,
        raw_text: original.raw_text,
        template: original.template,
        rewritten_data: null,
      })
      .select()
      .single();

    if (insertError || !newResume) {
      console.error("Error duplicating resume:", insertError);
      return NextResponse.json(
        { error: "Failed to duplicate resume" },
        { status: 500 }
      );
    }

    return NextResponse.json({ resume: newResume });
  } catch (error) {
    console.error("Unexpected error in POST /api/resume/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
