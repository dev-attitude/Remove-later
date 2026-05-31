import { NextResponse } from "next/server";
import { extractTextFromFile } from "@/lib/services/document-text";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const MAX_SIZE = 25 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 25MB)" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractTextFromFile(
      buffer,
      file.name,
      file.type || "application/octet-stream"
    );

    if (!text.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from this file. Try paste or another format." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      text,
      fileName: file.name,
      charCount: text.length,
    });
  } catch (e) {
    console.error("[ai-detection/extract]", e);
    const message = e instanceof Error ? e.message : "Could not read file";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
