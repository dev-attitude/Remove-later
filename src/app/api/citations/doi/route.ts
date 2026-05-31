import { NextResponse } from "next/server";
import { z } from "zod";
import { lookupDoi } from "@/lib/integrations/crossref";

export const dynamic = "force-dynamic";

const schema = z.object({
  doi: z.string().min(4).max(200),
});

export async function POST(req: Request) {
  try {
    const { doi } = schema.parse(await req.json());
    const work = await lookupDoi(doi);
    if (!work) {
      return NextResponse.json({ error: "DOI not found in Crossref" }, { status: 404 });
    }
    return NextResponse.json(work);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid DOI" }, { status: 400 });
    }
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}
