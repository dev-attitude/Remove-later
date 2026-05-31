import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { detectAIContent } from "@/lib/services/integrity";
import { config } from "@/lib/config";

const schema = z.object({
  text: z.string().min(10).max(100000),
});

export async function POST(req: Request) {
  try {
    const { text } = schema.parse(await req.json());
    const session = await auth();

    if (config.appMode === "production" && !session?.user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const result = await detectAIContent(text);
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    return NextResponse.json({ error: "Scan failed" }, { status: 500 });
  }
}
