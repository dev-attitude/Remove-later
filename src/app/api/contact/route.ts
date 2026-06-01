import { NextResponse } from "next/server";
import { z } from "zod";
import {
  isContactNotifyConfigured,
  notifyContactInquiry,
} from "@/lib/services/contact-notifications";

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

    const isProduction = process.env.GM_APP_MODE === "production";

    if (isProduction && !isContactNotifyConfigured()) {
      console.error("[gm-contact-inquiry] notifications not configured in production");
      return NextResponse.json(
        {
          error:
            "Our contact system is being set up. Please email or call us directly in the meantime.",
        },
        { status: 503 }
      );
    }

    const result = await notifyContactInquiry(body);

    if (result.emailConfigured && !result.email) {
      return NextResponse.json(
        { error: "We could not send your message. Please call us directly." },
        { status: 500 }
      );
    }

    if (result.smsConfigured && !result.sms) {
      console.error("[gm-contact-inquiry] SMS delivery failed:", result.smsError);
      // Client still gets success if email went out — you are notified in the email body
      if (!result.email) {
        return NextResponse.json(
          { error: "We could not send your message. Please call us directly." },
          { status: 500 }
        );
      }
    }

    if (!result.emailConfigured && !result.smsConfigured) {
      console.info("[gm-contact-inquiry] dev mode — stored in logs only");
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Please check your form fields." }, { status: 400 });
    }
    console.error("[gm-contact-inquiry]", e);
    return NextResponse.json({ error: "Could not send message." }, { status: 500 });
  }
}
