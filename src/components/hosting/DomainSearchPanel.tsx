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

  return (
    <div>
      <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your domain — e.g. mybusiness"
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
        <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-sm font-semibold text-navy">
              Results for &ldquo;{query.trim().toLowerCase()}&rdquo;
            </p>
            <p className="text-xs text-slate-500">
              Prices in {currency} — availability updated in real time
            </p>
          </div>
          <ul className="divide-y divide-slate-100">
            {results.map((r) => {
              const lineId = `domain-${r.domain}`;
              const inCart = hasItem(lineId);
              return (
                <li
                  key={r.domain}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-4"
                >
                  <div className="flex items-center gap-3">
                    {r.available ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400" />
                    )}
                    <div>
                      <p className="font-semibold text-navy">{r.domain}</p>
                      <p className="text-xs text-slate-500">
                        {r.available ? "Available" : "Taken"}
                        {r.premium ? " · Premium domain" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-bold text-navy">
                      {formatPrice(r.priceNad, formatHostingPeriod("year"))}
                    </p>
                    {r.available &&
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
                          onClick={() => addItem(cartItemFromDomain(r))}
                          className="flex items-center gap-1.5 rounded-lg bg-royal px-3 py-1.5 text-sm font-semibold text-white hover:bg-navy"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Add to cart
                        </button>
                      ))}
                  </div>
                </li>
              );
            })}
          </ul>
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
