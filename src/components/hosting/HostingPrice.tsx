"use client";

import { useHostingCurrency } from "@/lib/hosting-currency-context";
import { HOSTING_BASE_CURRENCY } from "@/lib/hosting-currency";

type HostingPriceProps = {
  amountNad: number;
  priceLabel?: string;
  suffix?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  showBaseNote?: boolean;
};

export function HostingPrice({
  amountNad,
  priceLabel,
  suffix,
  size = "md",
  className = "",
  showBaseNote = true,
}: HostingPriceProps) {
  const { formatPrice, currency, isConverted } = useHostingCurrency();

  if (amountNad <= 0) {
    return <p className={`font-bold text-navy ${className}`}>Quote on request</p>;
  }

  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  }[size];

  return (
    <div className={className}>
      <div className="flex flex-wrap items-baseline gap-2">
        {priceLabel && (
          <span className="text-sm font-medium text-muted">{priceLabel}</span>
        )}
        <span className={`font-bold text-royal ${sizeClasses}`}>
          {formatPrice(amountNad, suffix)}
        </span>
      </div>
      {showBaseNote && isConverted && (
        <p className="mt-1 text-xs text-muted">
          Approx. rate · invoiced in {HOSTING_BASE_CURRENCY}
        </p>
      )}
      {showBaseNote && !isConverted && currency === HOSTING_BASE_CURRENCY && (
        <p className="mt-1 text-xs text-muted">{currency}</p>
      )}
    </div>
  );
}
