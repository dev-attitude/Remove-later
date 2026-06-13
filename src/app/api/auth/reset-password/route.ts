import { NextResponse } from "next/server";
import { z } from "zod";
import { resetPasswordWithToken } from "@/lib/services/password-reset";

export const dynamic = "force-dynamic";

const schema = z.object({
  token: z.string().min(1).max(200),
  password: z.string().min(8).max(128),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const result = await resetPasswordWithToken(body.token, body.password);
    if (!result.ok) {
      return NextResponse.json({ ok: false, message: result.error }, { status: 400 });
    }
    return NextResponse.json({
      ok: true,
      message: "Password updated. You can sign in with your new password.",
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, message: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }
    console.error("[reset-password]", e);
    return NextResponse.json(
      { ok: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
