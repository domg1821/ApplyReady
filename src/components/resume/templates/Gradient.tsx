import type { ResumeData } from "@/types";
import { formatDate } from "@/lib/utils";

export function GradientTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="bg-white text-gray-900" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      {/* Gradient header */}
      <div style={{ background: "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)" }} className="px-8 py-8 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full opacity-20 bg-white" />
        <div className="absolute right-16 -bottom-12 w-32 h-32 rounded-full opacity-10 bg-white" />

        <div className="relative">
          <h1 className="text-3xl font-black text-white">{data.name || "Your Name"}</h1>
          {data.desiredRole && (
            <p className="text-white/70 text-sm font-semibold mt-1">{data.desiredRole}</p>
          )}
          <div className="flex flex-wrap gap-4 mt-4 text-xs text-white/80">
            {data.email && <span className="bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded-full">{data.email}</span>}
            {data.phone && <span className="bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded-full">{data.phone}</span>}
            {data.location && <span className="bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded-full">{data.location}</span>}
            {data.linkedin && <span className="bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded-full">{data.linkedin}</span>}
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-5">
        {data.summary && (
          <div>
            <GSection title="Summary" />
            <p className="text-sm text-gray-600 leading-relaxed">{data.summary}</p>
          </div>
        )}

        {data.experience.length > 0 && (
          <div>
            <GSection title="Experience" />
            <div className="space-y-4">
              {data.experience.map((exp, ei) => (
                <div key={exp.id} className="rounded-xl p-4 border border-gray-100"
                  style={{ background: ei % 2 === 0 ? "#faf5ff" : "#f0f9ff" }}>
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{exp.title}</p>
                      <p className="text-sm font-medium" style={{ color: "#a855f7" }}>{exp.company}</p>
                      {exp.location && <p className="text-xs text-gray-400">{exp.location}</p>}
                    </div>
                    <span className="text-xs text-white font-bold px-2 py-1 rounded-lg flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}>
                      {formatDate(exp.startDate)} – {exp.current ? "Now" : formatDate(exp.endDate)}
                    </span>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {exp.bullets.map((b, i) => (
                      <li key={i} className="text-xs text-gray-600 flex gap-2">
                        <span style={{ color: "#ec4899" }} className="font-black flex-shrink-0">·</span> {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.skills.length > 0 && (
          <div>
            <GSection title="Skills" />
            <div className="flex flex-wrap gap-2">
              {data.skills.map((s, i) => {
                const colors = [
                  "from-indigo-500 to-violet-500",
                  "from-violet-500 to-purple-500",
                  "from-purple-500 to-pink-500",
                  "from-pink-500 to-rose-500",
                ];
                return (
                  <span key={i} className={`text-xs text-white font-semibold px-3 py-1 rounded-full bg-gradient-to-r ${colors[i % 4]}`}>
                    {s}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-5">
          {data.education.length > 0 && (
            <div>
              <GSection title="Education" />
              {data.education.map((edu) => (
                <div key={edu.id} className="rounded-xl p-3 bg-purple-50 border border-purple-100">
                  <p className="text-xs font-bold text-gray-900">{edu.degree} in {edu.field}</p>
                  <p className="text-xs font-semibold mt-0.5" style={{ color: "#a855f7" }}>{edu.institution}</p>
                  <p className="text-xs text-gray-400">{formatDate(edu.endDate)}{edu.gpa ? ` · GPA ${edu.gpa}` : ""}</p>
                </div>
              ))}
            </div>
          )}

          {data.certifications.length > 0 && (
            <div>
              <GSection title="Certifications" />
              <div className="space-y-1.5">
                {data.certifications.map((cert) => (
                  <div key={cert.id} className="rounded-lg p-2 bg-pink-50 border border-pink-100">
                    <p className="text-xs font-bold text-gray-800">{cert.name}</p>
                    <p className="text-xs text-gray-500">{cert.issuer} · {formatDate(cert.date)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {data.projects.length > 0 && (
          <div>
            <GSection title="Projects" />
            <div className="grid grid-cols-2 gap-3">
              {data.projects.map((p) => (
                <div key={p.id} className="rounded-xl p-3 border border-indigo-100 bg-indigo-50">
                  <p className="text-sm font-bold text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{p.description}</p>
                  {p.technologies.length > 0 && (
                    <p className="text-xs font-semibold mt-1" style={{ color: "#6366f1" }}>{p.technologies.join(" · ")}</p>
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

function GSection({ title }: { title: string }) {
  return (
    <h2 className="text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2"
      style={{ background: "linear-gradient(135deg, #6366f1, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
      {title}
    </h2>
  );
}
