import { NextResponse } from "next/server";
import { z } from "zod";
import { searchDomainsDemo } from "@/lib/hosting-demo";

const schema = z.object({
  query: z.string().min(2).max(63),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const results = searchDomainsDemo(body.query);
    return NextResponse.json({
      demo: true,
      query: body.query,
      results,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Enter at least 2 characters" }, { status: 400 });
    }
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
