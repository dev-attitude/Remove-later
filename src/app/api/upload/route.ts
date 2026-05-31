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

    const uploadDir = path.resolve(process.cwd(), config.upload.dir);
    await mkdir(uploadDir, { recursive: true });

    const storageKey = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, storageKey), buffer);

    const doc = await prisma.document.create({
      data: {
        userId: session?.user?.id,
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        storageKey,
        portal: portal ?? undefined,
      },
    });

    return NextResponse.json({
      id: doc.id,
      name: doc.name,
      size: doc.size,
      mode: getRuntimeMode(),
    });
  } catch (e) {
    console.error("[upload]", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
