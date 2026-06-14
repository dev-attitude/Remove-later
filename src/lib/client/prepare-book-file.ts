/** Vercel serverless request bodies are capped (~4.5MB). Stay under 4MB to leave headroom. */
export const MAX_DIRECT_BOOK_UPLOAD_BYTES = 4 * 1024 * 1024;

export type PreparedBookFile = {
  file: File;
  /** Shown after upload when we pre-processed the file client-side */
  notice?: string;
};

/**
 * Large PDFs cannot be posted to Vercel as-is — extract text in the browser and upload .txt instead.
 */
export async function prepareBookFileForUpload(file: File): Promise<PreparedBookFile> {
  if (file.size <= MAX_DIRECT_BOOK_UPLOAD_BYTES) {
    return { file };
  }

  const lower = file.name.toLowerCase();

  if (lower.endsWith(".pdf")) {
    const buffer = await file.arrayBuffer();
    const { extractText } = await import("unpdf");
    const { text } = await extractText(new Uint8Array(buffer), { mergePages: true });
    const trimmed = (text || "").trim();

    if (trimmed.length < 200) {
      throw new Error(
        "This PDF is too large to upload directly and we could not extract readable text in your browser. Export as DOCX or plain text, or use a text-based (not scanned) PDF."
      );
    }

    const baseName = file.name.replace(/\.pdf$/i, "") || "textbook";
    const textBlob = trimmed.slice(0, 250_000);
    const textFile = new File([textBlob], `${baseName}.txt`, { type: "text/plain" });

    return {
      file: textFile,
      notice: `Large PDF (${formatMb(file.size)}) — text was extracted in your browser before upload.`,
    };
  }

  throw new Error(
    `This file is ${formatMb(file.size)}. The live site accepts up to ${formatMb(MAX_DIRECT_BOOK_UPLOAD_BYTES)} per upload. ` +
      "For large PDFs, we extract text automatically — for DOCX, save as .txt or use a smaller export."
  );
}

function formatMb(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
