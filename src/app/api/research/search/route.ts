import { NextResponse } from "next/server";
import { z } from "zod";
import { multiSourceSearch } from "@/lib/integrations/search";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

const schema = z.object({
  query: z.string().min(2).max(500),
  sources: z.array(z.string()).min(1).max(20),
});

export async function POST(req: Request) {
  try {
    const { query, sources } = schema.parse(await req.json());
    const result = await multiSourceSearch(query, sources);
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    console.error("[research/search]", e);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
