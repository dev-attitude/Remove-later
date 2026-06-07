"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { HostingPrice } from "@/components/hosting/HostingPrice";
import type { BusinessPackage } from "@/lib/site-content";

export function HostingOfferingCard({
  plan,
  icon: Icon,
}: {
  plan: BusinessPackage;
  icon: LucideIcon;
}) {
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
      <Icon className="h-8 w-8 text-royal" />
      <h3 className="mt-4 text-xl font-bold text-navy">{plan.name}</h3>
      <p className="mt-2 flex-1 text-sm text-slate-600">{plan.description}</p>
      <div className="mt-4">
        {plan.price > 0 ? (
          <HostingPrice
            amountNad={plan.price}
            priceLabel={plan.priceLabel ?? "From"}
            size="md"
          />
        ) : (
          <p className="text-lg font-bold text-navy">{plan.priceLabel ?? "Included with hosting"}</p>
        )}
      </div>
      <ul className="mt-4 space-y-2 text-sm text-slate-700">
        {plan.includes.map((item) => (
          <li key={item} className="flex gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            {item}
          </li>
        ))}
      </ul>
      <Link
        href={
          plan.id === "hosting-domain"
            ? "/hosting/domains"
            : "/hosting/plans"
        }
        className="mt-6 block rounded-lg border border-royal/30 bg-brand-50 py-2.5 text-center text-sm font-semibold text-navy transition hover:bg-sky/20"
      >
        {plan.id === "hosting-domain" ? "Buy your own domain name" : "Add to order"}
      </Link>
    </article>
  );
}
