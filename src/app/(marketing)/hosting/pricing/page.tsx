import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, Sparkles } from "lucide-react";
import { BRAND, SKYRAPAY_HOSTING } from "@/lib/brand";
import { ENTRY_PRICE_LIST, STARTER_BUNDLE } from "@/lib/site-content";

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
          Transparent launch prices from {BRAND.companyLegal} — realistic for Namibian small
          businesses, with premium tiers available as you grow. All prices in NAD; quotes available
          on request.
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

      <div className="mt-12 rounded-2xl bg-gradient-to-r from-navy to-royal p-8 text-white md:p-10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-xl">
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-sky">
              <Sparkles className="h-4 w-4" /> Recommended starter bundle
            </p>
            <h2 className="mt-2 text-2xl font-bold md:text-3xl">{STARTER_BUNDLE.name}</h2>
            <p className="mt-2 text-slate-200">{STARTER_BUNDLE.audience}</p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {STARTER_BUNDLE.includes.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-slate-100">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl bg-white/10 p-6 text-center">
            <p className="text-3xl font-bold">{STARTER_BUNDLE.priceUpfront}</p>
            <p className="mt-1 text-lg text-slate-200">+ {STARTER_BUNDLE.priceMonthly}</p>
            <Link
              href="/contact?service=startup-package"
              className="mt-4 inline-block rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-navy transition hover:bg-sky/90"
            >
              Get this bundle
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-2">
        {ENTRY_PRICE_LIST.map((cat) => (
          <section
            key={cat.id}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <h2 className="border-b border-slate-200 bg-slate-50 px-5 py-3 text-base font-bold text-navy">
              {cat.title}
            </h2>
            <table className="min-w-full text-sm">
              <tbody>
                {cat.rows.map((row) => (
                  <tr key={row.service} className="border-b border-slate-100 last:border-0">
                    <td className="px-5 py-2.5 text-slate-700">{row.service}</td>
                    <td className="px-5 py-2.5 text-right font-semibold text-navy">{row.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}
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
