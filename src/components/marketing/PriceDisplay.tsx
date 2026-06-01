import { discountedPrice, formatNad, formatUsd, hasPromoPrice, JUNE_PROMO } from "@/lib/pricing";

type PriceDisplayProps = {
  original: number;
  currency: "USD" | "NAD";
  priceLabel?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function PriceDisplay({
  original,
  currency,
  priceLabel = "From",
  size = "md",
  className = "",
}: PriceDisplayProps) {
  if (original <= 0) {
    return <p className={`font-bold text-navy ${className}`}>Quote on request</p>;
  }

  const sale = discountedPrice(original);
  const showPromo = hasPromoPrice(original);
  const format = currency === "NAD" ? formatNad : formatUsd;

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
            <span className={`font-bold text-royal ${sizeClasses.sale}`}>{format(sale)}</span>
            <span className={`text-slate-400 line-through ${sizeClasses.original}`}>
              {format(original)}
            </span>
          </>
        ) : (
          <span className={`font-bold text-royal ${sizeClasses.sale}`}>{format(original)}</span>
        )}
        {currency === "USD" && size !== "sm" && (
          <span className="text-sm font-normal text-slate-500">USD</span>
        )}
      </div>
      {showPromo && (
        <p className="mt-1 text-xs text-emerald-700">June special — save {JUNE_PROMO.percentOff}%</p>
      )}
    </div>
  );
}
