import { NextResponse } from "next/server";
import { warmUnderstandingTopicCache, countPendingTopicCache } from "@/lib/services/understanding-topic-warm";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

function authorizeCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return process.env.NODE_ENV !== "production";
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

/** Pre-generate up to 12 uncached topic guides (runs daily via Vercel cron). */
export async function GET(req: Request) {
  if (!authorizeCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const pendingBefore = await countPendingTopicCache();
    const result = await warmUnderstandingTopicCache(12);
    const pendingAfter = await countPendingTopicCache();
    return NextResponse.json({
      ok: true,
      pendingBefore,
      pendingAfter,
      ...result,
    });
  } catch (e) {
    console.error("[cron/warm-understanding-topics]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Cron failed" },
      { status: 500 }
    );
  }
}
