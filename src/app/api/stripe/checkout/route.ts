import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getStripe, STRIPE_PRICE_MAP } from "@/lib/stripe";
import { config } from "@/lib/config";
import { isPortalId } from "@/lib/portals";

const schema = z.object({
  portal: z.string(),
  tierId: z.string(),
});

export async function POST(req: Request) {
  try {
    const { portal, tierId } = schema.parse(await req.json());

    if (!isPortalId(portal)) {
      return NextResponse.json({ error: "Invalid portal" }, { status: 400 });
    }

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Sign in to subscribe" }, { status: 401 });
    }

    const stripe = getStripe();
    const priceId = STRIPE_PRICE_MAP[tierId];

    if (!stripe || !priceId) {
      return NextResponse.json({
        demo: true,
        url: null,
        message:
          "Demo mode: configure STRIPE_SECRET_KEY and price IDs in .env to enable live billing.",
      });
    }

    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: session.user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${config.auth.url}/${portal}/subscription?success=1`,
      cancel_url: `${config.auth.url}/${portal}/subscription?canceled=1`,
      metadata: { portal, tierId, userId: session.user.id },
    });

    return NextResponse.json({ demo: false, url: checkout.url });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    console.error("[stripe/checkout]", e);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
