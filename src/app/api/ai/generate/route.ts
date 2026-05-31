import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { generateAcademicText } from "@/lib/services/ai";
import { prisma } from "@/lib/db";
import { config } from "@/lib/config";

const schema = z.object({
  prompt: z.string().min(1).max(12000),
  context: z.string().max(50000).optional(),
  portal: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const session = await auth();

    if (config.appMode === "production" && !session?.user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const result = await generateAcademicText(body.prompt, {
      context: body.context,
    });

    if (session?.user?.id) {
      await prisma.usageLog.create({
        data: {
          userId: session.user.id,
          action: "ai.generate",
          portal: body.portal,
          mode: result.mode,
        },
      });
    }

    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    console.error("[ai/generate]", e);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
