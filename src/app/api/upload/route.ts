import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { config, getRuntimeMode } from "@/lib/config";

const MAX_SIZE = 25 * 1024 * 1024;
const ALLOWED = [
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

async function storeFile(
  storageKey: string,
  buffer: Buffer
): Promise<{ storageKey: string; persistent: boolean }> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import("@vercel/blob");
      const blob = await put(storageKey, buffer, {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      return { storageKey: blob.url, persistent: true };
    } catch (e) {
      console.error("[upload] Vercel Blob failed, falling back:", e);
    }
  }

  const isVercel = Boolean(process.env.VERCEL);
  const uploadDir = isVercel
    ? path.join("/tmp", "gm-uploads")
    : path.resolve(process.cwd(), config.upload.dir);

  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, storageKey), buffer);

  return { storageKey, persistent: !isVercel };
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const portal = form.get("portal") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 25MB)" }, { status: 400 });
    }

    if (!ALLOWED.includes(file.type) && !file.name.endsWith(".csv")) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    const fileKey = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const stored = await storeFile(fileKey, buffer);

    const doc = await prisma.document.create({
      data: {
        userId: session?.user?.id,
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        storageKey: stored.storageKey,
        portal: portal ?? undefined,
      },
    });

    return NextResponse.json({
      id: doc.id,
      name: doc.name,
      size: doc.size,
      mode: getRuntimeMode(),
      persistent: stored.persistent,
      note: stored.persistent
        ? undefined
        : "Add Vercel Blob (BLOB_READ_WRITE_TOKEN) for permanent file storage on live hosting.",
    });
  } catch (e) {
    console.error("[upload]", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
