/**
 * Domain registration pricing by TLD (NAD/year).
 * .na extensions are premium — most expensive in the catalogue (up to N$450).
 */

export type DomainTld = {
  ext: string;
  label: string;
  /** Your selling price (NAD/year) */
  priceNad: number;
  /** Optional higher retail for display (strikethrough) */
  retailNad?: number;
  /** Premium Namibian namespace — shown in a separate group */
  isNa?: boolean;
};

/** All supported TLDs — sorted cheapest → most expensive for search results */
export const DOMAIN_TLD_CATALOG: DomainTld[] = [
  { ext: ".co.za", label: ".co.za", priceNad: 159.85, retailNad: 199 },
  { ext: ".org", label: ".org", priceNad: 199, retailNad: 249 },
  { ext: ".net", label: ".net", priceNad: 249, retailNad: 299 },
  { ext: ".com", label: ".com", priceNad: 299, retailNad: 349 },
  { ext: ".africa", label: ".africa", priceNad: 349, retailNad: 399 },
  { ext: ".org.na", label: ".org.na", priceNad: 399, retailNad: 450, isNa: true },
  { ext: ".com.na", label: ".com.na", priceNad: 450, retailNad: 520, isNa: true },
];

/** @deprecated Use DOMAIN_TLD_CATALOG — kept for cart/catalog helpers */
export const HOSTING_TLDS = DOMAIN_TLD_CATALOG.map((t) => ({
  ext: t.ext,
  price: t.priceNad,
  label: t.label,
}));

export function getTldConfig(ext: string): DomainTld | undefined {
  return DOMAIN_TLD_CATALOG.find((t) => t.ext === ext);
}

export function getDomainPriceNad(ext: string, options?: { premium?: boolean }): number {
  const tld = getTldConfig(ext);
  const base = tld?.priceNad ?? 299;
  if (options?.premium) {
    const boosted = Math.round(base * 1.25 * 100) / 100;
    return Math.min(boosted, 450);
  }
  return base;
}

export function getDomainRetailNad(ext: string): number | undefined {
  return getTldConfig(ext)?.retailNad;
}

export function isNaTld(ext: string): boolean {
  return Boolean(getTldConfig(ext)?.isNa ?? ext.endsWith(".na"));
}

/** Price list rows for /hosting/pricing */
export function domainPriceListRows() {
  return DOMAIN_TLD_CATALOG.map((t) => ({
    service: `${t.label} Domain Registration`,
    amountNad: t.priceNad,
    suffix: "/year" as const,
  }));
}
