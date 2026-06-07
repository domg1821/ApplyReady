"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, ClipboardList, PenLine, ArrowRight } from "lucide-react";
import { UploadZone } from "@/components/dashboard/UploadZone";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

type Mode = "upload" | "paste" | "scratch";

export default function NewResumePage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode | null>(null);
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Please give your resume a title");
      return;
    }
    if (mode !== "scratch" && !text.trim()) {
      toast.error("Please provide your resume content");
      return;
    }

    setCreating(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data, error } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        title: title.trim(),
        raw_text: text || null,
        status: "draft",
        template: "modern",
      })
      .select()
      .single();

    if (error || !data) {
      toast.error("Failed to create resume");
      setCreating(false);
      return;
    }

    router.push(`/resume/${data.id}`);
  };

  const MODES = [
    {
      id: "upload" as Mode,
      icon: FileText,
      title: "Upload PDF",
      description: "Upload your existing resume as a PDF",
    },
    {
      id: "paste" as Mode,
      icon: ClipboardList,
      title: "Paste text",
      description: "Copy and paste your resume text",
    },
    {
      id: "scratch" as Mode,
      icon: PenLine,
      title: "Start from scratch",
      description: "Build a new resume using the guided form",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto animate-page-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">New Resume</h1>
        <p className="text-gray-400 dark:text-neutral-500 text-sm">Choose how you&apos;d like to get started.</p>
      </div>

      {/* Title */}
      <div className="card p-5 mb-5">
        <label className="label" htmlFor="title">Resume title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Software Engineer Resume"
          className="input-field"
        />
      </div>

      {/* Mode selection */}
      {!mode && (
        <div className="grid gap-3">
          {MODES.map(({ id, icon: Icon, title: mTitle, description }) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className="card p-5 text-left hover:shadow-card-hover transition-all duration-200 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                  <Icon className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{mTitle}</p>
                  <p className="text-sm text-gray-500">{description}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Upload mode */}
      {mode === "upload" && (
        <div className="card p-6 space-y-4">
          <UploadZone onTextExtracted={setText} />
          {text && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Extracted text preview:</p>
              <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-600 max-h-40 overflow-y-auto font-mono">
                {text.slice(0, 500)}…
              </div>
            </div>
          )}
        </div>
      )}

      {/* Paste mode */}
      {mode === "paste" && (
        <div className="card p-6">
          <label className="label" htmlFor="paste">Paste your resume text</label>
          <textarea
            id="paste"
            rows={14}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your full resume here…"
            className="input-field resize-none font-mono text-xs leading-relaxed"
          />
        </div>
      )}

      {/* Scratch mode */}
      {mode === "scratch" && (
        <div className="card p-6">
          <p className="text-sm text-gray-500">
            You&apos;ll be taken to the resume builder form after creating your resume.
          </p>
        </div>
      )}

      {mode && (
        <div className="flex gap-3 mt-4">
          <Button variant="secondary" onClick={() => setMode(null)}>
            Back
          </Button>
          <Button onClick={handleCreate} loading={creating} className="flex-1">
            {mode === "scratch" ? "Start building" : "Continue to analysis"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
