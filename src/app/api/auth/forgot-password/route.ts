import { NextResponse } from "next/server";
import { z } from "zod";
import { requestPasswordReset } from "@/lib/services/password-reset";

export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email().max(200),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const result = await requestPasswordReset(body.email);
    const status = result.ok ? 200 : 503;
    return NextResponse.json(
      { ok: result.ok, message: result.message, emailSent: result.emailSent },
      { status }
    );
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ ok: false, message: "Enter a valid email address." }, { status: 400 });
    }
    console.error("[forgot-password]", e);
    return NextResponse.json(
      { ok: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
