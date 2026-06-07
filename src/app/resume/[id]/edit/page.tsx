"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, Save, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import type { ResumeData, WorkExperience, Education, Project, Certification } from "@/types";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";

const EMPTY_DATA: ResumeData = {
  name: "", email: "", phone: "", location: "", linkedin: "", website: "",
  summary: "", desiredRole: "", industry: "", jobDescription: "",
  jobType: "", volunteerWork: [], extracurriculars: [], relevantCoursework: [],
  experience: [], education: [], skills: [], projects: [], certifications: [],
};

export default function EditResumePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<ResumeData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("contact");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: resume } = await supabase
        .from("resumes")
        .select("resume_data, raw_text")
        .eq("id", id)
        .single();

      if (resume?.resume_data) {
        setData(resume.resume_data as ResumeData);
      } else if (resume?.raw_text) {
        // Auto-extract from raw text
        try {
          const res = await fetch("/api/extract", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: resume.raw_text }),
          });
          if (res.ok) {
            const { data: extracted } = await res.json() as { data: Partial<ResumeData> };
            setData({ ...EMPTY_DATA, ...extracted });
          }
        } catch {}
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const save = async () => {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("resumes")
      .update({ resume_data: data, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      toast.error("Failed to save");
    } else {
      toast.success("Saved!");
    }
    setSaving(false);
  };

  const update = (field: keyof ResumeData, value: unknown) =>
    setData((d) => ({ ...d, [field]: value }));

  const addExp = () =>
    update("experience", [
      ...data.experience,
      { id: uuidv4(), company: "", title: "", location: "", startDate: "", endDate: "", current: false, bullets: [""] },
    ]);

  const updateExp = (idx: number, field: keyof WorkExperience, value: unknown) => {
    const exp = [...data.experience];
    exp[idx] = { ...exp[idx], [field]: value };
    update("experience", exp);
  };

  const removeExp = (idx: number) =>
    update("experience", data.experience.filter((_, i) => i !== idx));

  const addEdu = () =>
    update("education", [
      ...data.education,
      { id: uuidv4(), institution: "", degree: "", field: "", startDate: "", endDate: "", gpa: "" },
    ]);

  const updateEdu = (idx: number, field: keyof Education, value: unknown) => {
    const edu = [...data.education];
    edu[idx] = { ...edu[idx], [field]: value };
    update("education", edu);
  };

  const removeEdu = (idx: number) =>
    update("education", data.education.filter((_, i) => i !== idx));

  const addProject = () =>
    update("projects", [
      ...data.projects,
      { id: uuidv4(), name: "", description: "", technologies: [], url: "" },
    ]);

  const updateProject = (idx: number, field: keyof Project, value: unknown) => {
    const p = [...data.projects];
    p[idx] = { ...p[idx], [field]: value };
    update("projects", p);
  };

  const removeProject = (idx: number) =>
    update("projects", data.projects.filter((_, i) => i !== idx));

  const addCert = () =>
    update("certifications", [
      ...data.certifications,
      { id: uuidv4(), name: "", issuer: "", date: "", url: "" },
    ]);

  const updateCert = (idx: number, field: keyof Certification, value: unknown) => {
    const c = [...data.certifications];
    c[idx] = { ...c[idx], [field]: value };
    update("certifications", c);
  };

  const SECTIONS = [
    { id: "contact", label: "Contact" },
    { id: "summary", label: "Summary" },
    { id: "experience", label: "Experience" },
    { id: "education", label: "Education" },
    { id: "skills", label: "Skills" },
    { id: "projects", label: "Projects" },
    { id: "certifications", label: "Certifications" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push(`/resume/${id}`)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <Button onClick={save} loading={saving} icon={<Save className="w-4 h-4" />}>
          Save Changes
        </Button>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 flex-wrap mb-6">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeSection === s.id
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="card p-6 space-y-4">
        {activeSection === "contact" && (
          <ContactSection data={data} update={update} />
        )}
        {activeSection === "summary" && (
          <SummarySection data={data} update={update} />
        )}
        {activeSection === "experience" && (
          <ExperienceSection
            experience={data.experience}
            onAdd={addExp}
            onUpdate={updateExp}
            onRemove={removeExp}
          />
        )}
        {activeSection === "education" && (
          <EducationSection
            education={data.education}
            onAdd={addEdu}
            onUpdate={updateEdu}
            onRemove={removeEdu}
          />
        )}
        {activeSection === "skills" && (
          <SkillsSection skills={data.skills} update={update} />
        )}
        {activeSection === "projects" && (
          <ProjectsSection
            projects={data.projects}
            onAdd={addProject}
            onUpdate={updateProject}
            onRemove={removeProject}
          />
        )}
        {activeSection === "certifications" && (
          <CertificationsSection
            certifications={data.certifications}
            onAdd={addCert}
            onUpdate={updateCert}
          />
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

function ContactSection({ data, update }: { data: ResumeData; update: (f: keyof ResumeData, v: unknown) => void }) {
  return (
    <>
      <h2 className="font-semibold text-gray-900">Contact Information</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Full name">
          <input className="input-field" value={data.name} onChange={(e) => update("name", e.target.value)} placeholder="Jane Smith" />
        </Field>
        <Field label="Email">
          <input className="input-field" value={data.email} onChange={(e) => update("email", e.target.value)} placeholder="jane@example.com" />
        </Field>
        <Field label="Phone">
          <input className="input-field" value={data.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+1 (555) 000-0000" />
        </Field>
        <Field label="Location">
          <input className="input-field" value={data.location} onChange={(e) => update("location", e.target.value)} placeholder="New York, NY" />
        </Field>
        <Field label="LinkedIn">
          <input className="input-field" value={data.linkedin} onChange={(e) => update("linkedin", e.target.value)} placeholder="linkedin.com/in/janesmith" />
        </Field>
        <Field label="Website / Portfolio">
          <input className="input-field" value={data.website} onChange={(e) => update("website", e.target.value)} placeholder="janesmith.dev" />
        </Field>
        <Field label="Desired Role">
          <input className="input-field" value={data.desiredRole} onChange={(e) => update("desiredRole", e.target.value)} placeholder="Senior Software Engineer" />
        </Field>
      </div>
      <Field label="Target Job Description (optional — helps AI tailor your resume)">
        <textarea className="input-field resize-none" rows={5} value={data.jobDescription} onChange={(e) => update("jobDescription", e.target.value)} placeholder="Paste the job description you're applying for…" />
      </Field>
    </>
  );
}

function SummarySection({ data, update }: { data: ResumeData; update: (f: keyof ResumeData, v: unknown) => void }) {
  return (
    <>
      <h2 className="font-semibold text-gray-900">Professional Summary</h2>
      <textarea
        className="input-field resize-none"
        rows={6}
        value={data.summary}
        onChange={(e) => update("summary", e.target.value)}
        placeholder="Results-driven software engineer with 5+ years of experience…"
      />
      <p className="text-xs text-gray-400">3–5 sentences. The AI will improve this when you run a rewrite.</p>
    </>
  );
}

function ExperienceSection({ experience, onAdd, onUpdate, onRemove }: {
  experience: WorkExperience[];
  onAdd: () => void;
  onUpdate: (idx: number, f: keyof WorkExperience, v: unknown) => void;
  onRemove: (idx: number) => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Work Experience</h2>
        <Button variant="secondary" size="sm" onClick={onAdd} icon={<Plus className="w-4 h-4" />}>Add</Button>
      </div>
      {experience.map((exp, idx) => (
        <div key={exp.id} className="border border-gray-100 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-gray-700">Role {idx + 1}</p>
            <button onClick={() => onRemove(idx)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Job title">
              <input className="input-field" value={exp.title} onChange={(e) => onUpdate(idx, "title", e.target.value)} placeholder="Software Engineer" />
            </Field>
            <Field label="Company">
              <input className="input-field" value={exp.company} onChange={(e) => onUpdate(idx, "company", e.target.value)} placeholder="Acme Corp" />
            </Field>
            <Field label="Location">
              <input className="input-field" value={exp.location} onChange={(e) => onUpdate(idx, "location", e.target.value)} placeholder="San Francisco, CA" />
            </Field>
            <Field label="Start date">
              <input className="input-field" value={exp.startDate} onChange={(e) => onUpdate(idx, "startDate", e.target.value)} placeholder="2022-01" />
            </Field>
            <Field label="End date">
              <input className="input-field" value={exp.endDate} onChange={(e) => onUpdate(idx, "endDate", e.target.value)} placeholder="2024-06" disabled={exp.current} />
            </Field>
            <div className="flex items-center gap-2 pt-5">
              <input type="checkbox" id={`current-${idx}`} checked={exp.current} onChange={(e) => onUpdate(idx, "current", e.target.checked)} className="rounded text-indigo-600" />
              <label htmlFor={`current-${idx}`} className="text-sm text-gray-700">Current role</label>
            </div>
          </div>
          <Field label="Bullet points (one per line)">
            <textarea
              className="input-field resize-none font-mono text-xs"
              rows={5}
              value={exp.bullets.join("\n")}
              onChange={(e) => onUpdate(idx, "bullets", e.target.value.split("\n").filter(Boolean))}
              placeholder="Led team of 5 engineers to deliver product feature…&#10;Reduced API latency by 40% through caching…"
            />
          </Field>
        </div>
      ))}
      {experience.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">No experience added yet. Click Add to get started.</p>
      )}
    </>
  );
}

function EducationSection({ education, onAdd, onUpdate, onRemove }: {
  education: Education[];
  onAdd: () => void;
  onUpdate: (idx: number, f: keyof Education, v: unknown) => void;
  onRemove: (idx: number) => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Education</h2>
        <Button variant="secondary" size="sm" onClick={onAdd} icon={<Plus className="w-4 h-4" />}>Add</Button>
      </div>
      {education.map((edu, idx) => (
        <div key={edu.id} className="border border-gray-100 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-gray-700">Education {idx + 1}</p>
            <button onClick={() => onRemove(idx)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Institution">
              <input className="input-field" value={edu.institution} onChange={(e) => onUpdate(idx, "institution", e.target.value)} placeholder="University of California" />
            </Field>
            <Field label="Degree">
              <input className="input-field" value={edu.degree} onChange={(e) => onUpdate(idx, "degree", e.target.value)} placeholder="Bachelor of Science" />
            </Field>
            <Field label="Field of study">
              <input className="input-field" value={edu.field} onChange={(e) => onUpdate(idx, "field", e.target.value)} placeholder="Computer Science" />
            </Field>
            <Field label="GPA">
              <input className="input-field" value={edu.gpa} onChange={(e) => onUpdate(idx, "gpa", e.target.value)} placeholder="3.8" />
            </Field>
            <Field label="Start date">
              <input className="input-field" value={edu.startDate} onChange={(e) => onUpdate(idx, "startDate", e.target.value)} placeholder="2018-09" />
            </Field>
            <Field label="End date">
              <input className="input-field" value={edu.endDate} onChange={(e) => onUpdate(idx, "endDate", e.target.value)} placeholder="2022-05" />
            </Field>
          </div>
        </div>
      ))}
    </>
  );
}

function SkillsSection({ skills, update }: { skills: string[]; update: (f: keyof ResumeData, v: unknown) => void }) {
  return (
    <>
      <h2 className="font-semibold text-gray-900">Skills</h2>
      <textarea
        className="input-field resize-none"
        rows={5}
        value={skills.join(", ")}
        onChange={(e) => update("skills", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
        placeholder="JavaScript, React, Node.js, Python, AWS, PostgreSQL…"
      />
      <p className="text-xs text-gray-400">Separate each skill with a comma.</p>
    </>
  );
}

function ProjectsSection({ projects, onAdd, onUpdate, onRemove }: {
  projects: Project[];
  onAdd: () => void;
  onUpdate: (idx: number, f: keyof Project, v: unknown) => void;
  onRemove: (idx: number) => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Projects</h2>
        <Button variant="secondary" size="sm" onClick={onAdd} icon={<Plus className="w-4 h-4" />}>Add</Button>
      </div>
      {projects.map((p, idx) => (
        <div key={p.id} className="border border-gray-100 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-gray-700">Project {idx + 1}</p>
            <button onClick={() => onRemove(idx)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Project name">
              <input className="input-field" value={p.name} onChange={(e) => onUpdate(idx, "name", e.target.value)} placeholder="My Awesome App" />
            </Field>
            <Field label="URL">
              <input className="input-field" value={p.url} onChange={(e) => onUpdate(idx, "url", e.target.value)} placeholder="github.com/you/project" />
            </Field>
          </div>
          <Field label="Description">
            <textarea className="input-field resize-none" rows={2} value={p.description} onChange={(e) => onUpdate(idx, "description", e.target.value)} placeholder="Built a real-time data pipeline…" />
          </Field>
          <Field label="Technologies (comma-separated)">
            <input className="input-field" value={p.technologies.join(", ")} onChange={(e) => onUpdate(idx, "technologies", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} placeholder="React, TypeScript, AWS" />
          </Field>
        </div>
      ))}
    </>
  );
}

function CertificationsSection({ certifications, onAdd, onUpdate }: {
  certifications: Certification[];
  onAdd: () => void;
  onUpdate: (idx: number, f: keyof Certification, v: unknown) => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Certifications</h2>
        <Button variant="secondary" size="sm" onClick={onAdd} icon={<Plus className="w-4 h-4" />}>Add</Button>
      </div>
      {certifications.map((c, idx) => (
        <div key={c.id} className="grid sm:grid-cols-2 gap-3 border border-gray-100 rounded-xl p-4">
          <Field label="Certification name">
            <input className="input-field" value={c.name} onChange={(e) => onUpdate(idx, "name", e.target.value)} placeholder="AWS Solutions Architect" />
          </Field>
          <Field label="Issuer">
            <input className="input-field" value={c.issuer} onChange={(e) => onUpdate(idx, "issuer", e.target.value)} placeholder="Amazon Web Services" />
          </Field>
          <Field label="Date">
            <input className="input-field" value={c.date} onChange={(e) => onUpdate(idx, "date", e.target.value)} placeholder="2023-06" />
          </Field>
          <Field label="URL">
            <input className="input-field" value={c.url} onChange={(e) => onUpdate(idx, "url", e.target.value)} placeholder="credly.com/badge/…" />
          </Field>
        </div>
      ))}
    </>
  );
}
