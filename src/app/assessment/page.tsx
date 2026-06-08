"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Send, Sparkles, Loader2,
  CheckCircle2, ArrowRight, User, Briefcase,
  GraduationCap, Wrench, FolderOpen, Award,
  MapPin, Phone, Linkedin, Globe, Check,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { BottomNav } from "@/components/layout/BottomNav";
import type { ResumeData, Profile, TemplateId } from "@/types";
import toast from "react-hot-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// ── Template quick-pick ─────────────────────────────────
const TEMPLATE_OPTIONS: { id: TemplateId; label: string; color: string; tier: "free" | "pro" }[] = [
  { id: "modern",      label: "Modern",    color: "#6366f1", tier: "free" },
  { id: "minimal",     label: "Minimal",   color: "#6b7280", tier: "free" },
  { id: "tech",        label: "Tech",      color: "#0ea5e9", tier: "free" },
  { id: "student",     label: "Student",   color: "#10b981", tier: "free" },
  { id: "executive",   label: "Executive", color: "#1e3a5f", tier: "pro"  },
  { id: "creative",    label: "Creative",  color: "#14b8a6", tier: "pro"  },
  { id: "corporate",   label: "Corporate", color: "#1e3a5f", tier: "pro"  },
  { id: "elegant",     label: "Elegant",   color: "#b45309", tier: "pro"  },
  { id: "navy",        label: "Navy",      color: "#0f2444", tier: "pro"  },
  { id: "gradient",    label: "Gradient",  color: "#8b5cf6", tier: "pro"  },
];

// ── Detect which sections are covered based on conversation ─
function detectProgress(messages: Message[]): Set<string> {
  const covered = new Set<string>();
  const aiText = messages
    .filter((m) => m.role === "assistant")
    .map((m) => (typeof m.content === "string" ? m.content : "").toLowerCase())
    .join(" ");

  if (aiText.match(/role|position|targeting|industry|field/)) covered.add("role");
  if (aiText.match(/full name|your name|phone|location|city|based|linkedin|portfolio/)) covered.add("contact");
  if (aiText.match(/years of experience|strength|superpower|professional strength/)) covered.add("context");
  if (aiText.match(/most recent|current job|job title|company|worked at|responsibilities/)) covered.add("experience");
  if (aiText.match(/education|school|degree|college|university|graduated|major/)) covered.add("education");
  if (aiText.match(/skill|tools|software|platform|language|framework|technology/)) covered.add("skills");
  if (aiText.match(/project|certification|award|achievement|recognition/)) covered.add("extras");

  return covered;
}

const PROGRESS_STEPS = [
  { key: "role",       label: "Role",       icon: Briefcase     },
  { key: "contact",    label: "Contact",    icon: Phone         },
  { key: "experience", label: "Experience", icon: Briefcase     },
  { key: "education",  label: "Education",  icon: GraduationCap },
  { key: "skills",     label: "Skills",     icon: Wrench        },
  { key: "extras",     label: "Extras",     icon: FolderOpen    },
];

const CHAT_STORAGE_KEY = "applyready_alex_chat";

function saveChatToStorage(userId: string, messages: Message[]) {
  try { localStorage.setItem(`${CHAT_STORAGE_KEY}_${userId}`, JSON.stringify(messages)); } catch {}
}
function loadChatFromStorage(userId: string): Message[] {
  try { return JSON.parse(localStorage.getItem(`${CHAT_STORAGE_KEY}_${userId}`) ?? "[]"); } catch { return []; }
}
function clearChatStorage(userId: string) {
  try { localStorage.removeItem(`${CHAT_STORAGE_KEY}_${userId}`); } catch {}
}

