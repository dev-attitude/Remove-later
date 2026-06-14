"use client";

import { useHostingCurrency } from "@/lib/hosting-currency-context";
import { HOSTING_BASE_CURRENCY } from "@/lib/hosting-currency";
import { discountedPrice, hasPromoPrice, JUNE_PROMO } from "@/lib/pricing";

type PriceDisplayProps = {
  /** Amount stored in NAD (Namibian Dollar). */
  original: number;
  priceLabel?: string;
  suffix?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  showBaseNote?: boolean;
};

export function PriceDisplay({
  original,
  priceLabel = "From",
  suffix,
  size = "md",
  className = "",
  showBaseNote = true,
}: PriceDisplayProps) {
  const { formatPrice, currency, isConverted } = useHostingCurrency();

  if (original <= 0) {
    return <p className={`font-bold text-navy ${className}`}>Quote on request</p>;
  }

  const sale = discountedPrice(original);
  const showPromo = hasPromoPrice(original);

  const sizeClasses = {
    sm: { original: "text-sm", sale: "text-lg", badge: "text-[10px] px-1.5 py-0.5" },
    md: { original: "text-base", sale: "text-2xl", badge: "text-xs px-2 py-0.5" },
    lg: { original: "text-lg", sale: "text-3xl", badge: "text-xs px-2.5 py-1" },
  }[size];

  return (
    <div className={className}>
      {showPromo && (
        <span
          className={`mb-2 inline-block rounded-full bg-amber-500 font-bold uppercase tracking-wide text-navy ${sizeClasses.badge}`}
        >
          {JUNE_PROMO.badge}
        </span>
      )}
      <div className="flex flex-wrap items-baseline gap-2">
        {priceLabel && (
          <span className="text-sm font-medium text-slate-500">{priceLabel}</span>
        )}
        {showPromo ? (
          <>
            <span className={`font-bold text-royal ${sizeClasses.sale}`}>
              {formatPrice(sale, suffix)}
            </span>
            <span className={`text-slate-400 line-through ${sizeClasses.original}`}>
              {formatPrice(original, suffix)}
            </span>
          </>
        ) : (
          <span className={`font-bold text-royal ${sizeClasses.sale}`}>
            {formatPrice(original, suffix)}
          </span>
        )}
      </div>
      {showPromo && (
        <p className="mt-1 text-xs text-emerald-700">June special — save {JUNE_PROMO.percentOff}%</p>
      )}
      {showBaseNote && isConverted && (
        <p className="mt-1 text-xs text-slate-500">
          Approx. rate · invoiced in {HOSTING_BASE_CURRENCY}
        </p>
      )}
      {showBaseNote && !isConverted && currency === HOSTING_BASE_CURRENCY && size !== "sm" && (
        <p className="mt-1 text-xs text-slate-500">{currency}</p>
      )}
    </div>
  );
}
