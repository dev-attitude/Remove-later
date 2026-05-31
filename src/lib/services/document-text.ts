import mammoth from "mammoth";

const MAX_EXTRACT_CHARS = 80_000;

export async function extractTextFromFile(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  const lower = fileName.toLowerCase();

  if (mimeType === "text/plain" || lower.endsWith(".txt")) {
    return buffer.toString("utf-8").slice(0, MAX_EXTRACT_CHARS);
  }

  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lower.endsWith(".docx")
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return (result.value || "").slice(0, MAX_EXTRACT_CHARS);
  }

  if (mimeType === "application/pdf" || lower.endsWith(".pdf")) {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    try {
      const textResult = await parser.getText();
      return (textResult.text || "").slice(0, MAX_EXTRACT_CHARS);
    } finally {
      await parser.destroy();
    }
  }

  if (lower.endsWith(".doc")) {
    throw new Error("Legacy .doc files are not supported. Save as .docx or paste your text.");
  }

  throw new Error("Unsupported file type. Upload PDF, DOCX, or TXT, or paste your text.");
}
