/** Active promotional pricing — update when the special ends */
export const JUNE_PROMO = {
  active: true,
  percentOff: 30,
  title: "June launch special",
  subtitle: "30% off all packages for the whole of June",
  badge: "30% OFF",
} as const;

export function discountedPrice(original: number): number {
  if (!JUNE_PROMO.active || original <= 0) return original;
  return Math.round(original * (1 - JUNE_PROMO.percentOff / 100));
}

export function hasPromoPrice(original: number): boolean {
  return JUNE_PROMO.active && original > 0;
}

export function formatUsd(amount: number): string {
  return `$${amount.toLocaleString()}`;
}

export function formatNad(amount: number): string {
  return `N$ ${amount.toLocaleString("en-NA")}`;
}
