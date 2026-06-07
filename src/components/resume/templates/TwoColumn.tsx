import type { ResumeData } from "@/types";
import { formatDate } from "@/lib/utils";

export function TwoColumnTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="bg-white text-gray-900" style={{ fontFamily: "Arial, sans-serif" }}>
      {/* Clean header */}
      <div className="px-8 py-6 border-b-2" style={{ borderColor: "#dc2626" }}>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">{data.name || "Your Name"}</h1>
        {data.desiredRole && (
          <p className="text-sm font-semibold mt-0.5" style={{ color: "#dc2626" }}>{data.desiredRole}</p>
        )}
        <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>· {data.phone}</span>}
          {data.location && <span>· {data.location}</span>}
          {data.linkedin && <span>· {data.linkedin}</span>}
        </div>
      </div>

      <div className="flex divide-x divide-gray-200">
        {/* Left column — narrower */}
        <div className="w-48 flex-shrink-0 px-5 py-5 space-y-4 bg-gray-50">
          {data.skills.length > 0 && (
            <TCol title="Skills">
              <div className="space-y-1">
                {data.skills.map((s, i) => (
                  <p key={i} className="text-xs text-gray-700 leading-snug">{s}</p>
                ))}
              </div>
            </TCol>
          )}

          {data.education.length > 0 && (
            <TCol title="Education">
              {data.education.map((edu) => (
                <div key={edu.id} className="mb-2">
                  <p className="text-xs font-bold text-gray-800">{edu.degree}</p>
                  <p className="text-xs text-gray-600">{edu.field}</p>
                  <p className="text-xs font-semibold" style={{ color: "#dc2626" }}>{edu.institution}</p>
                  <p className="text-xs text-gray-400">{formatDate(edu.endDate)}</p>
                  {edu.gpa && <p className="text-xs text-gray-400">GPA: {edu.gpa}</p>}
                </div>
              ))}
            </TCol>
          )}

          {data.certifications.length > 0 && (
            <TCol title="Certifications">
              {data.certifications.map((cert) => (
                <div key={cert.id} className="mb-1.5">
                  <p className="text-xs font-bold text-gray-800">{cert.name}</p>
                  <p className="text-xs text-gray-500">{cert.issuer}</p>
                </div>
              ))}
            </TCol>
          )}
        </div>

        {/* Right column — wider */}
        <div className="flex-1 px-6 py-5 space-y-4">
          {data.summary && (
            <TRight title="Profile">
              <p className="text-sm text-gray-600 leading-relaxed">{data.summary}</p>
            </TRight>
          )}

          {data.experience.length > 0 && (
            <TRight title="Experience">
              {data.experience.map((exp) => (
                <div key={exp.id} className="mb-4">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{exp.title}</p>
                      <p className="text-sm font-semibold" style={{ color: "#dc2626" }}>{exp.company}</p>
                      {exp.location && <p className="text-xs text-gray-400">{exp.location}</p>}
                    </div>
                    <p className="text-xs text-gray-400 whitespace-nowrap">
                      {formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate)}
                    </p>
                  </div>
                  <ul className="mt-1.5 space-y-1">
                    {exp.bullets.map((b, i) => (
                      <li key={i} className="text-xs text-gray-600 flex gap-2">
                        <span style={{ color: "#dc2626" }} className="font-bold flex-shrink-0">▸</span> {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </TRight>
          )}

          {data.projects.length > 0 && (
            <TRight title="Projects">
              <div className="space-y-2">
                {data.projects.map((p) => (
                  <div key={p.id}>
                    <p className="text-sm font-bold text-gray-800">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.description}</p>
                    {p.technologies.length > 0 && (
                      <p className="text-xs font-medium" style={{ color: "#dc2626" }}>{p.technologies.join(" · ")}</p>
                    )}
                  </div>
                ))}
              </div>
            </TRight>
          )}
        </div>
      </div>
    </div>
  );
}

function TCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2">{title}</h3>
      {children}
    </div>
  );
}

function TRight({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xs font-black uppercase tracking-widest mb-2 pb-1 flex items-center gap-2" style={{ color: "#dc2626" }}>
        <span>{title}</span>
        <span className="flex-1 h-px bg-gray-200 inline-block" />
      </h2>
      {children}
    </div>
  );
}
