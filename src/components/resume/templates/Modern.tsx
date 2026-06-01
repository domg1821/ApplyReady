import type { ResumeData } from "@/types";
import { formatDate } from "@/lib/utils";
import { Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react";

export function ModernTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="bg-white text-gray-900 font-sans" style={{ fontFamily: "Georgia, serif" }}>
      {/* Header */}
      <div className="bg-indigo-700 text-white px-8 py-7">
        <h1 className="text-3xl font-bold tracking-tight mb-1">{data.name || "Your Name"}</h1>
        {data.desiredRole && (
          <p className="text-indigo-200 text-sm font-medium mb-3">{data.desiredRole}</p>
        )}
        <div className="flex flex-wrap gap-4 text-xs text-indigo-100">
          {data.email && (
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3" /> {data.email}
            </span>
          )}
          {data.phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" /> {data.phone}
            </span>
          )}
          {data.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {data.location}
            </span>
          )}
          {data.linkedin && (
            <span className="flex items-center gap-1">
              <Linkedin className="w-3 h-3" /> {data.linkedin}
            </span>
          )}
          {data.website && (
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3" /> {data.website}
            </span>
          )}
        </div>
      </div>

      <div className="flex">
        {/* Left column */}
        <div className="w-64 bg-gray-50 px-5 py-6 space-y-5 flex-shrink-0">
          {data.skills.length > 0 && (
            <Section title="Skills">
              <div className="space-y-1">
                {data.skills.map((s, i) => (
                  <div key={i} className="text-xs text-gray-700 flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-indigo-400 flex-shrink-0" />
                    {s}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {data.education.length > 0 && (
            <Section title="Education">
              {data.education.map((edu) => (
                <div key={edu.id} className="mb-3">
                  <p className="text-xs font-semibold text-gray-900">{edu.degree}</p>
                  <p className="text-xs text-gray-600">{edu.field}</p>
                  <p className="text-xs text-indigo-600 font-medium">{edu.institution}</p>
                  <p className="text-xs text-gray-400">
                    {formatDate(edu.startDate)} – {formatDate(edu.endDate)}
                  </p>
                  {edu.gpa && <p className="text-xs text-gray-500">GPA: {edu.gpa}</p>}
                </div>
              ))}
            </Section>
          )}

          {data.certifications.length > 0 && (
            <Section title="Certifications">
              {data.certifications.map((cert) => (
                <div key={cert.id} className="mb-2">
                  <p className="text-xs font-semibold text-gray-900">{cert.name}</p>
                  <p className="text-xs text-gray-500">{cert.issuer} · {formatDate(cert.date)}</p>
                </div>
              ))}
            </Section>
          )}
        </div>

        {/* Right column */}
        <div className="flex-1 px-7 py-6 space-y-5">
          {data.summary && (
            <Section title="Professional Summary">
              <p className="text-sm text-gray-700 leading-relaxed">{data.summary}</p>
            </Section>
          )}

          {data.experience.length > 0 && (
            <Section title="Experience">
              {data.experience.map((exp) => (
                <div key={exp.id} className="mb-5">
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{exp.title}</p>
                      <p className="text-sm text-indigo-600 font-medium">{exp.company}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-gray-500">{exp.location}</p>
                      <p className="text-xs text-gray-400">
                        {formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate)}
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-1 mt-2">
                    {exp.bullets.map((b, i) => (
                      <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                        <span className="text-indigo-400 mt-0.5 flex-shrink-0">▸</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </Section>
          )}

          {data.projects.length > 0 && (
            <Section title="Projects">
              {data.projects.map((p) => (
                <div key={p.id} className="mb-3">
                  <p className="text-sm font-bold text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{p.description}</p>
                  {p.technologies.length > 0 && (
                    <p className="text-xs text-indigo-600 mt-1">{p.technologies.join(" · ")}</p>
                  )}
                </div>
              ))}
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 pb-1 border-b border-gray-200">
        {title}
      </h2>
      {children}
    </div>
  );
}
