import { NextResponse } from "next/server";
import { z } from "zod";
import { searchLiterature } from "@/lib/services/literature";

const schema = z.object({
  query: z.string().min(2).max(500),
});

export async function POST(req: Request) {
  try {
    const { query } = schema.parse(await req.json());
    const result = await searchLiterature(query);
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
