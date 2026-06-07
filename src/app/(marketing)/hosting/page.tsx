import Link from "next/link";
import { CheckCircle2, Cloud, Mail, Server, Shield, Zap } from "lucide-react";
import { PriceDisplay } from "@/components/marketing/PriceDisplay";
import { BRAND } from "@/lib/brand";
import { COMPANY, HOSTING_HIGHLIGHTS, HOSTING_INCLUDED, HOSTING_PLANS } from "@/lib/site-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Web Hosting | ${BRAND.companyName}`,
  description:
    "Business web hosting, email, SSL, and VPS plans in Namibia. Reliable hosting with local support from Skyrapay Consultations CC.",
};

const FEATURE_ICONS = [Shield, Zap, Mail] as const;

export default function HostingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
      <div className="max-w-3xl">
        <p className="marketing-eyebrow">Hosting</p>
        <h1 className="marketing-page-title">Web hosting for Namibian businesses</h1>
        <p className="mt-4 marketing-lead">
          Keep your website, email, and domain running smoothly—with SSL, backups, and support from
          our team in {COMPANY.location}. Choose a plan that fits today and upgrade as you grow.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {HOSTING_HIGHLIGHTS.map((item, i) => {
          const Icon = FEATURE_ICONS[i] ?? Cloud;
          return (
            <article
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-navy">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.text}</p>
            </article>
          );
        })}
      </div>

      <div className="mt-20">
        <p className="marketing-eyebrow">Plans</p>
        <h2 className="mt-2 text-3xl font-bold text-navy">Hosting packages</h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          All prices in Namibian Dollars (NAD), billed monthly. Annual billing available on
          request—ask about a discount when you sign up for 12 months.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
        {HOSTING_PLANS.map((plan) => (
          <article
            key={plan.id}
            className={`marketing-service-card relative flex flex-col ${
              plan.popular ? "border-royal/40 ring-2 ring-sky/30" : ""
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 right-4 rounded-full bg-royal px-3 py-0.5 text-xs font-bold text-white">
                Most popular
              </span>
            )}
            <Cloud className="h-8 w-8 text-royal" />
            <h3 className="mt-4 text-xl font-bold text-navy">{plan.name}</h3>
            <p className="mt-2 flex-1 text-sm text-slate-600">{plan.description}</p>
            <div className="mt-4">
              <PriceDisplay
                original={plan.price}
                currency="NAD"
                priceLabel={plan.priceLabel ?? "Per month"}
                size="md"
              />
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
              href={`/contact?service=hosting&package=${plan.id}`}
              className="mt-6 block rounded-lg border border-royal/30 bg-brand-50 py-2.5 text-center text-sm font-semibold text-navy transition hover:bg-sky/20"
            >
              Order this plan
            </Link>
          </article>
        ))}
      </div>

      <div className="mt-20 rounded-2xl border border-slate-200 bg-slate-50 p-8 md:p-10">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
            <Server className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold text-navy">Included with every plan</h2>
            <p className="mt-2 text-slate-600">
              Whether you host a simple brochure site or a full web application, you get the
              essentials to stay secure and professional online.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {HOSTING_INCLUDED.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-16 rounded-2xl bg-gradient-to-r from-navy to-royal p-8 text-center text-white md:p-12">
        <h2 className="text-2xl font-bold md:text-3xl">Need a website and hosting together?</h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-200">
          We design and build business websites, then host and maintain them for you—one team from
          launch to ongoing care.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/shop" className="marketing-btn-secondary">
            View website packages
          </Link>
          <Link
            href="/contact?service=hosting"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-navy transition hover:bg-sky/90"
          >
            Talk to us about hosting
          </Link>
        </div>
      </div>
    </div>
  );
}
