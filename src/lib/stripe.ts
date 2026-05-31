import Stripe from "stripe";
import { config } from "@/lib/config";

export function getStripe() {
  if (!config.stripe.secretKey) return null;
  return new Stripe(config.stripe.secretKey);
}

/** Map tier IDs to Stripe Price env vars */
export const STRIPE_PRICE_MAP: Record<string, string | undefined> = {
  "stu-pro": process.env.STRIPE_PRICE_STU_PRO,
  "stu-assistant": process.env.STRIPE_PRICE_STU_ASSISTANT,
  "inst-supervisor": process.env.STRIPE_PRICE_INST_SUPERVISOR,
  "inst-marker": process.env.STRIPE_PRICE_INST_MARKER,
  "ana-pro": process.env.STRIPE_PRICE_ANA_PRO,
};
