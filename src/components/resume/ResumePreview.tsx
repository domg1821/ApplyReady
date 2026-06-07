import type { ResumeData, TemplateId } from "@/types";
import { ModernTemplate } from "./templates/Modern";
import { ExecutiveTemplate } from "./templates/Executive";
import { MinimalTemplate } from "./templates/Minimal";
import { StudentTemplate } from "./templates/Student";
import { TechTemplate } from "./templates/Tech";
import { CreativeTemplate } from "./templates/Creative";
import { CorporateTemplate } from "./templates/Corporate";
import { BoldTemplate } from "./templates/Bold";
import { ElegantTemplate } from "./templates/Elegant";
import { SidebarDarkTemplate } from "./templates/SidebarDark";
import { ClassicTemplate } from "./templates/Classic";
import { NavyTemplate } from "./templates/Navy";
import { CompactTemplate } from "./templates/Compact";
import { TwoColumnTemplate } from "./templates/TwoColumn";
import { GradientTemplate } from "./templates/Gradient";

interface ResumePreviewProps {
  data: ResumeData;
  template: TemplateId;
  isPro?: boolean;
  /** When true, shows as a full A4 page on gray background */
  fullPage?: boolean;
}

export const TEMPLATE_MAP: Record<TemplateId, React.ComponentType<{ data: ResumeData }>> = {
  modern: ModernTemplate,
  executive: ExecutiveTemplate,
  minimal: MinimalTemplate,
  student: StudentTemplate,
  tech: TechTemplate,
  creative: CreativeTemplate,
  corporate: CorporateTemplate,
  bold: BoldTemplate,
  elegant: ElegantTemplate,
  "sidebar-dark": SidebarDarkTemplate,
  classic: ClassicTemplate,
  navy: NavyTemplate,
  compact: CompactTemplate,
  "two-column": TwoColumnTemplate,
  gradient: GradientTemplate,
};

export function ResumePreview({ data, template, isPro = false, fullPage = false }: ResumePreviewProps) {
  const Template = TEMPLATE_MAP[template] ?? ModernTemplate;

  if (fullPage) {
    return (
      <div className="bg-gray-200 dark:bg-neutral-700 min-h-full px-4 py-6 flex justify-center">
        {/* A4 shadow page — no blur, users can see their own data fully */}
        <div
          className="bg-white shadow-2xl w-full"
          style={{ maxWidth: "794px", minHeight: "1123px" }}
          id="resume-preview"
        >
          <Template data={data} />
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden relative" id="resume-preview">
      <Template data={data} />
      {!isPro && (
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-neutral-900 to-transparent pointer-events-none" />
      )}
    </div>
  );
}
