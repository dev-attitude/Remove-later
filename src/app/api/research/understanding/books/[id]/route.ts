import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canManagePlatformTextbooks } from "@/lib/services/understanding-books";
import { clearUnderstandingTopicCache } from "@/lib/services/understanding-topic-cache";
import { warmUnderstandingTopicCache } from "@/lib/services/understanding-topic-warm";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  if (
    !canManagePlatformTextbooks({
      role: (session.user as { role?: string }).role,
      email: session.user.email,
    })
  ) {
    return NextResponse.json({ error: "Not allowed to remove course textbooks." }, { status: 403 });
  }

  const { id } = await params;
  const book = await prisma.understandingBook.findFirst({
    where: { id, userId: null },
  });

  if (!book) {
    return NextResponse.json({ error: "Textbook not found." }, { status: 404 });
  }

  await prisma.understandingBook.delete({ where: { id } });
  void clearUnderstandingTopicCache().then(() =>
    warmUnderstandingTopicCache(8).catch((e) =>
      console.error("[understanding/books DELETE] cache warm failed:", e)
    )
  );
  return NextResponse.json({ ok: true });
}
