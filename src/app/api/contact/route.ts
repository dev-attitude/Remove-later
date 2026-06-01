import { NextResponse } from "next/server";
import { z } from "zod";

const contactSchema = z.object({
  type: z.enum(["contact", "purchase"]),
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional(),
  subject: z.string().max(80).optional(),
  message: z.string().max(5000).optional(),
  packageId: z.string().max(80).optional(),
  packageName: z.string().max(120).optional(),
});

export async function POST(req: Request) {
  try {
    const body = contactSchema.parse(await req.json());

    const summary =
      body.type === "purchase"
        ? `[Purchase] ${body.packageName ?? body.packageId}: ${body.message ?? ""}`
        : `[${body.subject ?? "general"}] ${body.message ?? ""}`;

    console.info("[gm-contact-inquiry]", {
      type: body.type,
      name: body.name,
      email: body.email,
      phone: body.phone,
      package: body.packageName ?? body.packageId,
      message: summary,
      at: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Please check your form fields." }, { status: 400 });
    }
    return NextResponse.json({ error: "Could not send message." }, { status: 500 });
  }
}
