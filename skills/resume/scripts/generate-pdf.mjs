#!/usr/bin/env node

/**
 * PDF Generator — Convert Markdown resume to a clean, ATS-friendly PDF
 *
 * Usage: node generate-pdf.mjs <input.md> <output.pdf>
 *
 * Uses Puppeteer to render HTML → PDF for clean typography.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const inputPath = process.argv[2];
const outputPath = process.argv[3];

if (!inputPath || !outputPath) {
  console.error("Usage: node generate-pdf.mjs <input.md> <output.pdf>");
  process.exit(1);
}

const markdown = readFileSync(resolve(inputPath), "utf-8");

// Convert markdown to HTML
const { marked } = await import("marked");

// Configure marked for clean output
marked.use({
  breaks: false,
  gfm: true,
});

const htmlBody = await marked.parse(markdown);

// Wrap in a full HTML document with professional resume styling
const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page {
    margin: 0.5in 0.6in;
    size: letter;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 10.5pt;
    line-height: 1.45;
    color: #1a1a1a;
    -webkit-print-color-adjust: exact;
  }

  /* Name */
  h1 {
    font-size: 22pt;
    font-weight: 700;
    text-align: center;
    margin-bottom: 4pt;
    color: #111;
  }

  /* Contact line — the first paragraph after h1 */
  h1 + p {
    text-align: center;
    font-size: 9.5pt;
    color: #444;
    margin-bottom: 2pt;
  }

  /* Second contact/links line */
  h1 + p + p {
    text-align: center;
    font-size: 9.5pt;
    color: #444;
    margin-bottom: 6pt;
  }

  /* Section headings */
  h2 {
    font-size: 11.5pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5pt;
    border-bottom: 1.5px solid #333;
    padding-bottom: 2pt;
    margin-top: 14pt;
    margin-bottom: 8pt;
    color: #111;
  }

  /* Job title / Project name */
  h3 {
    font-size: 10.5pt;
    font-weight: 700;
    margin-top: 8pt;
    margin-bottom: 1pt;
    color: #1a1a1a;
  }

  /* Dates and location (italic lines after h3) */
  h3 + p em, h3 + p > em {
    font-size: 9.5pt;
    color: #555;
  }

  p {
    margin-bottom: 4pt;
  }

  /* Bullet points */
  ul {
    margin-left: 16pt;
    margin-bottom: 6pt;
    padding-left: 0;
  }

  li {
    margin-bottom: 2pt;
    padding-left: 2pt;
  }

  li::marker {
    color: #555;
  }

  /* Skills section — bold category labels */
  strong {
    font-weight: 600;
  }

  /* Horizontal rules = section dividers */
  hr {
    border: none;
    margin: 0;
    padding: 0;
    height: 0;
  }

  /* Links */
  a {
    color: #1a1a1a;
    text-decoration: none;
  }

  /* Code (for technical terms if used) */
  code {
    font-family: "SF Mono", Menlo, monospace;
    font-size: 9.5pt;
    background: #f5f5f5;
    padding: 1px 3px;
    border-radius: 2px;
  }
</style>
</head>
<body>
${htmlBody}
</body>
</html>`;

try {
  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.default.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  await page.pdf({
    path: resolve(outputPath),
    format: "Letter",
    margin: { top: "0.5in", right: "0.6in", bottom: "0.5in", left: "0.6in" },
    printBackground: true,
  });

  await browser.close();
  console.log(`PDF generated: ${resolve(outputPath)}`);
} catch (err) {
  console.error(`Error generating PDF: ${err.message}`);

  // Fallback: save as HTML for manual conversion
  const htmlPath = outputPath.replace(/\.pdf$/, ".html");
  writeFileSync(resolve(htmlPath), html);
  console.error(`Fallback: Saved as HTML at ${resolve(htmlPath)}`);
  console.error("You can open this HTML file in a browser and print to PDF.");
  process.exit(1);
}
