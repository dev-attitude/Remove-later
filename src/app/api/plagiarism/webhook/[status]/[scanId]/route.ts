import { NextResponse } from "next/server";
import { handleCopyleaksWebhook } from "@/lib/services/copyleaks";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ status: string; scanId: string }> }
) {
  try {
    const { status, scanId } = await params;
    const body = (await req.json()) as Record<string, unknown>;
    await handleCopyleaksWebhook(status, scanId, body);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[copyleaks-webhook]", e);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
