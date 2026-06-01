import type { ResumeData } from "@/types";
import { formatDate } from "@/lib/utils";

export function MinimalTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="bg-white text-gray-900 px-12 py-10" style={{ fontFamily: "system-ui, sans-serif" }}>
      <div className="mb-8">
        <h1 className="text-3xl font-light text-gray-900 tracking-tight mb-0.5">
          {data.name || "Your Name"}
        </h1>
        {data.desiredRole && (
          <p className="text-gray-500 text-sm mb-2">{data.desiredRole}</p>
        )}
        <div className="text-xs text-gray-400 space-x-3">
          {[data.email, data.phone, data.location].filter(Boolean).map((v, i) => (
            <span key={i}>{v}</span>
          ))}
        </div>
      </div>

      {data.summary && (
        <div className="mb-8">
          <p className="text-sm text-gray-600 leading-loose max-w-2xl">{data.summary}</p>
        </div>
      )}

      {data.experience.length > 0 && (
        <Section title="Experience">
          {data.experience.map((exp) => (
            <div key={exp.id} className="mb-6">
              <div className="flex justify-between mb-0.5">
                <p className="text-sm font-semibold text-gray-900">{exp.title}, {exp.company}</p>
                <p className="text-xs text-gray-400">
                  {formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate)}
                </p>
              </div>
              <ul className="mt-1.5 space-y-1">
                {exp.bullets.map((b, i) => (
                  <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                    <span className="text-gray-300 flex-shrink-0">–</span>{b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Section>
      )}

      <div className="grid grid-cols-3 gap-8">
        {data.education.length > 0 && (
          <Section title="Education">
            {data.education.map((edu) => (
              <div key={edu.id} className="mb-2">
                <p className="text-xs font-semibold text-gray-900">{edu.degree}</p>
                <p className="text-xs text-gray-500">{edu.institution}</p>
                <p className="text-xs text-gray-400">{formatDate(edu.endDate)}</p>
              </div>
            ))}
          </Section>
        )}
        {data.skills.length > 0 && (
          <Section title="Skills">
            <p className="text-xs text-gray-600 leading-loose">{data.skills.join(" · ")}</p>
          </Section>
        )}
        {data.certifications.length > 0 && (
          <Section title="Certifications">
            {data.certifications.map((c) => (
              <p key={c.id} className="text-xs text-gray-600 mb-1">{c.name}</p>
            ))}
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">{title}</h2>
      {children}
    </div>
  );
}
