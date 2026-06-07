import type { ResumeData } from "@/types";
import { formatDate } from "@/lib/utils";

export function ClassicTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="bg-white text-gray-900 px-10 py-8" style={{ fontFamily: "Times New Roman, Times, serif" }}>
      {/* Classic centered header */}
      <div className="text-center mb-5 border-b-2 border-gray-900 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">{data.name || "Your Name"}</h1>
        <div className="flex justify-center flex-wrap gap-3 mt-2 text-xs text-gray-600" style={{ fontFamily: "Arial, sans-serif" }}>
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>| {data.phone}</span>}
          {data.location && <span>| {data.location}</span>}
          {data.linkedin && <span>| {data.linkedin}</span>}
        </div>
      </div>

      <div className="space-y-4">
        {data.summary && (
          <Section title="OBJECTIVE">
            <p className="text-sm text-gray-700 leading-relaxed">{data.summary}</p>
          </Section>
        )}

        {data.experience.length > 0 && (
          <Section title="WORK EXPERIENCE">
            {data.experience.map((exp) => (
              <div key={exp.id} className="mb-3">
                <div className="flex justify-between items-start">
                  <p className="font-bold text-sm text-gray-900">{exp.title}, {exp.company}</p>
                  <p className="text-xs text-gray-600 font-medium italic">
                    {formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate)}
                  </p>
                </div>
                {exp.location && <p className="text-xs italic text-gray-500 mb-1">{exp.location}</p>}
                <ul className="ml-4 space-y-0.5">
                  {exp.bullets.map((b, i) => (
                    <li key={i} className="text-xs text-gray-700 list-disc">{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </Section>
        )}

        {data.education.length > 0 && (
          <Section title="EDUCATION">
            {data.education.map((edu) => (
              <div key={edu.id} className="mb-2 flex justify-between items-start">
                <div>
                  <p className="font-bold text-sm text-gray-900">{edu.degree} in {edu.field}</p>
                  <p className="text-xs text-gray-600">{edu.institution}</p>
                  {edu.gpa && <p className="text-xs text-gray-500">GPA: {edu.gpa}</p>}
                </div>
                <p className="text-xs text-gray-600 italic">{formatDate(edu.endDate)}</p>
              </div>
            ))}
          </Section>
        )}

        {data.skills.length > 0 && (
          <Section title="SKILLS">
            <p className="text-sm text-gray-700">{data.skills.join(", ")}</p>
          </Section>
        )}

        {data.projects.length > 0 && (
          <Section title="PROJECTS">
            {data.projects.map((p) => (
              <div key={p.id} className="mb-2">
                <p className="font-bold text-sm text-gray-900">{p.name}</p>
                <p className="text-xs text-gray-600 ml-4">{p.description}</p>
                {p.technologies.length > 0 && (
                  <p className="text-xs text-gray-500 ml-4">Technologies: {p.technologies.join(", ")}</p>
                )}
              </div>
            ))}
          </Section>
        )}

        {data.certifications.length > 0 && (
          <Section title="CERTIFICATIONS">
            {data.certifications.map((cert) => (
              <div key={cert.id} className="flex justify-between mb-1">
                <p className="text-sm text-gray-800">{cert.name} — <span className="text-gray-600">{cert.issuer}</span></p>
                <p className="text-xs text-gray-500 italic">{formatDate(cert.date)}</p>
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
      <h2 className="text-xs font-bold tracking-widest text-gray-900 border-b border-gray-400 pb-0.5 mb-2" style={{ fontFamily: "Arial, sans-serif" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}
