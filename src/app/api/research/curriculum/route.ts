import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { isResearchLevelId } from "@/lib/research-levels";
import { isDisciplineId } from "@/lib/knowledge-library/disciplines";
import { generateResearchCurriculum } from "@/lib/services/curriculum-generator";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const schema = z.object({
  researchLevel: z.string().min(2).max(40),
  discipline: z.string().min(2).max(80),
  goals: z.string().max(2000).optional(),
  portal: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());

    if (!isResearchLevelId(body.researchLevel)) {
      return NextResponse.json({ error: "Select a valid research level." }, { status: 400 });
    }
    if (!isDisciplineId(body.discipline)) {
      return NextResponse.json({ error: "Select a valid discipline." }, { status: 400 });
    }

    const result = await generateResearchCurriculum({
      researchLevel: body.researchLevel,
      discipline: body.discipline,
      goals: body.goals,
    });

    const session = await auth();
    if (session?.user?.id) {
      try {
        await prisma.usageLog.create({
          data: {
            userId: session.user.id,
            action: "research.curriculum",
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
      return NextResponse.json({ error: "Invalid curriculum request." }, { status: 400 });
    }
    console.error("[research/curriculum]", e);
    return NextResponse.json({ error: "Curriculum generation failed." }, { status: 500 });
  }
}
