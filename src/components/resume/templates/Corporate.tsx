import type { ResumeData } from "@/types";
import { formatDate } from "@/lib/utils";

export function CorporateTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="bg-white text-gray-900" style={{ fontFamily: "Arial, sans-serif" }}>
      {/* Navy header bar */}
      <div style={{ backgroundColor: "#1e3a5f" }} className="px-8 py-6">
        <h1 className="text-2xl font-bold text-white tracking-wide">{data.name || "Your Name"}</h1>
        {data.desiredRole && (
          <p style={{ color: "#93c5fd" }} className="text-sm mt-1 font-medium">{data.desiredRole}</p>
        )}
      </div>
      {/* Accent line */}
      <div style={{ backgroundColor: "#f59e0b", height: "4px" }} />

      {/* Contact bar */}
      <div style={{ backgroundColor: "#f1f5f9" }} className="px-8 py-2.5 flex flex-wrap gap-5 text-xs text-gray-600 border-b border-gray-200">
        {data.email && <span>{data.email}</span>}
        {data.phone && <span>| {data.phone}</span>}
        {data.location && <span>| {data.location}</span>}
        {data.linkedin && <span>| {data.linkedin}</span>}
      </div>

      <div className="px-8 py-6 space-y-5">
        {data.summary && (
          <Section title="Professional Summary" color="#1e3a5f">
            <p className="text-sm text-gray-700 leading-relaxed">{data.summary}</p>
          </Section>
        )}

        {data.experience.length > 0 && (
          <Section title="Professional Experience" color="#1e3a5f">
            {data.experience.map((exp) => (
              <div key={exp.id} className="mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-sm text-gray-900">{exp.title}</p>
                    <p className="text-sm font-semibold" style={{ color: "#1e3a5f" }}>{exp.company}</p>
                    {exp.location && <p className="text-xs text-gray-500">{exp.location}</p>}
                  </div>
                  <p className="text-xs text-gray-500 font-medium whitespace-nowrap">
                    {formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate)}
                  </p>
                </div>
                <ul className="mt-2 space-y-1 ml-3">
                  {exp.bullets.map((b, i) => (
                    <li key={i} className="text-xs text-gray-700 flex gap-2">
                      <span style={{ color: "#f59e0b" }} className="font-bold flex-shrink-0">■</span> {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </Section>
        )}

        <div className="grid grid-cols-2 gap-6">
          {data.education.length > 0 && (
            <Section title="Education" color="#1e3a5f">
              {data.education.map((edu) => (
                <div key={edu.id} className="mb-2">
                  <p className="text-xs font-bold text-gray-800">{edu.degree} in {edu.field}</p>
                  <p className="text-xs text-gray-500">{edu.institution}</p>
                  <p className="text-xs text-gray-400">{formatDate(edu.endDate)}</p>
                  {edu.gpa && <p className="text-xs text-gray-400">GPA: {edu.gpa}</p>}
                </div>
              ))}
            </Section>
          )}

          {data.skills.length > 0 && (
            <Section title="Core Competencies" color="#1e3a5f">
              <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                {data.skills.map((s, i) => (
                  <p key={i} className="text-xs text-gray-700 flex items-center gap-1.5">
                    <span style={{ color: "#f59e0b" }}>▶</span> {s}
                  </p>
                ))}
              </div>
            </Section>
          )}
        </div>

        {data.certifications.length > 0 && (
          <Section title="Certifications" color="#1e3a5f">
            <div className="grid grid-cols-2 gap-2">
              {data.certifications.map((cert) => (
                <div key={cert.id}>
                  <p className="text-xs font-bold text-gray-800">{cert.name}</p>
                  <p className="text-xs text-gray-500">{cert.issuer} · {formatDate(cert.date)}</p>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-xs font-black uppercase tracking-widest" style={{ color }}>{title}</h2>
        <div className="flex-1 h-px" style={{ backgroundColor: color, opacity: 0.3 }} />
      </div>
      {children}
    </div>
  );
}
