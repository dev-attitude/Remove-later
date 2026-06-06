import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import type { SupervisorFeedbackAnalysis } from "@/lib/services/supervisor-feedback-analysis";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { id } = await params;
  const review = await prisma.supervisorFeedbackReview.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!review) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let analysis: SupervisorFeedbackAnalysis | null = null;
  if (review.analysisJson) {
    try {
      analysis = JSON.parse(review.analysisJson) as SupervisorFeedbackAnalysis;
    } catch {
      analysis = null;
    }
  }

  return NextResponse.json({
    review: {
      id: review.id,
      title: review.title,
      supervisorName: review.supervisorName,
      studentFileName: review.studentFileName,
      supervisorFileName: review.supervisorFileName,
      status: review.status,
      mode: review.mode,
      createdAt: review.createdAt,
      hasStudentDraft: Boolean(review.studentText),
    },
    analysis,
  });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { id } = await params;
  const review = await prisma.supervisorFeedbackReview.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!review) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.supervisorFeedbackReview.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
