import { NextResponse } from "next/server";
import { z } from "zod";
import { humanizeFlaggedSentences, type AISentenceResult } from "@/lib/services/ai-detection";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const schema = z.object({
  fullText: z.string().min(10).max(100000),
  flagged: z.array(
    z.object({
      text: z.string(),
      aiProbability: z.number(),
      risk: z.enum(["high", "moderate", "low"]),
      index: z.number(),
    })
  ),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const flagged = body.flagged.filter(
      (s): s is AISentenceResult => s.risk === "high" || s.risk === "moderate"
    );

    const result = await humanizeFlaggedSentences(body.fullText, flagged);
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    console.error("[ai-detection/humanize]", e);
    return NextResponse.json({ error: "Humanization failed" }, { status: 500 });
  }
}
