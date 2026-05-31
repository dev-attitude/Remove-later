import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  generateAcademicWriting,
  buildSmartToolPrompt,
} from "@/lib/services/academic-writing";
import { generateAcademicText } from "@/lib/services/ai";
import { getResearchLevel, isResearchLevelId } from "@/lib/research-levels";
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
      const prompt = buildSmartToolPrompt(
        body.tool,
        body.topic,
        body.researchLevel,
        body.draft
      );
      const result = await generateAcademicText(prompt, { maxTokens: 1500 });
      const levelMeta = getResearchLevel(body.researchLevel);
      return NextResponse.json({
        content: result.content,
        mode: result.mode,
        targetLabel: body.tool,
        researchLevelLabel: levelMeta?.label ?? body.researchLevel,
        sourcesUsed: [],
        sourcesQueried: [],
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
