import type { ResumeData } from "@/types";
import { formatDate } from "@/lib/utils";

export function TechTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="bg-white text-gray-900" style={{ fontFamily: "ui-monospace, monospace" }}>
      {/* Header */}
      <div className="bg-gray-900 text-white px-8 py-6">
        <h1 className="text-2xl font-bold tracking-tight">{data.name || "Your Name"}</h1>
        {data.desiredRole && (
          <p className="text-blue-400 text-sm mt-0.5">{data.desiredRole}</p>
        )}
        <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-400">
          {[data.email, data.phone, data.location, data.linkedin, data.website].filter(Boolean).map((v, i) => (
            <span key={i}>{v}</span>
          ))}
        </div>
      </div>

      <div className="px-8 py-6 space-y-5">
        {/* Skills first for tech */}
        {data.skills.length > 0 && (
          <Section title="// Technical Skills">
            <div className="flex flex-wrap gap-1.5">
              {data.skills.map((s, i) => (
                <span key={i} className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded font-mono">
                  {s}
                </span>
              ))}
            </div>
          </Section>
        )}

        {data.summary && (
          <Section title="// About">
            <p className="text-sm text-gray-700 leading-relaxed">{data.summary}</p>
          </Section>
        )}

        {data.experience.length > 0 && (
          <Section title="// Experience">
            {data.experience.map((exp) => (
              <div key={exp.id} className="mb-5 pl-3 border-l-2 border-blue-200">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <span className="text-sm font-bold text-gray-900">{exp.title}</span>
                    <span className="text-blue-500 text-sm"> @ {exp.company}</span>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0 ml-4">
                    {formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate)}
                  </span>
                </div>
                <ul className="space-y-1.5 mt-2">
                  {exp.bullets.map((b, i) => (
                    <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                      <span className="text-blue-400 flex-shrink-0">›</span>{b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </Section>
        )}

        {data.projects.length > 0 && (
          <Section title="// Projects">
            {data.projects.map((p) => (
              <div key={p.id} className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-sm font-bold text-gray-900">{p.name}</p>
                <p className="text-xs text-gray-600 mt-0.5">{p.description}</p>
                {p.technologies.length > 0 && (
                  <p className="text-xs text-blue-500 mt-1 font-mono">[{p.technologies.join(", ")}]</p>
                )}
              </div>
            ))}
          </Section>
        )}

        {data.education.length > 0 && (
          <Section title="// Education">
            {data.education.map((edu) => (
              <div key={edu.id} className="mb-2">
                <span className="text-sm font-bold text-gray-900">{edu.degree} in {edu.field}</span>
                <span className="text-xs text-gray-500"> · {edu.institution} · {formatDate(edu.endDate)}</span>
              </div>
            ))}
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xs font-bold text-blue-500 mb-2.5">{title}</h2>
      {children}
    </div>
  );
}
