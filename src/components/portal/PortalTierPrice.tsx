"use client";

import { useHostingCurrency } from "@/lib/hosting-currency-context";
import { usdToNad } from "@/lib/hosting-currency";
import type { SubscriptionTier } from "@/lib/portals";

type PortalTierPriceProps = {
  tier: SubscriptionTier;
  className?: string;
  suffix?: string;
  prefix?: string;
};

export function PortalTierPrice({
  tier,
  className = "",
  suffix = "/mo",
  prefix,
}: PortalTierPriceProps) {
  const { formatPrice } = useHostingCurrency();

  if (tier.priceMonthly === "custom") {
    return <span className={className}>Custom pricing</span>;
  }
  if (tier.priceMonthly === 0) {
    return <span className={className}>Free</span>;
  }

  const formatted = formatPrice(usdToNad(tier.priceMonthly), suffix);
  return (
    <span className={className}>
      {prefix}
      {formatted}
    </span>
  );
}
