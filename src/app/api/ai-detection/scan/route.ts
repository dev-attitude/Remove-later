import { NextResponse } from "next/server";
import { z } from "zod";
import { scanTextForAI } from "@/lib/services/ai-detection";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const schema = z.object({
  text: z.string().min(10).max(100000),
});

export async function POST(req: Request) {
  try {
    const { text } = schema.parse(await req.json());
    const result = await scanTextForAI(text);
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const message = e instanceof Error ? e.message : "Scan failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
