"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { PriceDisplay } from "@/components/marketing/PriceDisplay";
import { PromoBanner } from "@/components/marketing/PromoBanner";
import {
  discountedPrice,
  formatUsd,
  hasPromoPrice,
  JUNE_PROMO,
} from "@/lib/pricing";
import { SHOP_PACKAGES } from "@/lib/site-content";

export function ShopCheckout() {
  const searchParams = useSearchParams();
  const initialPackage = searchParams.get("package") ?? "";
  const [selectedId, setSelectedId] = useState(
    SHOP_PACKAGES.some((p) => p.id === initialPackage) ? initialPackage : SHOP_PACKAGES[1].id
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const selected = SHOP_PACKAGES.find((p) => p.id === selectedId)!;
  const salePrice = discountedPrice(selected.priceFrom);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const priceNote = hasPromoPrice(selected.priceFrom)
      ? `June special: ${formatUsd(salePrice)} (was ${formatUsd(selected.priceFrom)}, ${JUNE_PROMO.percentOff}% off)`
      : `${selected.priceLabel} ${formatUsd(selected.priceFrom)}`;

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "purchase",
          packageId: selectedId,
          packageName: selected.name,
          name,
          email,
          phone,
          message: `${priceNote}\n\n${notes}`.trim(),
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-10 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
        <h2 className="mt-4 text-xl font-bold text-navy">Request received</h2>
        <p className="mt-2 text-slate-600">
          We&apos;ll contact you at <strong className="text-navy">{email}</strong> within one
          business day with a formal quote for <strong className="text-navy">{selected.name}</strong>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <PromoBanner />

      <div>
        <label className="block text-sm font-medium text-navy">Select package</label>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {SHOP_PACKAGES.map((pkg) => {
            const isSelected = selectedId === pkg.id;
            return (
              <button
                key={pkg.id}
                type="button"
                onClick={() => setSelectedId(pkg.id)}
                className={`overflow-hidden rounded-xl border text-left transition ${
                  isSelected
                    ? "border-royal ring-2 ring-sky/40 shadow-md"
                    : "border-slate-200 bg-white hover:border-sky/60"
                }`}
              >
                <div
                  className={`px-4 py-2.5 ${
                    isSelected
                      ? "border-b border-royal/20 bg-sky/25"
                      : "border-b border-slate-100 bg-slate-50"
                  }`}
                >
                  <p
                    className={`font-semibold ${
                      isSelected ? "text-navy" : "text-slate-700"
                    }`}
                  >
                    {pkg.name}
                    {isSelected && (
                      <span className="ml-2 text-xs font-bold uppercase text-royal">
                        Selected
                      </span>
                    )}
                  </p>
                </div>
                <div className="bg-white p-4">
                  <PriceDisplay
                    original={pkg.priceFrom}
                    currency="USD"
                    priceLabel={pkg.priceLabel}
                    size="sm"
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-navy">
            Full name *
          </label>
          <input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="marketing-input mt-1"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-navy">
            Email *
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="marketing-input mt-1"
          />
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-navy">
          Phone / WhatsApp
        </label>
        <input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="marketing-input mt-1"
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-navy">
          Project details
        </label>
        <textarea
          id="notes"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Tell us about your business, pages needed, timeline…"
          className="marketing-input mt-1 resize-y"
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        <p>
          Selected: <span className="font-semibold text-navy">{selected.name}</span>
        </p>
        <div className="mt-2">
          <PriceDisplay
            original={selected.priceFrom}
            currency="USD"
            priceLabel={selected.priceLabel}
            size="sm"
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">{selected.timeline}</p>
        <p className="mt-2">
          This is a quote request. Final pricing depends on scope. Online card payment can be
          arranged after approval.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={loading} className="marketing-btn-primary w-full justify-center">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending…
          </>
        ) : (
          "Request quote & purchase details"
        )}
      </button>
    </form>
  );
}
