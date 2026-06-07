"use client";

import type { ResumeData, TemplateId } from "@/types";

export async function exportResumeToPDF(
  resumeData: ResumeData,
  template: TemplateId,
  fileName: string
): Promise<void> {
  const { default: jsPDF } = await import("jspdf");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  let y = margin;

  // Fonts & helpers
  const setFont = (size: number, style: "normal" | "bold" = "normal") => {
    doc.setFontSize(size);
    doc.setFont("helvetica", style);
  };

  const addText = (text: string, x: number, yPos: number, maxWidth?: number): number => {
    if (!text) return yPos;
    const lines = doc.splitTextToSize(text, maxWidth ?? contentWidth);
    doc.text(lines, x, yPos);
    return yPos + lines.length * (doc.getFontSize() * 0.4);
  };

  const checkPage = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const sectionHeader = (title: string) => {
    checkPage(12);
    y += 3;
    setFont(9, "bold");
    doc.setTextColor(99, 102, 241);
    doc.text(title.toUpperCase(), margin, y);
    y += 1.5;
    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(0.3);
    doc.line(margin, y, margin + contentWidth, y);
    y += 4;
    doc.setTextColor(30, 30, 30);
  };

  // ── Header ──────────────────────────────────────────────
  setFont(22, "bold");
  doc.setTextColor(17, 24, 39);
  doc.text(resumeData.name || "Your Name", margin, y);
  y += 7;

  if (resumeData.desiredRole) {
    setFont(11);
    doc.setTextColor(99, 102, 241);
    doc.text(resumeData.desiredRole, margin, y);
    y += 5;
  }

  // Contact line
  const contacts = [resumeData.email, resumeData.phone, resumeData.location, resumeData.linkedin]
    .filter(Boolean)
    .join("  ·  ");
  if (contacts) {
    setFont(8);
    doc.setTextColor(107, 114, 128);
    doc.text(contacts, margin, y);
    y += 2;
  }

  // Divider
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.5);
  doc.line(margin, y + 2, margin + contentWidth, y + 2);
  y += 7;
  doc.setTextColor(30, 30, 30);

  // ── Summary ──────────────────────────────────────────────
  if (resumeData.summary) {
    sectionHeader("Professional Summary");
    setFont(9.5);
    doc.setTextColor(55, 65, 81);
    y = addText(resumeData.summary, margin, y, contentWidth) + 4;
  }

  // ── Experience ──────────────────────────────────────────
  if (resumeData.experience.length > 0) {
    sectionHeader("Experience");
    for (const exp of resumeData.experience) {
      checkPage(20);
      setFont(10, "bold");
      doc.setTextColor(17, 24, 39);
      doc.text(exp.title, margin, y);

      setFont(9);
      doc.setTextColor(99, 102, 241);
      const dateStr = `${exp.startDate} – ${exp.current ? "Present" : exp.endDate}`;
      doc.text(dateStr, pageWidth - margin, y, { align: "right" });
      y += 4.5;

      setFont(9);
      doc.setTextColor(107, 114, 128);
      doc.text(`${exp.company}${exp.location ? `  ·  ${exp.location}` : ""}`, margin, y);
      y += 4;

      doc.setTextColor(55, 65, 81);
      setFont(9);
      for (const bullet of exp.bullets) {
        checkPage(6);
        const lines = doc.splitTextToSize(`• ${bullet}`, contentWidth - 4);
        doc.text(lines, margin + 2, y);
        y += lines.length * 3.8;
      }
      y += 3;
    }
  }

  // ── Education ──────────────────────────────────────────
  if (resumeData.education.length > 0) {
    sectionHeader("Education");
    for (const edu of resumeData.education) {
      checkPage(12);
      setFont(10, "bold");
      doc.setTextColor(17, 24, 39);
      doc.text(`${edu.degree} in ${edu.field}`, margin, y);

      setFont(9);
      doc.setTextColor(107, 114, 128);
      doc.text(edu.endDate, pageWidth - margin, y, { align: "right" });
      y += 4.5;

      setFont(9);
      doc.setTextColor(99, 102, 241);
      doc.text(edu.institution, margin, y);
      if (edu.gpa) {
        doc.setTextColor(107, 114, 128);
        doc.text(`GPA: ${edu.gpa}`, pageWidth - margin, y, { align: "right" });
      }
      y += 6;
    }
  }

  // ── Skills ──────────────────────────────────────────────
  if (resumeData.skills.length > 0) {
    sectionHeader("Skills");
    setFont(9.5);
    doc.setTextColor(55, 65, 81);
    y = addText(resumeData.skills.join("  ·  "), margin, y, contentWidth) + 4;
  }

  // ── Projects ──────────────────────────────────────────
  if (resumeData.projects.length > 0) {
    sectionHeader("Projects");
    for (const proj of resumeData.projects) {
      checkPage(14);
      setFont(10, "bold");
      doc.setTextColor(17, 24, 39);
      doc.text(proj.name, margin, y);
      y += 4.5;

      if (proj.description) {
        setFont(9);
        doc.setTextColor(55, 65, 81);
        y = addText(proj.description, margin, y, contentWidth) + 2;
      }

      if (proj.technologies.length > 0) {
        setFont(8.5);
        doc.setTextColor(99, 102, 241);
        doc.text(proj.technologies.join(" · "), margin, y);
        y += 5;
      }
    }
  }

  // ── Certifications ──────────────────────────────────────
  if (resumeData.certifications.length > 0) {
    sectionHeader("Certifications");
    for (const cert of resumeData.certifications) {
      checkPage(8);
      setFont(9.5, "bold");
      doc.setTextColor(17, 24, 39);
      doc.text(cert.name, margin, y);
      setFont(9);
      doc.setTextColor(107, 114, 128);
      doc.text(`${cert.issuer}${cert.date ? ` · ${cert.date}` : ""}`, pageWidth - margin, y, { align: "right" });
      y += 5;
    }
  }

  doc.save(`${fileName}.pdf`);
}
