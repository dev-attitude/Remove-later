/**
 * Import shared course textbooks into UnderstandingBook (platform library).
 * Usage: npx tsx scripts/import-course-textbooks.ts [pdf paths...]
 */
import { readFile } from "fs/promises";
import path from "path";
import { prisma } from "../src/lib/db";
import {
  extractTextFromFile,
  MAX_BOOK_EXTRACT_CHARS,
} from "../src/lib/services/document-text";

const DEFAULT_BOOKS = [
  {
    path: "/Users/Erastus/Documents/Ranjit_Kumar-Research_Methodology_A_Step-by-Step_G-1-1.pdf",
    title: "Research Methodology: A Step-by-Step Guide (Ranjit Kumar)",
  },
  {
    path: "/Users/Erastus/Documents/RESEARCH_METHODOLOGY_C_R_KOTHARI_(ENG).pdf",
    title: "Research Methodology (C.R. Kothari)",
  },
  {
    path: "/Users/Erastus/Documents/Research Methodology .pdf",
    title: "Research Methodology",
  },
];

async function importBook(filePath: string, title: string) {
  const fileName = path.basename(filePath);
  const existing = await prisma.understandingBook.findFirst({
    where: { userId: null, fileName },
  });
  if (existing) {
    console.log(`Skip (already imported): ${fileName}`);
    return existing.id;
  }

  const buffer = await readFile(filePath);
  const textContent = await extractTextFromFile(
    buffer,
    fileName,
    "application/pdf",
    MAX_BOOK_EXTRACT_CHARS
  );

  if (textContent.trim().length < 200) {
    throw new Error(`Too little text extracted from ${fileName} (${textContent.length} chars)`);
  }

  const book = await prisma.understandingBook.create({
    data: {
      userId: null,
      title,
      fileName,
      mimeType: "application/pdf",
      size: buffer.length,
      textContent,
    },
  });

  console.log(
    `Imported: ${title} — ${(textContent.length / 1000).toFixed(1)}k chars (${(buffer.length / 1024 / 1024).toFixed(1)} MB file)`
  );
  return book.id;
}

async function main() {
  const args = process.argv.slice(2);
  const items =
    args.length > 0
      ? args.map((p) => ({ path: p, title: path.basename(p).replace(/\.pdf$/i, "") }))
      : DEFAULT_BOOKS;

  for (const item of items) {
    await importBook(item.path, item.title);
  }

  const count = await prisma.understandingBook.count({ where: { userId: null } });
  console.log(`\nPlatform textbooks in library: ${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