export default function AssessmentPage() {
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [resumeData, setResumeData] = useState<Partial<ResumeData> | null>(null);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>("modern");
  // Paste path state
  const [mode, setMode] = useState<"choose" | "chat" | "paste">("choose");
  const [pasteText, setPasteText] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [hasSavedChat, setHasSavedChat] = useState(false);

  const isPro = profile?.subscription_tier === "pro";

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(data);
      setUserId(user.id);
      // Check for saved chat
      const saved = loadChatFromStorage(user.id);
      if (saved.length > 0) setHasSavedChat(true);
    };
    load();
  }, [router]);

  // Persist chat on every message change
  useEffect(() => {
    if (userId && messages.length > 0) saveChatToStorage(userId, messages);
  }, [messages, userId]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const startConversation = async (resume?: boolean) => {
    // If resuming saved chat
    if (resume && userId) {
      const saved = loadChatFromStorage(userId);
      if (saved.length > 0) {
        setMessages(saved);
        setStarted(true);
        setMode("chat");
        return;
      }
    }
    setStarted(true);
    setMode("chat");
    setLoading(true);
    try {
      const res = await fetch("/api/assessment/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [] }),
      });
      const data = await res.json() as { reply?: string; done: boolean };
      setMessages([{ role: "assistant", content: data.reply ?? "Hey! I'm Alex, your resume coach. What role are you targeting?" }]);
    } catch {
      toast.error("Couldn't connect. Please try again.");
      setStarted(false);
      setMode("choose");
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handlePasteExtract = async () => {
    if (!pasteText.trim()) { toast.error("Paste your resume text first"); return; }
    setExtracting(true);
    try {
      const res = await fetch("/api/assessment/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: pasteText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Extraction failed");
      setResumeData(data.resumeData);
      setDone(true);
      toast.success("Resume data extracted! Review and build.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not extract resume data. Try the chat instead.");
    } finally {
      setExtracting(false);
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/assessment/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json() as { reply?: string; done: boolean; resumeData?: Partial<ResumeData> };

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply ?? "Sorry, something went wrong. Please try again." }]);

      if (data.done && data.resumeData) {
        setDone(true);
        setResumeData(data.resumeData);
        clearChatStorage(userId); // Clear saved chat once done
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleGenerate = async () => {
    if (!resumeData) return;
    setSaving(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      const { data: resume, error } = await supabase
        .from("resumes")
        .insert({
          user_id: user.id,
          title: `${resumeData.desiredRole || "My"} Resume`,
          raw_text: buildRawText(resumeData),
          resume_data: resumeData,
          status: "draft",
          template: selectedTemplate,
        })
        .select()
        .single();

      if (error || !resume) throw new Error("Failed to save");

      if (isPro) {
        setGenerating(true);
        setSaving(false);
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeId: resume.id }),
        });
        if (!res.ok) throw new Error("Generation failed");
        toast.success("Resume generated!");
        router.push(`/resume/${resume.id}?generated=1`);
      } else {
        toast.success("Resume saved!");
        router.push(`/resume/${resume.id}`);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
      setSaving(false);
      setGenerating(false);
    }
  };

  // ── Generating screen ─────────────────────────────────
  if (generating) {
    return (
      <div className="screen bg-gray-50 dark:bg-neutral-950 items-center justify-center gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl gradient-brand flex items-center justify-center animate-logo-pulse shadow-2xl shadow-indigo-200 dark:shadow-indigo-900/40">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <div className="absolute inset-0 rounded-3xl bg-indigo-400/20 animate-ping" />
        </div>
        <div className="text-center">
          <p className="font-bold text-gray-900 dark:text-white text-lg mb-1">Crafting your resume…</p>
          <p className="text-sm text-gray-400 dark:text-neutral-500">Alex is writing your professional content</p>
        </div>
        <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
        <p className="text-xs text-gray-300 dark:text-neutral-600 text-center max-w-xs">
          This usually takes about 20 seconds. We&apos;re optimizing every bullet point for impact.
        </p>
      </div>
    );
  }

  // ── Paste / Upload path ─────────────────────────────────
  if (mode === "paste" && !done) {
    return (
      <div className="screen bg-gray-50 dark:bg-neutral-950 animate-page-in">
        <div className="flex items-center gap-3 px-5 flex-shrink-0" style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}>
          <button onClick={() => setMode("choose")} className="flex items-center gap-2 py-3 text-gray-500 dark:text-neutral-400">
            <ArrowLeft className="w-4 h-4" /><span className="text-sm font-medium">Back</span>
          </button>
        </div>
        <div className="flex-1 flex flex-col px-5 pt-2" style={{ paddingBottom: "max(5rem, calc(env(safe-area-inset-bottom) + 4rem))" }}>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Paste your existing resume</h1>
          <p className="text-sm text-gray-500 dark:text-neutral-400 mb-5">Alex will extract your information and build a structured resume you can edit and improve.</p>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            className="input-field flex-1 min-h-[300px] text-sm font-mono leading-relaxed"
            placeholder={"Paste your full resume text here...\n\nJohn Smith\njohn@email.com | (555) 123-4567\nSan Francisco, CA\n\nEXPERIENCE\nSoftware Engineer — Google\n2021–Present\n• Built..."}
          />
          <button
            onClick={handlePasteExtract}
            disabled={extracting || !pasteText.trim()}
            className="w-full py-4 mt-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}
          >
            {extracting ? <><Loader2 className="w-5 h-5 animate-spin" /> Extracting your data…</> : <><Sparkles className="w-5 h-5" /> Extract & Build Resume</>}
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  // ── Pre-start screen ────────────────────────────────────
  if (!started) {
    return (
      <div className="screen bg-gray-50 dark:bg-neutral-950 animate-page-in">
        <div className="flex items-center px-5 flex-shrink-0" style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}>
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 py-3 text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Home</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 flex flex-col px-5 py-4" style={{ paddingBottom: "max(5rem, calc(env(safe-area-inset-bottom) + 4rem))" }}>
          <div className="w-16 h-16 rounded-3xl gradient-brand flex items-center justify-center mb-6 shadow-lg shadow-indigo-100 dark:shadow-indigo-900/30">
            <Sparkles className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Meet Alex, your AI resume coach
          </h1>
          <p className="text-gray-500 dark:text-neutral-400 text-sm leading-relaxed mb-8">
            Answer a few simple questions in a natural conversation and Alex will build your entire professional resume — no forms, no guessing.
          </p>

          <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl p-5 mb-7 space-y-3.5">
            <p className="text-xs font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest mb-1">What Alex will ask you</p>
            {[
              { icon: Briefcase,     text: "Your target role and work experience" },
              { icon: GraduationCap, text: "Education, certifications, and skills" },
              { icon: Award,         text: "Achievements, projects, and what makes you stand out" },
              { icon: Sparkles,      text: isPro ? "Alex writes ATS-optimized bullets using your answers" : "Get a complete resume ready to view and export" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                </div>
                <span className="text-sm text-gray-700 dark:text-neutral-300">{text}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400 dark:text-neutral-500 text-center mb-5">
            Typically takes 5–10 minutes · Your answers are private and secure
          </p>

          {/* Resume saved chat */}
          {hasSavedChat && (
            <button
              onClick={() => startConversation(true)}
              className="w-full py-3.5 mb-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] border-2"
              style={{ borderColor: "#a855f7", color: "#a855f7", backgroundColor: "rgba(168,85,247,0.08)" }}
            >
              <ArrowRight className="w-5 h-5" />
              Continue where I left off
            </button>
          )}

          <button
            onClick={() => startConversation()}
            className="w-full py-4 gradient-brand text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-indigo-900/30 active:scale-[0.98] transition-all"
          >
            <Sparkles className="w-5 h-5" />
            {hasSavedChat ? "Start fresh with Alex" : "Start chatting with Alex"}
          </button>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200 dark:bg-neutral-800" />
            <span className="text-xs text-gray-400 dark:text-neutral-600 font-medium">or</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-neutral-800" />
          </div>

          <button
            onClick={() => setMode("paste")}
            className="w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] border"
            style={{ borderColor: "rgb(var(--border))", color: "rgb(var(--text-secondary))", backgroundColor: "rgb(var(--surface))" }}
          >
            I already have a resume — import it
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  // ── Done — rich summary screen ──────────────────────────
  if (done && resumeData) {
    const expCount = resumeData.experience?.length ?? 0;
    const skillCount = resumeData.skills?.length ?? 0;
    const hasCerts = (resumeData.certifications?.length ?? 0) > 0;
    const hasProjects = (resumeData.projects?.length ?? 0) > 0;

    return (
      <div className="screen bg-gray-50 dark:bg-neutral-950 animate-page-in">
        {/* Header */}
        <div
          className="flex items-center gap-3 px-5 pb-3 border-b border-gray-100 dark:border-neutral-800 flex-shrink-0 bg-white dark:bg-neutral-900"
          style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
        >
          <button
            onClick={() => setDone(false)}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">Resume Ready</p>
            <p className="text-xs text-gray-400 dark:text-neutral-500">Review and build</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5" style={{ paddingBottom: "max(5rem, calc(env(safe-area-inset-bottom) + 4rem))" }}>

          {/* Stats banner */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              { label: "Roles", value: expCount || "—" },
              { label: "Skills", value: skillCount || "—" },
              { label: "Extras", value: (hasCerts ? 1 : 0) + (hasProjects ? 1 : 0) || "—" },
            ].map((s) => (
              <div key={s.label} className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl p-3 text-center">
                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{s.value}</p>
                <p className="text-xs text-gray-400 dark:text-neutral-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Contact card */}
          <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl p-4 mb-3">
            <p className="text-xs font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest mb-3">Contact Info</p>
            <p className="font-bold text-gray-900 dark:text-white text-base mb-1">{resumeData.name || "—"}</p>
            <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-2">{resumeData.desiredRole || "—"}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {resumeData.location && (
                <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-neutral-400">
                  <MapPin className="w-3 h-3" /> {resumeData.location}
                </span>
              )}
              {resumeData.phone && (
                <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-neutral-400">
                  <Phone className="w-3 h-3" /> {resumeData.phone}
                </span>
              )}
              {resumeData.linkedin && (
                <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-neutral-400">
                  <Linkedin className="w-3 h-3" /> LinkedIn
                </span>
              )}
              {resumeData.website && (
                <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-neutral-400">
                  <Globe className="w-3 h-3" /> Portfolio
                </span>
              )}
            </div>
          </div>

          {/* Professional summary */}
          {resumeData.summary && (
            <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-4 mb-3">
              <p className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-2">Professional Summary</p>
              <p className="text-sm text-gray-700 dark:text-neutral-300 leading-relaxed">{resumeData.summary}</p>
            </div>
          )}

          {/* Experience preview with bullets */}
          {expCount > 0 && (
            <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl p-4 mb-3">
              <p className="text-xs font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest mb-3">Work Experience</p>
              <div className="space-y-4">
                {resumeData.experience?.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{exp.title}</p>
                        <p className="text-xs text-gray-500 dark:text-neutral-400">{exp.company} · {exp.current ? "Present" : exp.endDate?.slice(0, 4)}</p>
                      </div>
                      <span className="text-xs text-gray-300 dark:text-neutral-600 whitespace-nowrap">{exp.startDate?.slice(0, 4)}</span>
                    </div>
                    {exp.bullets && exp.bullets.length > 0 && (
                      <ul className="space-y-1">
                        {exp.bullets.map((bullet, bi) => (
                          <li key={bi} className="flex items-start gap-2 text-xs text-gray-600 dark:text-neutral-400">
                            <span className="text-indigo-400 mt-0.5 flex-shrink-0">•</span>
                            <span className="leading-relaxed">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills tags */}
          {skillCount > 0 && (
            <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl p-4 mb-3">
              <p className="text-xs font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest mb-3">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {resumeData.skills?.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {(resumeData.education?.length ?? 0) > 0 && (
            <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl p-4 mb-3">
              <p className="text-xs font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest mb-3">Education</p>
              {resumeData.education?.map((edu) => (
                <div key={edu.id}>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{edu.institution}</p>
                  <p className="text-xs text-gray-500 dark:text-neutral-400">{edu.degree} in {edu.field} · {edu.endDate?.slice(0, 4)}</p>
                  {edu.gpa && <p className="text-xs text-gray-400 dark:text-neutral-500 mt-0.5">GPA: {edu.gpa}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Certifications */}
          {hasCerts && (
            <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl p-4 mb-3">
              <p className="text-xs font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest mb-3">Certifications</p>
              {resumeData.certifications?.map((cert) => (
                <div key={cert.id} className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{cert.name}</p>
                    <p className="text-xs text-gray-400 dark:text-neutral-500">{cert.issuer} · {cert.date?.slice(0, 4)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Volunteer Work */}
          {(resumeData.volunteerWork?.length ?? 0) > 0 && (
            <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl p-4 mb-3">
              <p className="text-xs font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest mb-3">Volunteer Work</p>
              {resumeData.volunteerWork?.map((v) => (
                <div key={v.id} className="mb-2 last:mb-0">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{v.role}</p>
                  <p className="text-xs text-gray-500 dark:text-neutral-400">{v.organization} · {v.current ? "Present" : v.endDate?.slice(0, 4)}</p>
                  {v.description && <p className="text-xs text-gray-400 dark:text-neutral-500 mt-0.5 leading-relaxed">{v.description}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Extracurriculars */}
          {(resumeData.extracurriculars?.length ?? 0) > 0 && (
            <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl p-4 mb-3">
              <p className="text-xs font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest mb-3">Activities & Organizations</p>
              <ul className="space-y-1">
                {resumeData.extracurriculars?.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-neutral-300">
                    <span className="text-indigo-400 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Relevant Coursework */}
          {(resumeData.relevantCoursework?.length ?? 0) > 0 && (
            <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl p-4 mb-3">
              <p className="text-xs font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest mb-3">Relevant Coursework</p>
              <div className="flex flex-wrap gap-1.5">
                {resumeData.relevantCoursework?.map((course) => (
                  <span key={course} className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium rounded-full">
                    {course}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Template picker */}
          <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl p-4 mb-5">
            <p className="text-xs font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest mb-3">Choose a Template</p>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {TEMPLATE_OPTIONS.filter((t) => t.tier === "free" || isPro).map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => setSelectedTemplate(tmpl.id)}
                  className={`flex-shrink-0 flex flex-col items-center gap-1.5 transition-all ${
                    selectedTemplate === tmpl.id ? "opacity-100" : "opacity-50"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all ${
                      selectedTemplate === tmpl.id
                        ? "border-indigo-500 scale-110"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: tmpl.color + "22" }}
                  >
                    {selectedTemplate === tmpl.id ? (
                      <Check className="w-5 h-5" style={{ color: tmpl.color }} />
                    ) : (
                      <div className="w-5 h-5 rounded-md" style={{ backgroundColor: tmpl.color }} />
                    )}
                  </div>
                  <span className="text-[10px] font-medium text-gray-500 dark:text-neutral-400">{tmpl.label}</span>
                </button>
              ))}
              {!isPro && (
                <button
                  onClick={() => router.push("/upgrade")}
                  className="flex-shrink-0 flex flex-col items-center gap-1.5 opacity-60"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-50 dark:bg-amber-900/20 border-2 border-dashed border-amber-300 dark:border-amber-700">
                    <span className="text-amber-500 text-xs font-bold">+6</span>
                  </div>
                  <span className="text-[10px] font-medium text-amber-500">Pro</span>
                </button>
              )}
            </div>
          </div>

          {/* CTA */}
          {isPro ? (
            <button
              onClick={handleGenerate}
              disabled={saving}
              className="w-full py-4 gradient-brand text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-indigo-900/30 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {saving ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Generating…</>
              ) : (
                <><Sparkles className="w-5 h-5" /> Generate my professional resume</>
              )}
            </button>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleGenerate}
                disabled={saving}
                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-60"
              >
                {saving ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Saving…</>
                ) : (
                  <><ArrowRight className="w-5 h-5" /> Build my resume</>
                )}
              </button>
              <div className="rounded-2xl p-4" style={{ background: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)" }}>
                <p className="text-white font-bold text-sm mb-1">Want Alex to write it for you?</p>
                <p className="text-white/80 text-xs mb-3">Pro AI rewrites every bullet for maximum impact. One-time $15, forever.</p>
                <button
                  onClick={() => router.push("/upgrade")}
                  className="w-full py-2.5 bg-white text-amber-600 text-sm font-bold rounded-xl active:scale-[0.98] transition-all"
                >
                  Get Lifetime Pro — $15
                </button>
              </div>
            </div>
          )}
        </div>

        <BottomNav />
      </div>
    );
  }

  // ── Chat screen ─────────────────────────────────────────
  const progress = detectProgress(messages);
  const progressCount = PROGRESS_STEPS.filter((s) => progress.has(s.key)).length;

  return (
    <div className="screen bg-white dark:bg-neutral-950">
      {/* Header */}
      <div
        className="flex-shrink-0"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        {/* Alex bar */}
        <div className="flex items-center gap-3 px-5 pt-3 pb-2.5 border-b border-gray-100 dark:border-neutral-800">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">Alex</p>
            <p className="text-xs text-gray-400 dark:text-neutral-500">AI Resume Coach</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-gray-400 dark:text-neutral-500">Online</span>
          </div>
        </div>

        {/* Progress bar */}
        {messages.length > 0 && (
          <div className="px-5 py-2 bg-gray-50 dark:bg-neutral-900 border-b border-gray-100 dark:border-neutral-800">
            <div className="flex items-center gap-1 mb-1.5">
              {PROGRESS_STEPS.map((step) => {
                const done = progress.has(step.key);
                return (
                  <div
                    key={step.key}
                    className={`flex-1 h-1 rounded-full transition-all duration-500 ${
                      done
                        ? "bg-indigo-500"
                        : "bg-gray-200 dark:bg-neutral-700"
                    }`}
                  />
                );
              })}
            </div>
            <p className="text-[10px] text-gray-400 dark:text-neutral-500">
              {progressCount === 0
                ? "Getting started…"
                : progressCount < PROGRESS_STEPS.length
                ? `${progressCount} of ${PROGRESS_STEPS.length} sections covered`
                : "Almost done — Alex is wrapping up!"}
            </p>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, i) => (
          <ChatBubble key={i} message={msg} isNew={i === messages.length - 1} />
        ))}

        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pt-3 border-t border-gray-100 dark:border-neutral-800 flex-shrink-0"
        style={{ paddingBottom: "max(1.5rem, calc(env(safe-area-inset-bottom) + 0.5rem))" }}
      >
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer…"
            rows={1}
            disabled={loading || done}
            className="flex-1 resize-none input-field py-3 max-h-28 leading-relaxed"
            style={{ fieldSizing: "content" } as React.CSSProperties}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="w-11 h-11 rounded-xl gradient-brand flex items-center justify-center flex-shrink-0 disabled:opacity-40 active:scale-95 transition-all shadow-md shadow-indigo-100 dark:shadow-indigo-900/30"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-300 dark:text-neutral-700 mt-2">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

// ── Chat bubble ──────────────────────────────────────────
function ChatBubble({ message, isNew }: { message: Message; isNew?: boolean }) {
  const isAI = message.role === "assistant";
  // Split message into paragraphs for better readability
  const paragraphs = message.content.split(/\n+/).filter(Boolean);

  return (
    <div
      className={`flex items-end gap-2 ${isAI ? "justify-start" : "justify-end"} ${
        isNew ? "animate-slide-in-up" : ""
      }`}
    >
      {isAI && (
        <div className="w-7 h-7 rounded-xl gradient-brand flex items-center justify-center flex-shrink-0 mb-0.5 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div
        className={`max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed space-y-1.5 ${
          isAI
            ? "bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white rounded-bl-md"
            : "gradient-brand text-white rounded-br-md shadow-sm"
        }`}
      >
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      {!isAI && (
        <div className="w-7 h-7 rounded-xl bg-gray-200 dark:bg-neutral-700 flex items-center justify-center flex-shrink-0 mb-0.5">
          <User className="w-3.5 h-3.5 text-gray-500 dark:text-neutral-400" />
        </div>
      )}
    </div>
  );
}

// ── Typing indicator ─────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 animate-fade-in">
      <div className="w-7 h-7 rounded-xl gradient-brand flex items-center justify-center flex-shrink-0 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="bg-gray-100 dark:bg-neutral-800 px-4 py-3 rounded-2xl rounded-bl-md">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-neutral-500 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────
function buildRawText(d: Partial<ResumeData>): string {
  return [
    `${d.name} | ${d.email} | ${d.phone} | ${d.location}`,
    `TARGET ROLE: ${d.desiredRole} | INDUSTRY: ${d.industry || "—"}`,
    d.linkedin ? `LinkedIn: ${d.linkedin}` : null,
    d.website ? `Portfolio: ${d.website}` : null,
    d.summary ? `\nSUMMARY:\n${d.summary}` : null,
    d.experience?.length
      ? `\nEXPERIENCE:\n${d.experience.map((e) =>
          `${e.title} @ ${e.company} (${e.startDate} – ${e.current ? "Present" : e.endDate})\n${e.bullets?.map((b) => `• ${b}`).join("\n")}`
        ).join("\n\n")}`
      : null,
    d.education?.length
      ? `\nEDUCATION:\n${d.education.map((e) => `${e.degree} in ${e.field}, ${e.institution} (${e.endDate?.slice(0, 4)})`).join("\n")}`
      : null,
    d.skills?.length ? `\nSKILLS: ${d.skills.join(", ")}` : null,
    d.certifications?.length
      ? `\nCERTIFICATIONS: ${d.certifications.map((c) => `${c.name} (${c.issuer})`).join(", ")}`
      : null,
    d.projects?.length
      ? `\nPROJECTS:\n${d.projects.map((p) => `${p.name}: ${p.description}`).join("\n")}`
      : null,
    d.volunteerWork?.length
      ? `\nVOLUNTEER WORK:\n${d.volunteerWork.map((v) => `${v.role} @ ${v.organization}: ${v.description}`).join("\n")}`
      : null,
    d.extracurriculars?.length
      ? `\nACTIVITIES: ${d.extracurriculars.join(", ")}`
      : null,
    d.relevantCoursework?.length
      ? `\nRELEVANT COURSEWORK: ${d.relevantCoursework.join(", ")}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");
}
