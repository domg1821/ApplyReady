import type { ResumeData } from "@/types";
import { formatDate } from "@/lib/utils";

export function ElegantTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="bg-white text-gray-900" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
      {/* Elegant centered header */}
      <div className="text-center px-8 pt-9 pb-5">
        <h1 className="text-3xl font-normal tracking-[0.08em] text-gray-900" style={{ letterSpacing: "0.12em" }}>
          {data.name || "Your Name"}
        </h1>
        {data.desiredRole && (
          <p className="text-xs tracking-[0.25em] text-gray-400 uppercase mt-2 font-normal">{data.desiredRole}</p>
        )}
        {/* Ornamental divider */}
        <div className="flex items-center justify-center gap-3 mt-4">
          <div className="h-px bg-gray-300 w-16" />
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#b45309" }} />
          <div className="h-px bg-gray-300 w-16" />
        </div>
        <div className="flex justify-center flex-wrap gap-4 mt-3 text-xs text-gray-500" style={{ fontFamily: "Arial, sans-serif" }}>
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>· {data.phone}</span>}
          {data.location && <span>· {data.location}</span>}
          {data.linkedin && <span>· {data.linkedin}</span>}
        </div>
      </div>

      <div className="px-10 py-4 space-y-5">
        {data.summary && (
          <Section title="Profile">
            <p className="text-sm text-gray-600 leading-relaxed italic">{data.summary}</p>
          </Section>
        )}

        {data.experience.length > 0 && (
          <Section title="Experience">
            {data.experience.map((exp) => (
              <div key={exp.id} className="mb-4">
                <div className="flex justify-between items-baseline">
                  <p className="text-sm font-semibold text-gray-900">{exp.title}</p>
                  <p className="text-xs text-gray-400 italic">
                    {formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate)}
                  </p>
                </div>
                <p className="text-xs font-medium mt-0.5" style={{ color: "#b45309" }}>{exp.company}{exp.location ? `, ${exp.location}` : ""}</p>
                <ul className="mt-2 space-y-1 ml-4">
                  {exp.bullets.map((b, i) => (
                    <li key={i} className="text-xs text-gray-600 list-disc">{b}</li>
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
                  <p className="text-sm font-semibold text-gray-800">{edu.degree} in {edu.field}</p>
                  <p className="text-xs italic" style={{ color: "#b45309" }}>{edu.institution}</p>
                  <p className="text-xs text-gray-400">{formatDate(edu.endDate)}{edu.gpa ? ` · GPA ${edu.gpa}` : ""}</p>
                </div>
              ))}
            </Section>
          )}

          {data.skills.length > 0 && (
            <Section title="Expertise">
              <div className="space-y-0.5">
                {data.skills.map((s, i) => (
                  <p key={i} className="text-xs text-gray-600">
                    <span style={{ color: "#b45309" }}>✦</span> {s}
                  </p>
                ))}
              </div>
            </Section>
          )}
        </div>

        {data.certifications.length > 0 && (
          <Section title="Certifications & Awards">
            {data.certifications.map((cert) => (
              <div key={cert.id} className="mb-1.5 flex justify-between">
                <p className="text-xs text-gray-700 font-medium">{cert.name} <span className="text-gray-400 font-normal italic">— {cert.issuer}</span></p>
                <p className="text-xs text-gray-400">{formatDate(cert.date)}</p>
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
      <div className="flex items-center gap-3 mb-3">
        <div className="w-4 h-px" style={{ backgroundColor: "#b45309" }} />
        <h2 className="text-xs uppercase tracking-[0.2em] font-normal" style={{ color: "#b45309", fontFamily: "Arial, sans-serif" }}>{title}</h2>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
      {children}
    </div>
  );
}
