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

    if (session?.user?.id) {
      try {
        await enforceTrialOrSubscription(session.user.id);
      } catch (e) {
        const code = (e as { code?: string } | null)?.code;
        if (code === "TRIAL_EXHAUSTED") {
          return NextResponse.json(
            {
              error: "Free trial used up. Please subscribe to continue.",
              code: "TRIAL_EXHAUSTED",
              subscribePath: `/${body.portal ?? "student"}/subscription`,
            },
            { status: 402 }
          );
        }
        throw e;
      }
    } else {
      return NextResponse.json({ error: "Sign in to view topic content." }, { status: 401 });
    }

    const result = await loadUnderstandingTopicContent(body.module, body.topic);

    if (session?.user?.id) {
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

    return NextResponse.json(result);
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
