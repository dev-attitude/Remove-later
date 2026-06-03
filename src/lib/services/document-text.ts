import mammoth from "mammoth";

const DEFAULT_MAX_EXTRACT_CHARS = 80_000;
export const MAX_BOOK_EXTRACT_CHARS = 250_000;

type PdfParseFn = (buffer: Buffer) => Promise<{ text: string }>;

async function extractPdfText(buffer: Buffer): Promise<string> {
  const mod = await import("pdf-parse");
  const pdfParse = (mod as { default?: PdfParseFn }).default ?? (mod as unknown as PdfParseFn);
  const data = await pdfParse(buffer);
  return data.text || "";
}

export async function extractTextFromFile(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  maxChars = DEFAULT_MAX_EXTRACT_CHARS
): Promise<string> {
  const lower = fileName.toLowerCase();

  if (mimeType === "text/plain" || lower.endsWith(".txt")) {
    return buffer.toString("utf-8").slice(0, maxChars);
  }

  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lower.endsWith(".docx")
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return (result.value || "").slice(0, maxChars);
  }

  if (mimeType === "application/pdf" || lower.endsWith(".pdf")) {
    try {
      const text = await extractPdfText(buffer);
      return text.slice(0, maxChars);
    } catch (e) {
      console.error("[document-text] PDF extract failed:", e);
      throw new Error(
        "Could not read this PDF on the server. Save as DOCX, export plain text, or paste your content instead."
      );
    }
  }

  if (lower.endsWith(".doc")) {
    throw new Error("Legacy .doc files are not supported. Save as .docx or paste your text.");
  }

  throw new Error("Unsupported file type. Upload PDF, DOCX, or TXT, or paste your text.");
}
