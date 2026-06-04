import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getUnderstandingTopicCount } from "@/lib/research-suite/understanding-topics";

export const dynamic = "force-dynamic";

function parseUnderstandingTopicKey(metadata: string | null): string | null {
  if (!metadata) return null;
  try {
    const o = JSON.parse(metadata) as { module?: string; topic?: string };
    if (o.module && o.topic) return `${o.module}::${o.topic}`;
  } catch {
    /* ignore */
  }
  return null;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const logs = await prisma.usageLog.findMany({
    where: { userId },
    select: { action: true, metadata: true, portal: true },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const understandingKeys = new Set<string>();
  let writingRuns = 0;
  const actions = new Set<string>();

  for (const log of logs) {
    actions.add(log.action);
    if (log.action === "ai.writing") writingRuns += 1;
    if (log.action === "research.understanding") {
      const key = parseUnderstandingTopicKey(log.metadata);
      if (key) understandingKeys.add(key);
    }
  }

  const serverTopicPct =
    getUnderstandingTopicCount() > 0
      ? Math.round((understandingKeys.size / getUnderstandingTopicCount()) * 100)
      : 0;

  return NextResponse.json({
    understandingTopicsViewed: understandingKeys.size,
    understandingTopicTotal: getUnderstandingTopicCount(),
    serverTopicProgressPercent: serverTopicPct,
    writingRuns,
    distinctActions: actions.size,
    supervisorFeedbackNew: 0,
  });
}
