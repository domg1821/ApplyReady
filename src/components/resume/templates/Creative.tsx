import type { ResumeData } from "@/types";
import { formatDate } from "@/lib/utils";

export function CreativeTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="bg-white text-gray-900" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      {/* Header — bold teal accent bar */}
      <div style={{ background: "linear-gradient(135deg, #0d9488 0%, #7c3aed 100%)" }} className="px-8 py-8">
        <h1 className="text-4xl font-black text-white tracking-tight leading-none mb-1">
          {data.name || "Your Name"}
        </h1>
        {data.desiredRole && (
          <p className="text-white/70 text-sm font-semibold uppercase tracking-[0.2em] mt-2">
            {data.desiredRole}
          </p>
        )}
        <div className="flex flex-wrap gap-4 mt-4 text-xs text-white/80">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>· {data.phone}</span>}
          {data.location && <span>· {data.location}</span>}
          {data.linkedin && <span>· {data.linkedin}</span>}
        </div>
      </div>

      <div className="px-8 py-6 space-y-5">
        {data.summary && (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 rounded-sm" style={{ background: "#0d9488" }} />
              <h2 className="text-xs font-black uppercase tracking-[0.15em] text-gray-400">About</h2>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed pl-6">{data.summary}</p>
          </div>
        )}

        {data.experience.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 rounded-sm" style={{ background: "#7c3aed" }} />
              <h2 className="text-xs font-black uppercase tracking-[0.15em] text-gray-400">Experience</h2>
            </div>
            <div className="space-y-4 pl-6">
              {data.experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="font-bold text-sm text-gray-900">{exp.title}</p>
                      <p className="text-sm font-medium" style={{ color: "#0d9488" }}>{exp.company}</p>
                    </div>
                    <p className="text-xs text-gray-400 whitespace-nowrap">
                      {formatDate(exp.startDate)} — {exp.current ? "Present" : formatDate(exp.endDate)}
                    </p>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {exp.bullets.map((b, i) => (
                      <li key={i} className="text-xs text-gray-600 flex gap-2">
                        <span style={{ color: "#7c3aed" }} className="flex-shrink-0 font-bold">→</span> {b}
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
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 rounded-sm" style={{ background: "#0d9488" }} />
                <h2 className="text-xs font-black uppercase tracking-[0.15em] text-gray-400">Skills</h2>
              </div>
              <div className="flex flex-wrap gap-1.5 pl-6">
                {data.skills.map((s, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                    style={{ background: i % 2 === 0 ? "#0d9488" : "#7c3aed" }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {data.education.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 rounded-sm" style={{ background: "#7c3aed" }} />
                <h2 className="text-xs font-black uppercase tracking-[0.15em] text-gray-400">Education</h2>
              </div>
              <div className="space-y-2 pl-6">
                {data.education.map((edu) => (
                  <div key={edu.id}>
                    <p className="text-xs font-bold text-gray-800">{edu.degree} — {edu.field}</p>
                    <p className="text-xs text-gray-500">{edu.institution} · {formatDate(edu.endDate)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {data.projects.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 rounded-sm" style={{ background: "#0d9488" }} />
              <h2 className="text-xs font-black uppercase tracking-[0.15em] text-gray-400">Projects</h2>
            </div>
            <div className="space-y-2 pl-6">
              {data.projects.map((p) => (
                <div key={p.id}>
                  <p className="text-sm font-bold text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-600">{p.description}</p>
                  {p.technologies.length > 0 && (
                    <p className="text-xs font-medium mt-0.5" style={{ color: "#7c3aed" }}>{p.technologies.join(" · ")}</p>
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
