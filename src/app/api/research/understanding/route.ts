import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { enforceTrialOrSubscription, trialExpiredMessage } from "@/lib/billing/trial";
import {
  runResearchUnderstanding,
  UNDERSTANDING_ACTIONS,
  type UnderstandingInput,
} from "@/lib/services/research-understanding";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const actionIds = UNDERSTANDING_ACTIONS.map((a) => a.id) as [string, ...string[]];

const schema = z.object({
  mode: z.enum(["topic", "document"]),
  action: z.enum(actionIds),
  researchLevel: z.string().min(1).max(64),
  field: z.string().max(200).optional(),
  topic: z.string().max(500).optional(),
  documentText: z.string().max(80_000).optional(),
  fileName: z.string().max(255).optional(),
  portal: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
    }

    try {
      await enforceTrialOrSubscription(session.user.id);
    } catch (e) {
      const code = (e as { code?: string } | null)?.code;
      if (code === "TRIAL_EXHAUSTED") {
        return NextResponse.json(
          {
            error: trialExpiredMessage(),
            code: "TRIAL_EXHAUSTED",
            subscribePath: `/${body.portal ?? "student"}/subscription`,
          },
          { status: 402 }
        );
      }
      throw e;
    }

    const result = await runResearchUnderstanding(body as UnderstandingInput);

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

    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const message = e instanceof Error ? e.message : "Analysis failed";
    console.error("[research/understanding]", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
