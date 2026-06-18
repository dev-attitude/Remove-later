"use client";

import { Globe } from "lucide-react";
import { CURRENCY_OPTIONS } from "@/lib/hosting-currency";
import { useHostingCurrency } from "@/lib/hosting-currency-context";

export function HostingCurrencyBar() {
  const { country, currency, setCurrency, isConverted } = useHostingCurrency();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-cream px-4 py-2 text-xs text-muted md:px-8">
      <p className="flex items-center gap-1.5">
        <Globe className="h-3.5 w-3.5 text-charcoal/60" />
        Prices for your region
        {country ? ` (${country})` : ""}
        {isConverted ? " — converted automatically" : ""}
      </p>
      <label className="flex items-center gap-2">
        <span className="sr-only">Display currency</span>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value as typeof currency)}
          className="rounded-md border border-line bg-cream-50 px-2 py-1 text-xs font-normal text-charcoal"
          aria-label="Display currency"
        >
          {CURRENCY_OPTIONS.map(({ code, label }) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
