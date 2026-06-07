import { NextResponse } from "next/server";
import { z } from "zod";
import {
  buildDemoAccount,
  generateOrderId,
  type HostingCartItem,
} from "@/lib/hosting-demo";
import { notifyContactInquiry } from "@/lib/services/contact-notifications";

const cartItemSchema = z.object({
  lineId: z.string(),
  type: z.enum(["domain", "plan", "addon"]),
  catalogId: z.string(),
  name: z.string(),
  price: z.number().min(0),
  currency: z.literal("NAD"),
  period: z.enum(["month", "year", "once"]),
  domain: z.string().optional(),
});

const orderSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional(),
  items: z.array(cartItemSchema).min(1),
  notes: z.string().max(2000).optional(),
});

export async function POST(req: Request) {
  try {
    const body = orderSchema.parse(await req.json());
    const orderId = generateOrderId();
    const account = buildDemoAccount(
      orderId,
      { name: body.name, email: body.email, phone: body.phone ?? "" },
      body.items as HostingCartItem[]
    );

    const lines = body.items.map(
      (i) =>
        `• ${i.name} — N$ ${i.price.toLocaleString()}${i.period === "month" ? "/mo" : i.period === "year" ? "/yr" : ""}`
    );
    const message = [
      `[Skyrapay Hosting Demo Order] ${orderId}`,
      "",
      "Cart:",
      ...lines,
      "",
      `First invoice: N$ ${account.monthlyTotal + account.yearlyTotal}`,
      body.notes?.trim() ? `\nNotes: ${body.notes.trim()}` : "",
    ].join("\n");

    console.info("[hosting-demo-order]", { orderId, email: body.email, items: body.items.length });

    try {
      await notifyContactInquiry({
        type: "purchase",
        name: body.name,
        email: body.email,
        phone: body.phone,
        subject: "hosting",
        packageId: body.items.find((i) => i.type === "plan")?.catalogId ?? "hosting-order",
        packageName: "Skyrapay Hosting Order",
        message,
      });
    } catch {
      // Demo orders succeed even if email is not configured
    }

    return NextResponse.json({
      demo: true,
      orderId,
      account,
      message: "Demo order placed. Your hosting account is being provisioned.",
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
    }
    return NextResponse.json({ error: "Order failed" }, { status: 500 });
  }
}
