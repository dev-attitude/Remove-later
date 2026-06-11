"use client";

import Link from "next/link";
import { CheckCircle2, Sparkles } from "lucide-react";
import { ENTRY_PRICE_LIST, STARTER_BUNDLE } from "@/lib/site-content";
import { HOSTING_BASE_CURRENCY } from "@/lib/hosting-currency";
import { useHostingCurrency } from "@/lib/hosting-currency-context";

export function StarterBundleBanner() {
  const { formatPrice } = useHostingCurrency();

  return (
    <div className="rounded-2xl bg-gradient-to-r from-navy to-royal p-8 text-white md:p-10">
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
          <p className="text-3xl font-bold">
            {formatPrice(STARTER_BUNDLE.upfrontNad)}{" "}
            <span className="text-base font-semibold text-slate-200">upfront</span>
          </p>
          <p className="mt-1 text-lg text-slate-200">
            + {formatPrice(STARTER_BUNDLE.monthlyNad, "/month")}
          </p>
          <Link
            href="/contact?service=startup-package"
            className="mt-4 inline-block rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-navy transition hover:bg-sky/90"
          >
            Get this bundle
          </Link>
        </div>
      </div>
    </div>
  );
}

export function EntryPriceTables() {
  const { formatPrice, currency, isConverted } = useHostingCurrency();

  return (
    <div>
      <div className="grid gap-8 md:grid-cols-2">
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
                    <td className="px-5 py-2.5 text-right font-semibold text-navy">
                      {row.amountNad <= 0 ? "Free" : formatPrice(row.amountNad, row.suffix)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}
      </div>
      {isConverted && (
        <p className="mt-6 text-center text-xs text-slate-500">
          Prices shown in {currency} at an approximate exchange rate for your region. Invoices are
          issued in {HOSTING_BASE_CURRENCY} (Namibian Dollar).
        </p>
      )}
    </div>
  );
}
