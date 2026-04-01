#!/usr/bin/env node

/**
 * DOCX Generator — Convert Markdown resume to a Word document
 *
 * Usage: node generate-docx.mjs <input.md> <output.docx>
 *
 * Produces a clean, ATS-friendly Word document.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  Packer,
} from "docx";

const inputPath = process.argv[2];
const outputPath = process.argv[3];

if (!inputPath || !outputPath) {
  console.error("Usage: node generate-docx.mjs <input.md> <output.docx>");
  process.exit(1);
}

const markdown = readFileSync(resolve(inputPath), "utf-8");

/**
 * Parse markdown into document sections
 * Simple parser — handles the specific resume markdown format
 */
function parseResumeMarkdown(md) {
  const lines = md.split("\n");
  const sections = [];
  let currentSection = null;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // H1 — Name
    if (line.startsWith("# ") && !line.startsWith("## ")) {
      sections.push({ type: "name", text: line.replace("# ", "").trim() });
    }
    // H2 — Section heading
    else if (line.startsWith("## ")) {
      currentSection = line.replace("## ", "").trim();
      sections.push({ type: "section", text: currentSection });
    }
    // H3 — Subsection (job title, project name)
    else if (line.startsWith("### ")) {
      // Parse "Job Title — Company" or just "Project Name"
      const text = line.replace("### ", "").trim();
      sections.push({ type: "subsection", text, section: currentSection });
    }
    // Horizontal rule — skip
    else if (line.trim() === "---") {
      // Skip
    }
    // Bullet point
    else if (line.trim().startsWith("- ")) {
      const text = line.trim().replace(/^- /, "");
      sections.push({ type: "bullet", text, section: currentSection });
    }
    // Italic line (dates/location)
    else if (line.trim().startsWith("*") && line.trim().endsWith("*")) {
      const text = line.trim().replace(/^\*+/, "").replace(/\*+$/, "").trim();
      sections.push({ type: "italic", text, section: currentSection });
    }
    // Bold label line (skills category)
    else if (line.trim().startsWith("**") && line.trim().includes(":**")) {
      const text = line.trim();
      sections.push({ type: "skills-line", text, section: currentSection });
    }
    // Regular paragraph
    else if (line.trim().length > 0) {
      sections.push({ type: "paragraph", text: line.trim(), section: currentSection });
    }

    i++;
  }

  return sections;
}

function buildDocument(sections) {
  const children = [];

  for (const item of sections) {
    switch (item.type) {
      case "name":
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: item.text, bold: true, size: 48, font: "Helvetica" }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 },
          })
        );
        break;

      case "section":
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: item.text.toUpperCase(),
                bold: true,
                size: 24,
                font: "Helvetica",
              }),
            ],
            border: {
              bottom: { color: "333333", style: BorderStyle.SINGLE, size: 6 },
            },
            spacing: { before: 280, after: 120 },
          })
        );
        break;

      case "subsection": {
        // Parse "Job Title — Company" format
        const parts = item.text.split(" — ");
        const titleRuns = [];

        if (parts.length > 1) {
          titleRuns.push(
            new TextRun({ text: parts[0], bold: true, size: 22, font: "Helvetica" }),
            new TextRun({ text: " — ", size: 22, font: "Helvetica" }),
            new TextRun({ text: parts.slice(1).join(" — "), size: 22, font: "Helvetica" }),
          );
        } else {
          titleRuns.push(
            new TextRun({ text: item.text, bold: true, size: 22, font: "Helvetica" }),
          );
        }

        children.push(
          new Paragraph({
            children: titleRuns,
            spacing: { before: 160, after: 40 },
          })
        );
        break;
      }

      case "italic":
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: item.text, italics: true, size: 20, color: "555555", font: "Helvetica" }),
            ],
            spacing: { after: 60 },
          })
        );
        break;

      case "bullet":
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: item.text, size: 21, font: "Helvetica" }),
            ],
            bullet: { level: 0 },
            spacing: { after: 40 },
          })
        );
        break;

      case "skills-line": {
        // Parse "**Category:** items" format
        const match = item.text.match(/\*\*(.+?):\*\*\s*(.*)/);
        if (match) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: `${match[1]}: `, bold: true, size: 21, font: "Helvetica" }),
                new TextRun({ text: match[2], size: 21, font: "Helvetica" }),
              ],
              spacing: { after: 40 },
            })
          );
        } else {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: item.text.replace(/\*\*/g, ""), size: 21, font: "Helvetica" })],
              spacing: { after: 40 },
            })
          );
        }
        break;
      }

      case "paragraph": {
        // Contact lines (contain | separator) should be centered
        const isContactLine = item.text.includes(" | ") && !item.section;
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: item.text,
                size: isContactLine ? 20 : 21,
                color: isContactLine ? "444444" : "1a1a1a",
                font: "Helvetica",
              }),
            ],
            alignment: isContactLine ? AlignmentType.CENTER : AlignmentType.LEFT,
            spacing: { after: 60 },
          })
        );
        break;
      }
    }
  }

  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, right: 720, bottom: 720, left: 720 }, // 0.5 inch
          },
        },
        children,
      },
    ],
  });
}

try {
  const parsed = parseResumeMarkdown(markdown);
  const doc = buildDocument(parsed);
  const buffer = await Packer.toBuffer(doc);
  writeFileSync(resolve(outputPath), buffer);
  console.log(`DOCX generated: ${resolve(outputPath)}`);
} catch (err) {
  console.error(`Error generating DOCX: ${err.message}`);
  process.exit(1);
}
