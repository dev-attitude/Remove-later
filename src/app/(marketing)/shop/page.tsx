import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { BusinessPackagesSection } from "@/components/marketing/BusinessPackagesSection";
import { DevelopedAppsShowcase } from "@/components/marketing/DevelopedAppsShowcase";
import { PriceDisplay } from "@/components/marketing/PriceDisplay";
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

      <div className="mt-24 border-t border-line pt-20">
        <p className="marketing-eyebrow">Order a new build</p>
        <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-charcoal">
          Website packages
        </h2>
        <p className="mt-2 text-muted">
          Fixed starting prices below—final quote depends on scope and features you need.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {SHOP_PACKAGES.map((pkg) => {
          const Icon = pkg.icon;
          return (
            <article
              key={pkg.id}
              className={`marketing-service-card relative flex flex-col ${
                pkg.popular ? "border-charcoal/30 shadow-focusWarm ring-1 ring-charcoal/15" : ""
              }`}
            >
              {pkg.popular && (
                <span className="absolute -top-3 right-4 rounded-full bg-charcoal px-3 py-0.5 text-xs font-medium text-offwhite shadow-inset">
                  Most popular
                </span>
              )}
              <div className="marketing-icon-pill">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-xl font-normal tracking-tight text-charcoal">{pkg.name}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{pkg.description}</p>
              <div className="mt-4">
                <PriceDisplay
                  original={pkg.priceFrom}
                  originalTo={pkg.priceTo}
                  priceLabel={pkg.priceLabel}
                  plusVat={pkg.plusVat}
                  size="md"
                />
              </div>
              <p className="mt-2 text-xs text-muted">{pkg.timeline}</p>
              <ul className="mt-4 space-y-2 text-sm text-charcoal">
                {pkg.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-charcoal/70" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={`/quote?package=${pkg.id}`}
                className={`mt-6 block rounded-full py-2.5 text-center text-sm font-medium transition ${
                  pkg.popular
                    ? "bg-charcoal text-offwhite shadow-inset hover:bg-charcoal/90"
                    : "border border-charcoal/20 text-charcoal hover:bg-charcoal/[0.04]"
                }`}
              >
                Get a quote
              </Link>
            </article>
          );
        })}
      </div>

      <section className="mt-24 border-t border-line pt-20">
        <p className="marketing-eyebrow">Business services (NAD)</p>
        <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-charcoal">
          Registration, plans &amp; branding
        </h2>
        <p className="mt-2 max-w-2xl text-muted">
          Fixed packages for CC registration, cash loan entities, NGOs, business plans, and
          proposals—or{" "}
          <Link href="/services/business-consulting" className="font-medium text-charcoal underline underline-offset-2">
            view full business consultation services
          </Link>
          .
        </p>
        <BusinessPackagesSection />
      </section>

      <section id="get-quote" className="marketing-form-panel mt-20 scroll-mt-24">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-charcoal">
          Request a website package
        </h2>
        <p className="mt-2 text-muted">
          Fill in your details—we&apos;ll confirm scope, timeline, and payment method. Or use the{" "}
          <Link href="/quote" className="font-medium text-charcoal underline underline-offset-2">
            dedicated quote page
          </Link>
          .
        </p>
        <div className="mt-8 max-w-2xl">
          <Suspense fallback={<p className="text-muted">Loading form…</p>}>
            <ShopCheckout />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
