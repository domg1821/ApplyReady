import type { ResumeData } from "@/types";
import { formatDate } from "@/lib/utils";

export function BoldTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="bg-white text-gray-900" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      {/* Giant centered name */}
      <div className="text-center px-8 pt-8 pb-4 border-b-4 border-gray-900">
        <h1 className="text-5xl font-black uppercase tracking-tight text-gray-900 leading-none">
          {data.name || "YOUR NAME"}
        </h1>
        {data.desiredRole && (
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-gray-400 mt-2">{data.desiredRole}</p>
        )}
        <div className="flex justify-center flex-wrap gap-4 mt-3 text-xs text-gray-500 font-medium">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>· {data.phone}</span>}
          {data.location && <span>· {data.location}</span>}
          {data.linkedin && <span>· {data.linkedin}</span>}
        </div>
      </div>

      <div className="px-8 py-6 space-y-5">
        {data.summary && (
          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 border-b-2 border-gray-900 pb-1 mb-2">Summary</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{data.summary}</p>
          </div>
        )}

        {data.experience.length > 0 && (
          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 border-b-2 border-gray-900 pb-1 mb-3">Experience</h2>
            <div className="space-y-4">
              {data.experience.map((exp) => (
                <div key={exp.id} className="flex gap-4">
                  <div className="w-1 bg-gray-900 rounded-full flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <p className="font-black text-sm text-gray-900 uppercase tracking-wide">{exp.title}</p>
                        <p className="text-sm font-semibold text-gray-600">{exp.company}{exp.location ? ` · ${exp.location}` : ""}</p>
                      </div>
                      <p className="text-xs text-gray-400 whitespace-nowrap font-bold">
                        {formatDate(exp.startDate)} — {exp.current ? "Present" : formatDate(exp.endDate)}
                      </p>
                    </div>
                    <ul className="mt-2 space-y-1">
                      {exp.bullets.map((b, i) => (
                        <li key={i} className="text-xs text-gray-600 flex gap-2">
                          <span className="font-black text-gray-900">—</span> {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          {data.skills.length > 0 && (
            <div>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 border-b-2 border-gray-900 pb-1 mb-2">Skills</h2>
              <div className="space-y-1">
                {data.skills.map((s, i) => (
                  <p key={i} className="text-xs text-gray-700 font-medium">{s}</p>
                ))}
              </div>
            </div>
          )}

          {data.education.length > 0 && (
            <div>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 border-b-2 border-gray-900 pb-1 mb-2">Education</h2>
              {data.education.map((edu) => (
                <div key={edu.id} className="mb-2">
                  <p className="text-xs font-black text-gray-900 uppercase">{edu.degree}</p>
                  <p className="text-xs text-gray-600">{edu.field}</p>
                  <p className="text-xs font-bold text-gray-500">{edu.institution}</p>
                  <p className="text-xs text-gray-400">{formatDate(edu.endDate)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {data.projects.length > 0 && (
          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 border-b-2 border-gray-900 pb-1 mb-3">Projects</h2>
            <div className="grid grid-cols-2 gap-3">
              {data.projects.map((p) => (
                <div key={p.id} className="border border-gray-200 rounded p-2.5">
                  <p className="text-xs font-black text-gray-900 uppercase">{p.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
