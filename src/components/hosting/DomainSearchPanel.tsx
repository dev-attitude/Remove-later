"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, Search, ShoppingCart, XCircle } from "lucide-react";
import { useHostingCurrency } from "@/lib/hosting-currency-context";
import { useHostingCart } from "@/lib/hosting-cart-context";
import {
  cartItemFromDomain,
  type DomainSearchResult,
  formatHostingPeriod,
} from "@/lib/hosting-demo";

function DomainPrice({
  result,
  formatPrice,
}: {
  result: DomainSearchResult;
  formatPrice: (amountNad: number, suffix?: string) => string;
}) {
  return (
    <div className="text-right">
      <p className="text-base font-bold text-navy">
        {formatPrice(result.priceNad, formatHostingPeriod("year"))}
      </p>
      {result.retailPriceNad != null && result.retailPriceNad > result.priceNad && (
        <p className="text-xs text-slate-400 line-through">
          Retail {formatPrice(result.retailPriceNad, formatHostingPeriod("year"))}
        </p>
      )}
    </div>
  );
}

function DomainRow({
  result,
  formatPrice,
  hasItem,
  addItem,
  removeItem,
  highlight,
}: {
  result: DomainSearchResult;
  formatPrice: (amountNad: number, suffix?: string) => string;
  hasItem: (lineId: string) => boolean;
  addItem: (item: ReturnType<typeof cartItemFromDomain>) => void;
  removeItem: (lineId: string) => void;
  highlight?: boolean;
}) {
  const lineId = `domain-${result.domain}`;
  const inCart = hasItem(lineId);

  return (
    <li
      className={`flex flex-wrap items-center justify-between gap-3 px-4 py-4 ${
        highlight ? "bg-brand-50/40" : ""
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        {result.available ? (
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
        ) : (
          <XCircle className="h-5 w-5 shrink-0 text-red-400" />
        )}
        <div className="min-w-0">
          <p className="truncate font-semibold text-navy">{result.domain}</p>
          <p className="text-xs text-slate-500">
            {result.available ? "Available" : "Taken"}
            {result.premium ? " · Premium" : ""}
            {result.isNa ? " · Namibian namespace" : ""}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <DomainPrice result={result} formatPrice={formatPrice} />
        {result.available &&
          (inCart ? (
            <button
              type="button"
              onClick={() => removeItem(lineId)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Remove
            </button>
          ) : (
            <button
              type="button"
              onClick={() => addItem(cartItemFromDomain(result))}
              className="flex items-center gap-1.5 rounded-lg bg-royal px-3 py-1.5 text-sm font-semibold text-white hover:bg-navy"
            >
              <ShoppingCart className="h-4 w-4" />
              Add to cart
            </button>
          ))}
      </div>
    </li>
  );
}

export function DomainSearchPanel() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DomainSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const { addItem, hasItem, removeItem } = useHostingCart();
  const { formatPrice, currency } = useHostingCurrency();

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length < 2) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/hosting/domains/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });
      const data = (await res.json()) as {
        results?: DomainSearchResult[];
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Search failed");
      setResults(data.results ?? []);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  const primary = results[0];
  const suggested = results.slice(1).filter((r) => !r.isNa);
  const naPremium = results.filter((r) => r.isNa);

  const rowProps = { formatPrice, hasItem, addItem, removeItem };

  return (
    <div>
      <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your domain — e.g. mybusiness or skyrapay"
            className="marketing-input w-full pl-10"
            minLength={2}
            required
          />
        </div>
        <button type="submit" disabled={loading} className="marketing-btn-primary shrink-0">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching…
            </>
          ) : (
            "Search domains"
          )}
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {searched && results.length === 0 && (
        <p className="mt-6 text-sm text-slate-600">Enter at least 2 characters to search.</p>
      )}

      {results.length > 0 && (
        <div className="mt-8 space-y-6">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-sm font-semibold text-navy">
                Results for &ldquo;{query.trim().toLowerCase()}&rdquo;
              </p>
              <p className="text-xs text-slate-500">
                Prices in {currency} per year — each extension has its own rate.{" "}
                <span className="font-medium text-navy">.na domains are premium.</span>
              </p>
            </div>

            {primary && (
              <ul className="divide-y divide-slate-100">
                <DomainRow result={primary} {...rowProps} highlight />
              </ul>
            )}
          </div>

          {suggested.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-sm font-semibold text-navy">Suggested extensions</p>
                <p className="text-xs text-slate-500">
                  International domains — from {formatPrice(159.85, "/yr")}
                </p>
              </div>
              <ul className="divide-y divide-slate-100">
                {suggested.map((r) => (
                  <DomainRow key={r.domain} result={r} {...rowProps} />
                ))}
              </ul>
            </div>
          )}

          {naPremium.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm">
              <div className="border-b border-amber-100 bg-amber-50 px-4 py-3">
                <p className="text-sm font-semibold text-navy">Namibian domains (.na)</p>
                <p className="text-xs text-slate-600">
                  Official .na namespace — premium pricing up to{" "}
                  {formatPrice(450, "/yr")}
                </p>
              </div>
              <ul className="divide-y divide-slate-100">
                {naPremium.map((r) => (
                  <DomainRow key={r.domain} result={r} {...rowProps} />
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {results.some((r) => r.available) && (
        <div className="mt-6 text-center">
          <Link href="/hosting/cart" className="marketing-btn-primary inline-flex">
            Continue to cart
          </Link>
        </div>
      )}
    </div>
  );
}
