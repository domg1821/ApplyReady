import type { ResumeData } from "@/types";
import { formatDate } from "@/lib/utils";

export function CompactTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="bg-white text-gray-900 px-7 py-5" style={{ fontFamily: "Arial, sans-serif", fontSize: "11px" }}>
      {/* Compact header */}
      <div className="flex items-start justify-between gap-4 pb-2 mb-3" style={{ borderBottom: "1.5px solid #059669" }}>
        <div>
          <h1 className="text-2xl font-black text-gray-900">{data.name || "Your Name"}</h1>
          {data.desiredRole && (
            <p className="text-xs font-semibold mt-0.5" style={{ color: "#059669" }}>{data.desiredRole}</p>
          )}
        </div>
        <div className="text-right text-xs text-gray-500 space-y-0.5">
          {data.email && <p>{data.email}</p>}
          {data.phone && <p>{data.phone}</p>}
          {data.location && <p>{data.location}</p>}
          {data.linkedin && <p className="break-all">{data.linkedin}</p>}
        </div>
      </div>

      {data.summary && (
        <p className="text-xs text-gray-600 leading-snug mb-3 italic">{data.summary}</p>
      )}

      {data.experience.length > 0 && (
        <div className="mb-3">
          <CSection title="EXPERIENCE" />
          {data.experience.map((exp) => (
            <div key={exp.id} className="mb-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900">{exp.title} <span className="font-normal text-gray-600">@ {exp.company}</span></span>
                <span className="text-gray-400 text-xs">{formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate)}</span>
              </div>
              {exp.location && <p className="text-gray-400 text-xs">{exp.location}</p>}
              <ul className="ml-3 mt-0.5 space-y-0.5">
                {exp.bullets.map((b, i) => (
                  <li key={i} className="text-gray-600 flex gap-1.5">
                    <span style={{ color: "#059669" }} className="flex-shrink-0">•</span> {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-3">
        {data.skills.length > 0 && (
          <div className="col-span-2">
            <CSection title="SKILLS" />
            <p className="text-gray-600 leading-snug">{data.skills.join(" · ")}</p>
          </div>
        )}
        {data.education.length > 0 && (
          <div>
            <CSection title="EDUCATION" />
            {data.education.map((edu) => (
              <div key={edu.id} className="mb-1">
                <p className="font-bold text-gray-800">{edu.degree}</p>
                <p className="text-gray-600">{edu.field}</p>
                <p className="font-medium" style={{ color: "#059669" }}>{edu.institution}</p>
                <p className="text-gray-400">{formatDate(edu.endDate)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {data.projects.length > 0 && (
        <div className="mb-3">
          <CSection title="PROJECTS" />
          <div className="grid grid-cols-2 gap-2">
            {data.projects.map((p) => (
              <div key={p.id}>
                <span className="font-bold text-gray-900">{p.name}</span>
                {p.technologies.length > 0 && (
                  <span className="font-medium ml-1" style={{ color: "#059669" }}>({p.technologies.join(", ")})</span>
                )}
                {p.description && <p className="text-gray-500">{p.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.certifications.length > 0 && (
        <div>
          <CSection title="CERTIFICATIONS" />
          <div className="flex flex-wrap gap-x-4">
            {data.certifications.map((cert) => (
              <span key={cert.id} className="text-gray-600">
                <span className="font-semibold text-gray-800">{cert.name}</span> — {cert.issuer}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CSection({ title }: { title: string }) {
  return (
    <h2 className="text-xs font-black uppercase tracking-widest mb-1 pb-0.5 border-b" style={{ color: "#059669", borderColor: "#059669" }}>
      {title}
    </h2>
  );
}
