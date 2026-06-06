import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { enforceTrialOrSubscription } from "@/lib/billing/trial";
import { extractTextFromFile } from "@/lib/services/document-text";
import { analyzeSupervisorFeedback } from "@/lib/services/supervisor-feedback-analysis";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const MAX_SIZE = 25 * 1024 * 1024;
const ALLOWED_TYPES = [
  "application/pdf",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

async function extractUpload(file: File): Promise<{ text: string; fileName: string }> {
  if (file.size > MAX_SIZE) {
    throw new Error("File too large (max 25MB)");
  }
  const mime = file.type || "application/octet-stream";
  if (
    !ALLOWED_TYPES.includes(mime) &&
    !file.name.match(/\.(pdf|docx|txt)$/i)
  ) {
    throw new Error("Upload PDF, DOCX, or TXT only");
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const text = await extractTextFromFile(buffer, file.name, mime);
  if (!text.trim()) {
    throw new Error(`Could not extract text from ${file.name}`);
  }
  return { text: text.trim(), fileName: file.name };
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const reviews = await prisma.supervisorFeedbackReview.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      title: true,
      supervisorName: true,
      studentFileName: true,
      supervisorFileName: true,
      status: true,
      mode: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ reviews });
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    try {
      await enforceTrialOrSubscription(session.user.id);
    } catch (e) {
      const code = (e as { code?: string } | null)?.code;
      if (code === "TRIAL_EXHAUSTED") {
        return NextResponse.json(
          { error: (e as Error).message, code: "TRIAL_EXHAUSTED" },
          { status: 402 }
        );
      }
      throw e;
    }

    const form = await req.formData();
    const supervisorFile = form.get("supervisorFile") as File | null;
    const studentFile = form.get("studentFile") as File | null;
    const title = String(form.get("title") ?? "").trim();
    const supervisorName = String(form.get("supervisorName") ?? "").trim() || null;
    const portal = String(form.get("portal") ?? "").trim() || null;

    if (!supervisorFile?.size) {
      return NextResponse.json(
        { error: "Upload the document your supervisor returned (required)." },
        { status: 400 }
      );
    }

    const supervisor = await extractUpload(supervisorFile);
    let student: { text: string; fileName: string } | null = null;
    if (studentFile?.size) {
      student = await extractUpload(studentFile);
    }

    const review = await prisma.supervisorFeedbackReview.create({
      data: {
        userId: session.user.id,
        title: title || supervisor.fileName.replace(/\.[^.]+$/, ""),
        supervisorName,
        studentFileName: student?.fileName ?? null,
        supervisorFileName: supervisor.fileName,
        studentText: student?.text ?? null,
        supervisorText: supervisor.text,
        status: "processing",
      },
    });

    try {
      const analysis = await analyzeSupervisorFeedback({
        title: review.title,
        supervisorName: supervisorName ?? undefined,
        studentText: student?.text,
        supervisorText: supervisor.text,
      });

      const updated = await prisma.supervisorFeedbackReview.update({
        where: { id: review.id },
        data: {
          status: "complete",
          mode: analysis.mode,
          analysisJson: JSON.stringify(analysis),
        },
      });

      try {
        await prisma.usageLog.create({
          data: {
            userId: session.user.id,
            action: "supervisor.feedback",
            portal: portal ?? undefined,
            mode: analysis.mode,
            metadata: JSON.stringify({
              reviewId: review.id,
              changeCount: analysis.changeCount,
            }),
          },
        });
      } catch {
        /* non-blocking */
      }

      return NextResponse.json({
        review: {
          id: updated.id,
          title: updated.title,
          supervisorName: updated.supervisorName,
          studentFileName: updated.studentFileName,
          supervisorFileName: updated.supervisorFileName,
          status: updated.status,
          mode: updated.mode,
          createdAt: updated.createdAt,
        },
        analysis,
      });
    } catch (e) {
      await prisma.supervisorFeedbackReview.update({
        where: { id: review.id },
        data: { status: "failed" },
      });
      throw e;
    }
  } catch (e) {
    console.error("[supervisor-feedback POST]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
