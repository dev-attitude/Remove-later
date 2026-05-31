import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { config } from "@/lib/config";
import { prisma } from "@/lib/db";
import type Stripe from "stripe";

export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe || !config.stripe.webhookSecret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, config.stripe.webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const portal = session.metadata?.portal;
    const tierId = session.metadata?.tierId;

    if (userId && portal && tierId) {
      await prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          portal,
          tierId,
          status: "active",
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
        },
        update: {
          portal,
          tierId,
          status: "active",
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
