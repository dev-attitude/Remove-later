import { NextResponse } from "next/server";
import { z } from "zod";
import {
  isContactNotifyConfigured,
  notifyRefundRequest,
} from "@/lib/services/contact-notifications";
import { recordError, recordInquiry } from "@/lib/server-log";

const refundSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional(),
  orderRef: z.string().min(2).max(120),
  paymentDate: z.string().min(8).max(20),
  amount: z.union([z.string(), z.number()]).optional(),
  productType: z.string().min(2).max(40),
  reason: z.string().min(10).max(5000),
});

const PRODUCT_LABELS: Record<string, string> = {
  "business-consultation": "Business consultation",
  "business-plan": "Business plan / proposal / company profile",
  "business-registration": "Business registration or documents",
  consulting: "IT consulting",
  "student-writing": "Student / assignment / research writing",
  hosting: "Hosting, domain or email",
  shop: "Shop order (gadgets / hardware)",
  subscription: "Research App subscription",
  other: "Other",
};

export async function POST(req: Request) {
  try {
    const body = refundSchema.parse(await req.json());
    const productLabel = PRODUCT_LABELS[body.productType] ?? body.productType;
    const amountNum =
      body.amount != null && body.amount !== "" ? Number(body.amount) : undefined;
    const message = [
      `Payment date: ${body.paymentDate}`,
      amountNum != null && !Number.isNaN(amountNum) ? `Amount paid: N$ ${amountNum}` : null,
      "",
      "Reason:",
      body.reason,
    ]
      .filter((line): line is string => line != null)
      .join("\n");

    console.info("[gm-refund-request]", {
      name: body.name,
      email: body.email,
      orderRef: body.orderRef,
      productType: body.productType,
      at: new Date().toISOString(),
    });

    await recordInquiry({
      kind: "refund_request",
      name: body.name,
      email: body.email,
      phone: body.phone,
      subject: productLabel,
      orderRef: body.orderRef,
      message,
      totalNad: amountNum != null && !Number.isNaN(amountNum) ? amountNum : undefined,
    });

    const isProduction = process.env.GM_APP_MODE === "production";

    if (isProduction && !isContactNotifyConfigured()) {
      console.error("[gm-refund-request] notifications not configured in production");
      return NextResponse.json(
        {
          error:
            "Our refund system is being set up. Please email us directly in the meantime.",
        },
        { status: 503 }
      );
    }

    const result = await notifyRefundRequest({
      name: body.name,
      email: body.email,
      phone: body.phone,
      orderRef: body.orderRef,
      paymentDate: body.paymentDate,
      amount: amountNum,
      productType: productLabel,
      reason: body.reason,
    });

    if (result.emailConfigured && !result.email) {
      return NextResponse.json(
        { error: "We could not submit your request. Please email us directly." },
        { status: 500 }
      );
    }

    if (result.smsConfigured && !result.sms && !result.email) {
      return NextResponse.json(
        { error: "We could not submit your request. Please email us directly." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Please check your form fields." }, { status: 400 });
    }
    console.error("[gm-refund-request]", e);
    await recordError("api/refund", e);
    return NextResponse.json({ error: "Could not submit refund request." }, { status: 500 });
  }
}
