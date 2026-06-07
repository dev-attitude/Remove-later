"use client";

import Link from "next/link";
import { CheckCircle2, ShoppingCart } from "lucide-react";
import { PriceDisplay } from "@/components/marketing/PriceDisplay";
import { useHostingCart } from "@/lib/hosting-cart-context";
import { cartItemFromPackage } from "@/lib/hosting-demo";
import {
  HOSTING_OFFERINGS,
  HOSTING_WEBSITE_PLANS,
  type BusinessPackage,
} from "@/lib/site-content";

function PlanCard({ plan, type }: { plan: BusinessPackage; type: "plan" | "addon" }) {
  const { addItem, hasItem, removeItem } = useHostingCart();
  const lineId = `${type}-${plan.id}`;
  const inCart = hasItem(lineId);

  return (
    <article
      className={`marketing-service-card relative flex flex-col ${
        plan.popular ? "border-royal/40 ring-2 ring-sky/30" : ""
      }`}
    >
      {plan.popular && (
        <span className="absolute -top-3 right-4 rounded-full bg-royal px-3 py-0.5 text-xs font-bold text-white">
          Most popular
        </span>
      )}
      <h3 className="text-xl font-bold text-navy">{plan.name}</h3>
      <p className="mt-2 flex-1 text-sm text-slate-600">{plan.description}</p>
      <div className="mt-4">
        {plan.price > 0 ? (
          <PriceDisplay
            original={plan.price}
            currency="NAD"
            priceLabel={plan.priceLabel ?? "From"}
            size="md"
          />
        ) : (
          <p className="text-lg font-bold text-navy">{plan.priceLabel ?? "Included"}</p>
        )}
      </div>
      <ul className="mt-4 space-y-2 text-sm text-slate-700">
        {plan.includes.slice(0, 5).map((item) => (
          <li key={item} className="flex gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            {item}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() =>
          inCart ? removeItem(lineId) : addItem(cartItemFromPackage(plan, type))
        }
        className={`mt-6 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition ${
          inCart
            ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            : "border border-royal/30 bg-brand-50 text-navy hover:bg-sky/20"
        }`}
      >
        <ShoppingCart className="h-4 w-4" />
        {inCart ? "Remove from cart" : "Add to cart"}
      </button>
    </article>
  );
}

export function HostingPlansPanel() {
  return (
    <div className="space-y-16">
      <section>
        <h2 className="text-2xl font-bold text-navy">Website hosting packages</h2>
        <p className="mt-2 text-slate-600">
          Each plan includes cPanel, SSL, email, and MySQL databases. Select one plan per order.
        </p>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {HOSTING_WEBSITE_PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} type="plan" />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-navy">Add-on services</h2>
        <p className="mt-2 text-slate-600">
          Optional extras — backups, maintenance, or standalone email hosting.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {HOSTING_OFFERINGS.filter(
            (p) => !["hosting-website", "hosting-domain", "hosting-mysql", "hosting-ssl"].includes(p.id)
          ).map((plan) => (
            <PlanCard key={plan.id} plan={plan} type="addon" />
          ))}
        </div>
      </section>

      <div className="text-center">
        <Link href="/hosting/cart" className="marketing-btn-primary inline-flex">
          View cart & checkout
        </Link>
      </div>
    </div>
  );
}
