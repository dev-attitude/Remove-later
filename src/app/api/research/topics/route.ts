import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { generateResearchTopicsWithLiterature } from "@/lib/services/research-topics";
import { RESEARCH_METHODS } from "@/lib/research-methods";
import { isResearchLevelId } from "@/lib/research-levels";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const schema = z.object({
  fieldOfStudy: z.string().min(2).max(200),
  problems: z.string().min(10).max(3000),
  researchLocation: z.string().min(2).max(300),
  researchMethod: z.string().min(2).max(120),
  researchLevel: z.string().min(2).max(40),
  portal: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());

    if (!RESEARCH_METHODS.includes(body.researchMethod as (typeof RESEARCH_METHODS)[number])) {
      return NextResponse.json(
        { error: "Please select a valid research method from the list." },
        { status: 400 }
      );
    }

    if (!isResearchLevelId(body.researchLevel)) {
      return NextResponse.json(
        { error: "Please select a valid research level." },
        { status: 400 }
      );
    }

    const result = await generateResearchTopicsWithLiterature({
      ...body,
      researchLevel: body.researchLevel,
    });
    const session = await auth();

    if (session?.user?.id) {
      try {
        await prisma.usageLog.create({
          data: {
            userId: session.user.id,
            action: "research.topics",
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
      return NextResponse.json(
        { error: "Please complete all fields (problems need at least 10 characters)." },
        { status: 400 }
      );
    }
    console.error("[research/topics]", e);
    return NextResponse.json(
      { error: "Topic generation failed. Please try again." },
      { status: 500 }
    );
  }
}
