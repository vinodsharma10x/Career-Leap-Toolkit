#!/usr/bin/env node

/**
 * Resume Parser — Extract text from PDF, DOCX, or TXT files
 *
 * Usage: node parse-resume.mjs <file_path>
 * Output: Extracted text to stdout
 */

import { readFileSync } from "fs";
import { extname } from "path";

const filePath = process.argv[2];

if (!filePath) {
  console.error("Usage: node parse-resume.mjs <file_path>");
  console.error("Supported formats: PDF, DOCX, DOC, TXT");
  process.exit(1);
}

const ext = extname(filePath).toLowerCase();
const buffer = readFileSync(filePath);

async function extractText() {
  switch (ext) {
    case ".pdf": {
      // Use the internal module to bypass pdf-parse's test file loading issue
      const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
      const data = await pdfParse(buffer);
      return data.text;
    }
    case ".docx":
    case ".doc": {
      const mammoth = await import("mammoth");
      const result = await mammoth.default.extractRawText({ buffer });
      return result.value;
    }
    case ".txt": {
      return buffer.toString("utf-8");
    }
    default:
      console.error(`Unsupported file type: ${ext}`);
      console.error("Supported formats: PDF, DOCX, DOC, TXT");
      process.exit(1);
  }
}

try {
  const text = await extractText();
  if (!text || text.trim().length < 20) {
    console.error("Warning: Very little text extracted from file. The file may be image-based or corrupt.");
  }
  console.log(text);
} catch (err) {
  console.error(`Error extracting text: ${err.message}`);
  process.exit(1);
}
