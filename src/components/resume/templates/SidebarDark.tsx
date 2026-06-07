import type { ResumeData } from "@/types";
import { formatDate } from "@/lib/utils";

export function SidebarDarkTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="bg-white text-gray-900 flex" style={{ fontFamily: "Arial, sans-serif", minHeight: "900px" }}>
      {/* Dark sidebar */}
      <div style={{ backgroundColor: "#1a1a2e", width: "220px", flexShrink: 0 }} className="px-5 py-7 space-y-6">
        {/* Name block */}
        <div>
          <h1 className="text-xl font-bold text-white leading-tight">
            {(data.name || "Your Name").split(" ").map((word, i) => (
              <span key={i} className="block">{word}</span>
            ))}
          </h1>
          {data.desiredRole && (
            <p style={{ color: "#818cf8" }} className="text-xs font-medium mt-2 leading-snug">{data.desiredRole}</p>
          )}
        </div>

        {/* Contact */}
        <div className="space-y-1.5">
          <SideLabel>Contact</SideLabel>
          {data.email && <p className="text-xs text-gray-300 break-all">{data.email}</p>}
          {data.phone && <p className="text-xs text-gray-300">{data.phone}</p>}
          {data.location && <p className="text-xs text-gray-300">{data.location}</p>}
          {data.linkedin && <p className="text-xs text-gray-400 break-all">{data.linkedin}</p>}
        </div>

        {/* Skills */}
        {data.skills.length > 0 && (
          <div>
            <SideLabel>Skills</SideLabel>
            <div className="space-y-1.5 mt-1.5">
              {data.skills.map((s, i) => (
                <div key={i}>
                  <p className="text-xs text-gray-300">{s}</p>
                  <div className="h-0.5 bg-gray-600 rounded mt-0.5">
                    <div className="h-0.5 rounded" style={{ width: `${70 + (i % 3) * 10}%`, backgroundColor: "#818cf8" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <div>
            <SideLabel>Education</SideLabel>
            {data.education.map((edu) => (
              <div key={edu.id} className="mt-2">
                <p className="text-xs font-bold text-white">{edu.degree}</p>
                <p className="text-xs text-gray-400">{edu.field}</p>
                <p className="text-xs font-medium mt-0.5" style={{ color: "#818cf8" }}>{edu.institution}</p>
                <p className="text-xs text-gray-500">{formatDate(edu.endDate)}</p>
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {data.certifications.length > 0 && (
          <div>
            <SideLabel>Certifications</SideLabel>
            {data.certifications.map((cert) => (
              <div key={cert.id} className="mt-1.5">
                <p className="text-xs font-medium text-white">{cert.name}</p>
                <p className="text-xs text-gray-400">{cert.issuer}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 px-6 py-7 space-y-5">
        {data.summary && (
          <div>
            <MainLabel>About Me</MainLabel>
            <p className="text-sm text-gray-600 leading-relaxed">{data.summary}</p>
          </div>
        )}

        {data.experience.length > 0 && (
          <div>
            <MainLabel>Work Experience</MainLabel>
            <div className="space-y-4 mt-2">
              {data.experience.map((exp) => (
                <div key={exp.id} className="relative pl-4">
                  <div className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#1a1a2e" }} />
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{exp.title}</p>
                      <p className="text-xs font-semibold text-gray-500">{exp.company}{exp.location ? ` · ${exp.location}` : ""}</p>
                    </div>
                    <p className="text-xs text-gray-400 whitespace-nowrap">
                      {formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate)}
                    </p>
                  </div>
                  <ul className="mt-1.5 space-y-1">
                    {exp.bullets.map((b, i) => (
                      <li key={i} className="text-xs text-gray-600 flex gap-2">
                        <span style={{ color: "#1a1a2e" }} className="font-bold flex-shrink-0">▸</span> {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.projects.length > 0 && (
          <div>
            <MainLabel>Projects</MainLabel>
            <div className="space-y-2 mt-2">
              {data.projects.map((p) => (
                <div key={p.id} className="border-l-2 pl-3" style={{ borderColor: "#818cf8" }}>
                  <p className="text-sm font-bold text-gray-800">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.description}</p>
                  {p.technologies.length > 0 && (
                    <p className="text-xs font-medium mt-0.5" style={{ color: "#1a1a2e" }}>{p.technologies.join(" · ")}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SideLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#818cf8" }}>
      {children}
    </h3>
  );
}

function MainLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-black uppercase tracking-widest text-gray-800 border-b border-gray-200 pb-1 mb-2">
      {children}
    </h2>
  );
}
