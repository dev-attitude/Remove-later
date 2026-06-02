import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { generateAcademicText } from "@/lib/services/ai";
import { prisma } from "@/lib/db";
import { enforceTrialOrSubscription } from "@/lib/billing/trial";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const schema = z.object({
  prompt: z.string().min(1).max(12000),
  context: z.string().max(50000).optional(),
  portal: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
    }

    let trial;
    try {
      trial = await enforceTrialOrSubscription(session.user.id);
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

    const result = await generateAcademicText(body.prompt, {
      context: body.context,
    });

    try {
      await prisma.usageLog.create({
        data: {
          userId: session.user.id,
          action: "ai.generate",
          portal: body.portal,
          mode: result.mode,
        },
      });
    } catch {
      /* non-blocking */
    }

    return NextResponse.json(
      { ...result, trialRemaining: Math.min(9999, trial.remaining) },
      {
        headers: {
          "X-Trial-Remaining": String(Math.min(9999, trial.remaining)),
        },
      }
    );
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    console.error("[ai/generate]", e);
    return NextResponse.json(
      { error: "Generation failed. Please try again in a moment." },
      { status: 500 }
    );
  }
}
