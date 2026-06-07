import type { ResumeData } from "@/types";
import { formatDate } from "@/lib/utils";

export function NavyTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="bg-white text-gray-900" style={{ fontFamily: "Arial, sans-serif" }}>
      {/* Navy + gold header */}
      <div style={{ backgroundColor: "#0f2444" }} className="px-8 py-7 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-40 opacity-10"
          style={{ background: "repeating-linear-gradient(45deg, #d4af37, #d4af37 1px, transparent 1px, transparent 8px)" }} />
        <h1 className="text-3xl font-bold text-white relative">{data.name || "Your Name"}</h1>
        {data.desiredRole && (
          <p className="text-sm font-semibold mt-1 relative" style={{ color: "#d4af37" }}>{data.desiredRole}</p>
        )}
        <div className="flex flex-wrap gap-4 mt-3 text-xs text-blue-200 relative">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>· {data.phone}</span>}
          {data.location && <span>· {data.location}</span>}
          {data.linkedin && <span>· {data.linkedin}</span>}
        </div>
      </div>
      {/* Gold accent line */}
      <div style={{ backgroundColor: "#d4af37", height: "3px" }} />

      <div className="px-8 py-6 space-y-5">
        {data.summary && (
          <div>
            <NavySection title="Professional Summary" />
            <p className="text-sm text-gray-600 leading-relaxed">{data.summary}</p>
          </div>
        )}

        {data.experience.length > 0 && (
          <div>
            <NavySection title="Work Experience" />
            <div className="space-y-4">
              {data.experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{exp.title}</p>
                      <p className="text-sm font-semibold" style={{ color: "#0f2444" }}>{exp.company}</p>
                      {exp.location && <p className="text-xs text-gray-400">{exp.location}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-bold text-white px-2 py-0.5 rounded" style={{ backgroundColor: "#0f2444" }}>
                        {formatDate(exp.startDate)} – {exp.current ? "Now" : formatDate(exp.endDate)}
                      </span>
                    </div>
                  </div>
                  <ul className="mt-2 space-y-1 ml-3">
                    {exp.bullets.map((b, i) => (
                      <li key={i} className="text-xs text-gray-700 flex gap-2">
                        <span style={{ color: "#d4af37" }} className="font-bold flex-shrink-0">◆</span> {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          {data.skills.length > 0 && (
            <div>
              <NavySection title="Skills" />
              <div className="flex flex-wrap gap-1.5">
                {data.skills.map((s, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded border font-medium"
                    style={{ borderColor: "#0f2444", color: "#0f2444", backgroundColor: "#f0f4f8" }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {data.education.length > 0 && (
            <div>
              <NavySection title="Education" />
              {data.education.map((edu) => (
                <div key={edu.id} className="mb-2">
                  <p className="text-xs font-bold text-gray-900">{edu.degree} in {edu.field}</p>
                  <p className="text-xs" style={{ color: "#0f2444" }}>{edu.institution}</p>
                  <p className="text-xs text-gray-400">{formatDate(edu.endDate)}{edu.gpa ? ` · GPA ${edu.gpa}` : ""}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {data.certifications.length > 0 && (
          <div>
            <NavySection title="Certifications" />
            <div className="grid grid-cols-2 gap-2">
              {data.certifications.map((cert) => (
                <div key={cert.id} className="flex items-start gap-2">
                  <span style={{ color: "#d4af37" }} className="font-bold text-xs mt-0.5">◆</span>
                  <div>
                    <p className="text-xs font-bold text-gray-800">{cert.name}</p>
                    <p className="text-xs text-gray-500">{cert.issuer} · {formatDate(cert.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NavySection({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="w-1 h-4 rounded-full" style={{ backgroundColor: "#d4af37" }} />
      <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: "#0f2444" }}>{title}</h2>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}
