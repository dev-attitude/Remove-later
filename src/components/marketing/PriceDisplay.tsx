"use client";

import { useHostingCurrency } from "@/lib/hosting-currency-context";
import { HOSTING_BASE_CURRENCY } from "@/lib/hosting-currency";
import { discountedPrice, hasPromoPrice, JUNE_PROMO } from "@/lib/pricing";

type PriceDisplayProps = {
  /** Amount stored in NAD (Namibian Dollar). */
  original: number;
  /** Upper bound for a price range (NAD). */
  originalTo?: number;
  priceLabel?: string;
  suffix?: string;
  plusVat?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  showBaseNote?: boolean;
};

export function PriceDisplay({
  original,
  originalTo,
  priceLabel = "From",
  suffix,
  plusVat = false,
  size = "md",
  className = "",
  showBaseNote = true,
}: PriceDisplayProps) {
  const { formatPrice, currency, isConverted } = useHostingCurrency();

  if (original <= 0) {
    return <p className={`font-bold text-navy ${className}`}>Quote on request</p>;
  }

  const isRange = originalTo != null && originalTo > original;
  const sale = discountedPrice(original);
  const saleTo = isRange ? discountedPrice(originalTo) : null;
  const showPromo = hasPromoPrice(original) && !isRange;

  const sizeClasses = {
    sm: { original: "text-sm", sale: "text-lg", badge: "text-[10px] px-1.5 py-0.5" },
    md: { original: "text-base", sale: "text-2xl", badge: "text-xs px-2 py-0.5" },
    lg: { original: "text-lg", sale: "text-3xl", badge: "text-xs px-2.5 py-1" },
  }[size];

  const vatSuffix = plusVat ? " + VAT" : "";

  function renderAmount(from: number, to?: number | null) {
    if (to != null && to > from) {
      return `${formatPrice(from, suffix)} – ${formatPrice(to, suffix)}${vatSuffix}`;
    }
    return `${formatPrice(from, suffix)}${vatSuffix}`;
  }

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
        {!isRange && priceLabel && (
          <span className="text-sm font-medium text-slate-500">{priceLabel}</span>
        )}
        {showPromo ? (
          <>
            <span className={`font-bold text-royal ${sizeClasses.sale}`}>
              {renderAmount(sale, saleTo)}
            </span>
            <span className={`text-slate-400 line-through ${sizeClasses.original}`}>
              {renderAmount(original, originalTo)}
            </span>
          </>
        ) : (
          <span className={`font-bold text-royal ${sizeClasses.sale}`}>
            {renderAmount(original, isRange ? originalTo : null)}
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
