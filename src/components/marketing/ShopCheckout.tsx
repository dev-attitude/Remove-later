"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { PriceDisplay } from "@/components/marketing/PriceDisplay";
import { useHostingCurrency } from "@/lib/hosting-currency-context";
import { SHOP_PACKAGES } from "@/lib/site-content";

export function ShopCheckout() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const formRef = useRef<HTMLFormElement>(null);
  const packageParam = searchParams.get("package") ?? "";

  const defaultId = SHOP_PACKAGES.some((p) => p.id === packageParam)
    ? packageParam
    : SHOP_PACKAGES.find((p) => p.popular)?.id ?? SHOP_PACKAGES[1].id;

  const [selectedId, setSelectedId] = useState(defaultId);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const selected = SHOP_PACKAGES.find((p) => p.id === selectedId)!;
  const { formatPrice } = useHostingCurrency();

  useEffect(() => {
    if (packageParam && SHOP_PACKAGES.some((p) => p.id === packageParam)) {
      setSelectedId(packageParam);
    }
  }, [packageParam]);

  useEffect(() => {
    if (!packageParam) return;
    const t = window.setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
    return () => window.clearTimeout(t);
  }, [packageParam, pathname]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const priceNote =
      selected.priceTo != null && selected.priceTo > selected.priceFrom
        ? `${formatPrice(selected.priceFrom)} – ${formatPrice(selected.priceTo)}${selected.plusVat ? " + VAT" : ""}`
        : `${selected.priceLabel ? `${selected.priceLabel} ` : ""}${formatPrice(selected.priceFrom)}${selected.plusVat ? " + VAT" : ""}`;

    const message = [
      `Package: ${selected.name} (${selectedId})`,
      `Pricing: ${priceNote}`,
      `Timeline: ${selected.timeline}`,
      "",
      notes.trim() || "(No additional details provided)",
    ].join("\n");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "purchase",
          subject: "website",
          packageId: selectedId,
          packageName: selected.name,
          name,
          email,
          phone,
          message,
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
        <h2 className="mt-4 text-xl font-bold text-navy">Quote request received</h2>
        <p className="mt-2 text-slate-600">
          We&apos;ll contact you at <strong className="text-navy">{email}</strong>
          {phone ? (
            <>
              {" "}
              and <strong className="text-navy">{phone}</strong>
            </>
          ) : null}{" "}
          within one business day with a formal quote for{" "}
          <strong className="text-navy">{selected.name}</strong>.
        </p>
        <p className="mt-4 text-sm text-slate-500">
          Need a faster reply? Use the chat button — WhatsApp is available during business hours.
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
      <div>
        <label className="block text-sm font-medium text-navy">Select package *</label>
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
                    originalTo={pkg.priceTo}
                    priceLabel={pkg.priceLabel}
                    plusVat={pkg.plusVat}
                    size="sm"
                    showBaseNote={false}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="quote-name" className="block text-sm font-medium text-navy">
            Full name *
          </label>
          <input
            id="quote-name"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="marketing-input mt-1"
          />
        </div>
        <div>
          <label htmlFor="quote-email" className="block text-sm font-medium text-navy">
            Email *
          </label>
          <input
            id="quote-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="marketing-input mt-1"
          />
        </div>
      </div>

      <div>
        <label htmlFor="quote-phone" className="block text-sm font-medium text-navy">
          Phone / WhatsApp *
        </label>
        <input
          id="quote-phone"
          type="tel"
          required
          autoComplete="tel"
          placeholder="+264 81 123 4567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="marketing-input mt-1"
        />
      </div>

      <div>
        <label htmlFor="quote-notes" className="block text-sm font-medium text-navy">
          Project details
        </label>
        <textarea
          id="quote-notes"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Tell us about your business, pages needed, timeline, branding…"
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
            originalTo={selected.priceTo}
            priceLabel={selected.priceLabel}
            plusVat={selected.plusVat}
            size="sm"
            showBaseNote={false}
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">{selected.timeline}</p>
        <ul className="mt-3 space-y-1 text-xs text-slate-500">
          <li>• Quote sent to your email within one business day</li>
          <li>• Final price depends on scope and features you need</li>
          <li>• Payment arranged after you approve the quote</li>
        </ul>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={loading} className="marketing-btn-primary w-full justify-center">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending quote request…
          </>
        ) : (
          "Submit quote request"
        )}
      </button>
    </form>
  );
}
