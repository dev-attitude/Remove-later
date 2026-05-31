import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { generateAcademicText } from "@/lib/services/ai";
import { prisma } from "@/lib/db";

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

    const result = await generateAcademicText(body.prompt, {
      context: body.context,
    });

    if (session?.user?.id) {
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
    }

    return NextResponse.json(result);
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
