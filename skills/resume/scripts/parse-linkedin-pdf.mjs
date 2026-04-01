#!/usr/bin/env node

/**
 * LinkedIn PDF Parser — Extract text from LinkedIn "Save as PDF" exports
 *
 * Usage: node parse-linkedin-pdf.mjs <file_path>
 * Output: Extracted text to stdout
 *
 * LinkedIn PDFs have a specific structure:
 * - Left sidebar: Contact, Top Skills, Certifications
 * - Main content: Name, Headline, Summary, Experience, Education
 */

import { readFileSync } from "fs";

const filePath = process.argv[2];

if (!filePath) {
  console.error("Usage: node parse-linkedin-pdf.mjs <file_path>");
  process.exit(1);
}

try {
  const buffer = readFileSync(filePath);

  // Use the internal module to bypass pdf-parse's test file loading issue
  const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
  const data = await pdfParse(buffer);
  const text = data.text;

  if (!text || text.trim().length < 50) {
    console.error("Error: Could not extract sufficient text from PDF.");
    console.error("Make sure this is a valid LinkedIn profile PDF.");
    console.error("To export: Go to your LinkedIn profile → More → Save to PDF");
    process.exit(1);
  }

  // Quick validation that this looks like a LinkedIn PDF
  const markers = ["linkedin.com", "Contact", "Experience", "Education", "Top Skills"];
  const matchCount = markers.filter(m => text.includes(m)).length;

  if (matchCount < 2) {
    console.error("Warning: This may not be a LinkedIn PDF export.");
    console.error("Expected to find markers like: Contact, Experience, Education, Top Skills");
    console.error("Proceeding anyway — Claude will parse whatever content is found.");
  }

  console.log(text);
} catch (err) {
  console.error(`Error parsing LinkedIn PDF: ${err.message}`);
  process.exit(1);
}
