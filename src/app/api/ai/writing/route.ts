import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { generateAcademicWriting } from "@/lib/services/academic-writing";
import { isResearchLevelId } from "@/lib/research-levels";
import { WRITING_CHAPTERS, WRITING_SECTIONS } from "@/lib/modules";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const validTargets = new Set<string>([
  ...WRITING_CHAPTERS.map((c) => c.id),
  ...WRITING_SECTIONS,
]);

const schema = z
  .object({
    topic: z.string().min(5).max(500),
    target: z.string().min(2).max(120).optional(),
    researchLevel: z.string().min(2).max(40),
    portal: z.string().optional(),
    tool: z.string().max(120).optional(),
    draft: z.string().max(30000).optional(),
  })
  .refine((d) => d.tool || (d.target && validTargets.has(d.target)), {
    message: "Select a valid section or chapter.",
  });

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());

    if (!isResearchLevelId(body.researchLevel)) {
      return NextResponse.json(
        { error: "Please select a valid research level." },
        { status: 400 }
      );
    }

    if (body.tool) {
      const topicWithDraft = body.draft
        ? `${body.topic}\n\nText to apply tool to:\n${body.draft}`
        : body.topic;
      const result = await generateAcademicWriting({
        topic: topicWithDraft,
        target: body.tool,
        researchLevel: body.researchLevel,
      });
      return NextResponse.json({
        ...result,
        targetLabel: body.tool,
      });
    }

    const result = await generateAcademicWriting({
      topic: body.topic,
      target: body.target!,
      researchLevel: body.researchLevel,
    });

    const session = await auth();
    if (session?.user?.id) {
      try {
        await prisma.usageLog.create({
          data: {
            userId: session.user.id,
            action: "ai.writing",
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
        { error: "Enter your research topic (at least 5 characters) and select a section or chapter." },
        { status: 400 }
      );
    }
    console.error("[ai/writing]", e);
    return NextResponse.json(
      { error: "Writing generation failed. Please try again." },
      { status: 500 }
    );
  }
}
