import Link from "next/link";
import type { Metadata } from "next";
import { BRAND, SKYRAPAY_HOSTING } from "@/lib/brand";
import { HostingCurrencyStrip } from "@/components/hosting/HostingCurrencyStrip";
import { EntryPriceTables, StarterBundleBanner } from "@/components/hosting/EntryPriceList";

export const metadata: Metadata = {
  title: `Price List | ${SKYRAPAY_HOSTING.label}`,
  description:
    "Entry-level pricing for hosting, domains, email, websites, cybersecurity, IT support, and business services — Skyrapay Consultations, Namibia.",
};

export default function HostingPricingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
      <div className="max-w-3xl">
        <p className="marketing-eyebrow">Price list</p>
        <h1 className="marketing-page-title">Simple, affordable entry pricing</h1>
        <p className="mt-4 marketing-lead">
          Transparent launch prices from {BRAND.companyLegal} — realistic for small businesses,
          with premium tiers available as you grow. Prices are shown in your local currency and
          invoiced in Namibian Dollars; quotes available on request.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/hosting/domains" className="marketing-btn-primary text-sm">
            Start an order
          </Link>
          <Link href="/quote" className="marketing-btn-secondary text-sm">
            Request a quote
          </Link>
        </div>
      </div>

      <div className="mt-10">
        <HostingCurrencyStrip />
      </div>

      <div className="mt-4">
        <StarterBundleBanner />
      </div>

      <div className="mt-16">
        <EntryPriceTables />
      </div>

      <div className="mt-16 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center md:p-10">
        <h2 className="text-2xl font-bold text-navy">Need something not listed?</h2>
        <p className="mx-auto mt-2 max-w-xl text-slate-600">
          Custom systems, larger projects, and monthly retainers are quoted individually. Tell us
          what you need and we&apos;ll send a same-week quotation.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <Link href="/quote" className="marketing-btn-primary">
            Request a quote
          </Link>
          <Link href="/contact" className="marketing-btn-secondary">
            Contact us
          </Link>
        </div>
      </div>
    </div>
  );
}
