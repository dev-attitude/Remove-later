import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { BusinessPackagesSection } from "@/components/marketing/BusinessPackagesSection";
import { DevelopedAppsShowcase } from "@/components/marketing/DevelopedAppsShowcase";
import { BRAND } from "@/lib/brand";
import { SHOP_PACKAGES } from "@/lib/site-content";
import { ShopCheckout } from "@/components/marketing/ShopCheckout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Shop — Web & App Services | ${BRAND.companyName}`,
  description: "Purchase website packages, e-commerce, custom apps, and care plans.",
};

export default function ShopPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
      <p className="marketing-eyebrow">Shop</p>
      <h1 className="marketing-page-title">Website & app services</h1>
      <p className="mt-4 max-w-2xl marketing-lead">
        Browse our live apps, then choose a package—we&apos;ll send a tailored quote and payment
        options for your own website or application.
      </p>

      <div className="mt-16">
        <DevelopedAppsShowcase />
      </div>

      <div className="mt-24 border-t border-slate-200 pt-20">
        <p className="marketing-eyebrow">Order a new build</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">Website packages</h2>
        <p className="mt-2 text-slate-600">Transparent starting prices for your next project.</p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {SHOP_PACKAGES.map((pkg) => {
          const Icon = pkg.icon;
          return (
            <article
              key={pkg.id}
              className={`marketing-service-card relative flex flex-col ${
                pkg.popular ? "border-brand-300 ring-2 ring-brand-100" : ""
              }`}
            >
              {pkg.popular && (
                <span className="absolute -top-3 right-4 rounded-full bg-brand-600 px-3 py-0.5 text-xs font-bold text-white">
                  Most popular
                </span>
              )}
              <Icon className="h-8 w-8 text-brand-600" />
              <h2 className="mt-4 text-xl font-bold text-slate-900">{pkg.name}</h2>
              <p className="mt-2 flex-1 text-sm text-slate-600">{pkg.description}</p>
              <p className="mt-4 text-2xl font-bold text-slate-900">
                {pkg.priceLabel}{" "}
                <span className="text-brand-600">${pkg.priceFrom.toLocaleString()}</span>
                <span className="text-sm font-normal text-slate-500">+</span>
              </p>
              <p className="text-xs text-slate-500">{pkg.timeline}</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                {pkg.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={`/shop?package=${pkg.id}`}
                className="mt-6 block rounded-lg border border-brand-200 bg-brand-50 py-2.5 text-center text-sm font-semibold text-brand-800 transition hover:bg-brand-100"
              >
                Select package
              </Link>
            </article>
          );
        })}
      </div>

      <section className="mt-24 border-t border-slate-200 pt-20">
        <p className="marketing-eyebrow">Business services (NAD)</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">Registration, plans & branding</h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Fixed packages for CC registration, cash loan entities, NGOs, business plans, and
          proposals—or{" "}
          <Link href="/services/business-consulting" className="font-medium text-brand-600 underline">
            view full business consultation services
          </Link>
          .
        </p>
        <BusinessPackagesSection />
      </section>

      <section className="marketing-form-panel mt-20">
        <h2 className="text-2xl font-bold text-slate-900">Request a website package</h2>
        <p className="mt-2 text-slate-600">
          Fill in your details—we&apos;ll confirm scope, timeline, and payment method.
        </p>
        <div className="mt-8 max-w-2xl">
          <Suspense fallback={<p className="text-slate-500">Loading form…</p>}>
            <ShopCheckout />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
