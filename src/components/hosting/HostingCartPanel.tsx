"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useHostingCart } from "@/lib/hosting-cart-context";
import { formatHostingPeriod } from "@/lib/hosting-demo";
import { useHostingCurrency } from "@/lib/hosting-currency-context";

export function HostingCartPanel() {
  const { items, removeItem, totals, itemCount } = useHostingCart();
  const { formatPrice } = useHostingCurrency();

  if (itemCount === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
        <p className="text-lg font-semibold text-navy">Your cart is empty</p>
        <p className="mt-2 text-slate-600">Start by searching for a domain or choosing a hosting plan.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/hosting/domains" className="marketing-btn-primary">
            Buy your own domain name
          </Link>
          <Link href="/hosting/plans" className="marketing-btn-secondary">
            View hosting plans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <ul className="divide-y divide-slate-100">
            {items.map((item) => (
              <li key={item.lineId} className="flex items-start justify-between gap-4 px-5 py-4">
                <div>
                  <p className="font-semibold text-navy">{item.name}</p>
                  <p className="text-xs capitalize text-slate-500">{item.type}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-sm font-bold text-navy">
                    {formatPrice(item.price, formatHostingPeriod(item.period))}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeItem(item.lineId)}
                    className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-lg font-bold text-navy">Order summary</h2>
        <dl className="mt-4 space-y-2 text-sm">
          {totals.monthly > 0 && (
            <div className="flex justify-between">
              <dt className="text-slate-600">Monthly</dt>
              <dd className="font-semibold text-navy">{formatPrice(totals.monthly, "/mo")}</dd>
            </div>
          )}
          {totals.yearly > 0 && (
            <div className="flex justify-between">
              <dt className="text-slate-600">Yearly</dt>
              <dd className="font-semibold text-navy">{formatPrice(totals.yearly, "/yr")}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-slate-200 pt-3">
            <dt className="font-semibold text-navy">Due today</dt>
            <dd className="font-bold text-navy">{formatPrice(totals.firstInvoice)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-slate-500">
          Payment instructions are sent by email after checkout. Monthly and yearly items are billed
          as shown.
        </p>
        <Link href="/hosting/checkout" className="marketing-btn-primary mt-6 block w-full text-center">
          Proceed to checkout
        </Link>
      </div>
    </div>
  );
}
