import type { ResumeData } from "@/types";
import { formatDate } from "@/lib/utils";

export function ExecutiveTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="bg-white text-gray-900 px-10 py-8" style={{ fontFamily: "Georgia, serif" }}>
      {/* Header */}
      <div className="text-center border-b-2 border-gray-900 pb-5 mb-6">
        <h1 className="text-4xl font-bold tracking-tight uppercase text-gray-900 mb-2">
          {data.name || "Your Name"}
        </h1>
        {data.desiredRole && (
          <p className="text-sm font-medium text-gray-600 tracking-widest uppercase mb-3">
            {data.desiredRole}
          </p>
        )}
        <div className="flex items-center justify-center flex-wrap gap-4 text-xs text-gray-600">
          {[data.email, data.phone, data.location, data.linkedin].filter(Boolean).map((v, i) => (
            <span key={i}>{v}</span>
          ))}
        </div>
      </div>

      {data.summary && (
        <Section title="Executive Summary">
          <p className="text-sm text-gray-700 leading-relaxed text-center italic">{data.summary}</p>
        </Section>
      )}

      {data.experience.length > 0 && (
        <Section title="Professional Experience">
          {data.experience.map((exp) => (
            <div key={exp.id} className="mb-5">
              <div className="flex justify-between items-baseline mb-1">
                <div>
                  <span className="font-bold text-sm text-gray-900">{exp.title}</span>
                  <span className="text-gray-500 text-sm"> · {exp.company}</span>
                  {exp.location && <span className="text-gray-400 text-xs"> · {exp.location}</span>}
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0 ml-4">
                  {formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate)}
                </span>
              </div>
              <ul className="space-y-1 mt-1.5">
                {exp.bullets.map((b, i) => (
                  <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                    <span className="flex-shrink-0 mt-1">•</span>{b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Section>
      )}

      <div className="grid grid-cols-2 gap-8">
        {data.education.length > 0 && (
          <Section title="Education">
            {data.education.map((edu) => (
              <div key={edu.id} className="mb-3">
                <p className="text-sm font-bold text-gray-900">{edu.degree} in {edu.field}</p>
                <p className="text-xs text-gray-600">{edu.institution} · {formatDate(edu.endDate)}</p>
              </div>
            ))}
          </Section>
        )}
        {data.skills.length > 0 && (
          <Section title="Core Competencies">
            <div className="flex flex-wrap gap-1.5">
              {data.skills.map((s, i) => (
                <span key={i} className="text-xs border border-gray-300 px-2 py-0.5 rounded text-gray-700">
                  {s}
                </span>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="text-xs font-bold uppercase tracking-widest text-gray-900 border-b border-gray-300 pb-1 mb-3">
        {title}
      </h2>
      {children}
    </div>
  );
}
