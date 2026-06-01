import type { ResumeData } from "@/types";
import { formatDate } from "@/lib/utils";

export function StudentTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="bg-white text-gray-900 px-8 py-7" style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div className="flex items-start justify-between border-b-4 border-emerald-500 pb-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{data.name || "Your Name"}</h1>
          {data.desiredRole && <p className="text-emerald-600 font-medium text-sm mt-0.5">{data.desiredRole}</p>}
        </div>
        <div className="text-right text-xs text-gray-500 space-y-0.5">
          {data.email && <p>{data.email}</p>}
          {data.phone && <p>{data.phone}</p>}
          {data.location && <p>{data.location}</p>}
        </div>
      </div>

      {data.education.length > 0 && (
        <Section title="Education" accentColor="bg-emerald-500">
          {data.education.map((edu) => (
            <div key={edu.id} className="mb-3 flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-gray-900">{edu.degree} in {edu.field}</p>
                <p className="text-sm text-emerald-600">{edu.institution}</p>
                {edu.gpa && <p className="text-xs text-gray-500">GPA: {edu.gpa}</p>}
              </div>
              <p className="text-xs text-gray-400 flex-shrink-0 ml-4">
                {formatDate(edu.startDate)} – {formatDate(edu.endDate)}
              </p>
            </div>
          ))}
        </Section>
      )}

      {data.summary && (
        <Section title="Objective" accentColor="bg-emerald-500">
          <p className="text-sm text-gray-700 leading-relaxed">{data.summary}</p>
        </Section>
      )}

      {data.experience.length > 0 && (
        <Section title="Experience" accentColor="bg-emerald-500">
          {data.experience.map((exp) => (
            <div key={exp.id} className="mb-4">
              <div className="flex justify-between">
                <p className="text-sm font-bold text-gray-900">{exp.title}</p>
                <p className="text-xs text-gray-400">
                  {formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate)}
                </p>
              </div>
              <p className="text-xs text-emerald-600 font-medium">{exp.company} · {exp.location}</p>
              <ul className="mt-1.5 space-y-1">
                {exp.bullets.map((b, i) => (
                  <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                    <span className="text-emerald-400 flex-shrink-0 mt-0.5">✓</span>{b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Section>
      )}

      {data.projects.length > 0 && (
        <Section title="Projects" accentColor="bg-emerald-500">
          {data.projects.map((p) => (
            <div key={p.id} className="mb-3">
              <p className="text-sm font-bold text-gray-900">{p.name}</p>
              <p className="text-xs text-gray-600">{p.description}</p>
              {p.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {p.technologies.map((t, i) => (
                    <span key={i} className="text-xs px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </Section>
      )}

      {data.skills.length > 0 && (
        <Section title="Skills" accentColor="bg-emerald-500">
          <div className="flex flex-wrap gap-1.5">
            {data.skills.map((s, i) => (
              <span key={i} className="text-xs px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full">
                {s}
              </span>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  accentColor,
  children,
}: {
  title: string;
  accentColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-1 h-5 rounded-full ${accentColor}`} />
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">{title}</h2>
      </div>
      {children}
    </div>
  );
}
