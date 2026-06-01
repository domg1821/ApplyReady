import type { ResumeData, TemplateId } from "@/types";
import { ModernTemplate } from "./templates/Modern";
import { ExecutiveTemplate } from "./templates/Executive";
import { MinimalTemplate } from "./templates/Minimal";
import { StudentTemplate } from "./templates/Student";
import { TechTemplate } from "./templates/Tech";

interface ResumePreviewProps {
  data: ResumeData;
  template: TemplateId;
  isPro?: boolean;
}

export function ResumePreview({ data, template, isPro = false }: ResumePreviewProps) {
  const wrapperClass = `card overflow-hidden ${!isPro ? "relative" : ""}`;

  const Template = {
    modern: ModernTemplate,
    executive: ExecutiveTemplate,
    minimal: MinimalTemplate,
    student: StudentTemplate,
    tech: TechTemplate,
  }[template] ?? ModernTemplate;

  return (
    <div className={wrapperClass} id="resume-preview">
      <Template data={data} />
      {!isPro && (
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      )}
    </div>
  );
}
