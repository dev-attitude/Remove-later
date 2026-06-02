import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { enforceTrialOrSubscription } from "@/lib/billing/trial";
import { loadUnderstandingTopicContent } from "@/lib/services/understanding-topic-content";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const schema = z.object({
  module: z.string().min(1).max(200),
  topic: z.string().min(1).max(200),
  portal: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Sign in to view topic content." }, { status: 401 });
    }

    let useAi = true;
    let trialNotice: string | undefined;
    try {
      await enforceTrialOrSubscription(session.user.id);
    } catch (e) {
      const code = (e as { code?: string } | null)?.code;
      if (code === "TRIAL_EXHAUSTED") {
        useAi = false;
        trialNotice =
          "Free AI trial used up — showing real papers and a literature-based guide. Subscribe for full AI-written guides.";
      } else {
        throw e;
      }
    }

    const result = await loadUnderstandingTopicContent(body.module, body.topic, { useAi });

    if (useAi) {
      try {
        await prisma.usageLog.create({
          data: {
            userId: session.user.id,
            action: "research.understanding",
            portal: body.portal,
            mode: result.mode,
          },
        });
      } catch {
        /* non-blocking */
      }
    }

    return NextResponse.json({ ...result, trialNotice });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    console.error("[research/understanding/topic]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load topic" },
      { status: 500 }
    );
  }
}
