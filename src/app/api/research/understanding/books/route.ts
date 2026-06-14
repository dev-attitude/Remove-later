import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  extractTextFromFile,
  MAX_BOOK_EXTRACT_CHARS,
} from "@/lib/services/document-text";
import {
  canManagePlatformTextbooks,
  listPlatformTextbooks,
  MAX_PLATFORM_BOOKS,
} from "@/lib/services/understanding-books";
import { clearUnderstandingTopicCache } from "@/lib/services/understanding-topic-cache";
import { warmUnderstandingTopicCache } from "@/lib/services/understanding-topic-warm";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const MAX_SIZE = 25 * 1024 * 1024;
const ALLOWED = [
  "application/pdf",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export async function GET() {
  const session = await auth();
  const books = await listPlatformTextbooks();
  const canManage = session?.user
    ? canManagePlatformTextbooks({
        role: (session.user as { role?: string }).role,
        email: session.user.email,
      })
    : false;

  return NextResponse.json({ books, canManage });
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Sign in to upload textbooks." }, { status: 401 });
    }

    const canManage = canManagePlatformTextbooks({
      role: (session.user as { role?: string }).role,
      email: session.user.email,
    });
    if (!canManage) {
      return NextResponse.json(
        {
          error:
            "Only administrators can upload course textbooks. Contact your institution admin or set PLATFORM_TEXTBOOK_ADMIN_EMAILS on the server.",
        },
        { status: 403 }
      );
    }

    const count = await prisma.understandingBook.count({
      where: { userId: null },
    });
    if (count >= MAX_PLATFORM_BOOKS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_PLATFORM_BOOKS} course textbooks. Remove one to add another.` },
        { status: 400 }
      );
    }

    const form = await req.formData();
    const file = form.get("file") as File | null;
    const title = (form.get("title") as string | null)?.trim();
    const moduleScope = (form.get("moduleScope") as string | null)?.trim() || null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 25MB)" }, { status: 400 });
    }
    if (!ALLOWED.includes(file.type) && !file.name.match(/\.(pdf|docx|txt)$/i)) {
      return NextResponse.json(
        { error: "Upload PDF, DOCX, or TXT textbooks only." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || "application/octet-stream";
    const textContent = await extractTextFromFile(
      buffer,
      file.name,
      mimeType,
      MAX_BOOK_EXTRACT_CHARS
    );

    if (textContent.trim().length < 200) {
      return NextResponse.json(
        {
          error:
            "Could not extract enough text from this file. Try a text-based PDF or DOCX export.",
        },
        { status: 400 }
      );
    }

    const book = await prisma.understandingBook.create({
      data: {
        userId: null,
        uploadedBy: session.user.id,
        title: title || file.name.replace(/\.[^.]+$/, ""),
        fileName: file.name,
        mimeType,
        size: file.size,
        textContent,
        moduleScope: moduleScope || undefined,
      },
    });

    void clearUnderstandingTopicCache().then(() =>
      warmUnderstandingTopicCache(8).catch((e) =>
        console.error("[understanding/books] cache warm failed:", e)
      )
    );

    return NextResponse.json({
      book: {
        id: book.id,
        title: book.title,
        fileName: book.fileName,
        moduleScope: book.moduleScope,
        charCount: book.textContent.length,
        createdAt: book.createdAt,
      },
    });
  } catch (e) {
    console.error("[understanding/books POST]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upload failed" },
      { status: 500 }
    );
  }
}
