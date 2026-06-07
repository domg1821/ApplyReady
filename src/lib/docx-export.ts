import type { ResumeData } from "@/types";

export async function exportResumeToDocx(data: ResumeData, fileName: string): Promise<void> {
  const docx = await import("docx");
  const {
    Document, Packer, Paragraph, TextRun, HeadingLevel,
    AlignmentType, BorderStyle, Tab, TabStopType,
  } = docx;

  const BRAND = "7C3AED";
  const BLACK = "111827";
  const GRAY  = "6B7280";
  const LIGHT = "E5E7EB";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type Para = InstanceType<typeof Paragraph>;

  const divider = new Paragraph({
    border: { bottom: { color: LIGHT, space: 1, style: BorderStyle.SINGLE, size: 6 } },
    spacing: { before: 60, after: 60 },
    children: [],
  });

  const sectionTitle = (text: string): Para =>
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 80 },
      children: [
        new TextRun({
          text: text.toUpperCase(),
          bold: true,
          size: 18,
          color: BRAND,
          characterSpacing: 40,
        }),
      ],
    });

  const children: Para[] = [];

  // ── Header ─────────────────────────────────────────────
  children.push(
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 40 },
      children: [
        new TextRun({ text: data.name || "Your Name", bold: true, size: 52, color: BLACK }),
      ],
    })
  );

  if (data.desiredRole) {
    children.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text: data.desiredRole, size: 24, color: BRAND, bold: true })],
      })
    );
  }

  const contactParts = [data.email, data.phone, data.location, data.linkedin, data.website]
    .filter(Boolean).join("  ·  ");
  if (contactParts) {
    children.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: contactParts, size: 18, color: GRAY })],
      })
    );
  }
  children.push(divider);

  // ── Summary ────────────────────────────────────────────
  if (data.summary) {
    children.push(sectionTitle("Professional Summary"));
    children.push(
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({ text: data.summary, size: 20, color: BLACK, italics: true })],
      })
    );
    children.push(divider);
  }

  // ── Experience ─────────────────────────────────────────
  if (data.experience?.length) {
    children.push(sectionTitle("Work Experience"));
    for (const exp of data.experience) {
      const dateStr = `${exp.startDate || ""} – ${exp.current ? "Present" : exp.endDate || ""}`;
      children.push(
        new Paragraph({
          spacing: { before: 160, after: 40 },
          tabStops: [{ type: TabStopType.RIGHT, position: 9072 }],
          children: [
            new TextRun({ text: exp.title, bold: true, size: 22, color: BLACK }),
            new TextRun({ children: [new Tab()], size: 22 }),
            new TextRun({ text: dateStr, size: 18, color: GRAY }),
          ],
        })
      );
      children.push(
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({ text: `${exp.company}${exp.location ? `  ·  ${exp.location}` : ""}`, size: 19, color: BRAND }),
          ],
        })
      );
      for (const bullet of exp.bullets ?? []) {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 40 },
            indent: { left: 360 },
            children: [new TextRun({ text: bullet, size: 19, color: BLACK })],
          })
        );
      }
    }
    children.push(divider);
  }

  // ── Education ──────────────────────────────────────────
  if (data.education?.length) {
    children.push(sectionTitle("Education"));
    for (const edu of data.education) {
      children.push(
        new Paragraph({
          spacing: { before: 100, after: 40 },
          tabStops: [{ type: TabStopType.RIGHT, position: 9072 }],
          children: [
            new TextRun({ text: `${edu.degree} in ${edu.field}`, bold: true, size: 22, color: BLACK }),
            new TextRun({ children: [new Tab()], size: 22 }),
            new TextRun({ text: edu.endDate || "", size: 18, color: GRAY }),
          ],
        })
      );
      children.push(
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({ text: edu.institution, size: 19, color: BRAND }),
            ...(edu.gpa ? [new TextRun({ text: `  ·  GPA: ${edu.gpa}`, size: 18, color: GRAY })] : []),
          ],
        })
      );
    }
    children.push(divider);
  }

  // ── Skills ─────────────────────────────────────────────
  if (data.skills?.length) {
    children.push(sectionTitle("Skills"));
    children.push(
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({ text: data.skills.join("  ·  "), size: 19, color: BLACK })],
      })
    );
    children.push(divider);
  }

  // ── Projects ───────────────────────────────────────────
  if (data.projects?.length) {
    children.push(sectionTitle("Projects"));
    for (const proj of data.projects) {
      children.push(
        new Paragraph({
          spacing: { before: 100, after: 40 },
          children: [new TextRun({ text: proj.name, bold: true, size: 22, color: BLACK })],
        })
      );
      if (proj.description) {
        children.push(new Paragraph({
          spacing: { after: 40 },
          children: [new TextRun({ text: proj.description, size: 19, color: BLACK })],
        }));
      }
      if (proj.technologies?.length) {
        children.push(new Paragraph({
          spacing: { after: 80 },
          children: [new TextRun({ text: proj.technologies.join(" · "), size: 18, color: BRAND })],
        }));
      }
    }
    children.push(divider);
  }

  // ── Certifications ─────────────────────────────────────
  if (data.certifications?.length) {
    children.push(sectionTitle("Certifications"));
    for (const cert of data.certifications) {
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 40 },
          tabStops: [{ type: TabStopType.RIGHT, position: 9072 }],
          children: [
            new TextRun({ text: cert.name, bold: true, size: 20, color: BLACK }),
            new TextRun({ children: [new Tab()], size: 20 }),
            new TextRun({ text: cert.date || "", size: 18, color: GRAY }),
          ],
        })
      );
      children.push(new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text: cert.issuer, size: 18, color: BRAND })],
      }));
    }
    children.push(divider);
  }

  // ── Volunteer Work ─────────────────────────────────────
  if (data.volunteerWork?.length) {
    children.push(sectionTitle("Volunteer Work"));
    for (const vol of data.volunteerWork) {
      const dateStr = `${vol.startDate || ""} – ${vol.current ? "Present" : vol.endDate || ""}`;
      children.push(
        new Paragraph({
          spacing: { before: 120, after: 40 },
          tabStops: [{ type: TabStopType.RIGHT, position: 9072 }],
          children: [
            new TextRun({ text: vol.role, bold: true, size: 22, color: BLACK }),
            new TextRun({ children: [new Tab()], size: 22 }),
            new TextRun({ text: dateStr, size: 18, color: GRAY }),
          ],
        })
      );
      children.push(new Paragraph({
        spacing: { after: vol.description ? 40 : 80 },
        children: [new TextRun({ text: vol.organization, size: 19, color: BRAND })],
      }));
      if (vol.description) {
        children.push(new Paragraph({
          spacing: { after: 80 },
          children: [new TextRun({ text: vol.description, size: 19, color: BLACK })],
        }));
      }
    }
    children.push(divider);
  }

  // ── Extracurriculars ───────────────────────────────────
  if (data.extracurriculars?.length) {
    children.push(sectionTitle("Activities & Organizations"));
    for (const item of data.extracurriculars) {
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 40 },
          indent: { left: 360 },
          children: [new TextRun({ text: item, size: 19, color: BLACK })],
        })
      );
    }
    children.push(divider);
  }

  // ── Relevant Coursework ────────────────────────────────
  if (data.relevantCoursework?.length) {
    children.push(sectionTitle("Relevant Coursework"));
    children.push(
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({ text: data.relevantCoursework.join("  ·  "), size: 19, color: BLACK })],
      })
    );
  }

  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: "Calibri", size: 20 } },
      },
    },
    sections: [
      {
        properties: {
          page: { margin: { top: 720, right: 900, bottom: 720, left: 900 } },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
