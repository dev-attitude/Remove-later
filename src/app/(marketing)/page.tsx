import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  FlaskConical,
} from "lucide-react";
import { BrandLogo } from "@/components/marketing/BrandLogo";
import { GoogleReviewsSection } from "@/components/marketing/GoogleReviewsSection";
import { PriceDisplay } from "@/components/marketing/PriceDisplay";
import { WhyChooseUsSection } from "@/components/marketing/WhyChooseUsSection";
import { COMPANY, SERVICES, SHOP_PACKAGES } from "@/lib/site-content";

export default function HomePage() {
  const featured = SHOP_PACKAGES.find((p) => p.popular) ?? SHOP_PACKAGES[1];

  return (
    <>
      {/* ─── Hero ─── */}
      <section className="marketing-hero">
        <div className="marketing-hero-glow absolute inset-0" />
        <div className="marketing-grid-pattern absolute inset-0" />
        <div className="relative mx-auto max-w-3xl px-4 pb-20 pt-20 text-center md:px-8 md:pb-28 md:pt-28">
          <span className="marketing-pill mx-auto">
            <span className="h-1.5 w-1.5 rounded-full bg-charcoal" aria-hidden />
            {COMPANY.tagline}
          </span>

          <h1 className="mt-8 font-display text-[2.75rem] font-semibold leading-[1.04] tracking-[-0.025em] text-charcoal md:text-6xl md:tracking-[-0.04em]">
            Technology &amp; business solutions that drive real results
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-[1.5] text-muted">
            {COMPANY.shortName} combines IT consulting, business advisory, premium
            gadgets, and custom software development—so your organisation can grow
            with confidence.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href="/quote" className="marketing-btn-primary">
              Get a quote
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/shop" className="marketing-btn-secondary">
              Browse packages
            </Link>
            <Link href="/shop#our-apps" className="marketing-pill">
              View our live apps
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted">
            {["Trusted locally", "End-to-end delivery", "Ongoing support"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-charcoal/70" />
                {t}
              </li>
            ))}
          </ul>

          {/* Logo plate — bordered image card per design tokens */}
          <div className="mx-auto mt-14 max-w-xl rounded-2xl border border-line bg-cream-50 px-8 py-10">
            <BrandLogo
              className="mx-auto h-auto w-full max-w-sm"
              width={420}
              height={176}
              priority
            />
          </div>
        </div>
      </section>

      {/* ─── Services ─── */}
      <section className="marketing-section-panel border-t border-line">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="marketing-eyebrow">What we do</p>
            <h2 className="marketing-section-title mt-3">
              Five core service lines, one partner
            </h2>
            <p className="mx-auto mt-4 marketing-body">
              One team for your entire digital journey—from first quote to go-live
              and beyond.
            </p>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service) => {
              const Icon = service.icon;
              return (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="marketing-service-card group"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-cream text-charcoal transition group-hover:bg-charcoal group-hover:text-offwhite">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-normal tracking-tight text-charcoal">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {service.short}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm text-charcoal underline-offset-4 group-hover:underline">
                    Learn more{" "}
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
            <Link
              href={COMPANY.researchAppPath}
              className="marketing-service-card group bg-charcoal text-offwhite hover:border-charcoal"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cream text-charcoal">
                <FlaskConical className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-xl font-normal tracking-tight text-offwhite">
                {COMPANY.productName}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-offwhite/70">
                Our AI-powered academic research platform—available to students and
                institutions.
              </p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm text-offwhite underline-offset-4 group-hover:underline">
                Open app <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <WhyChooseUsSection showAboutLink={false} />

      <GoogleReviewsSection />

      {/* ─── Featured package ─── */}
      <section className="border-t border-line py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="marketing-eyebrow">Get online</p>
              <h2 className="marketing-section-title mt-3">
                Ready to launch your website?
              </h2>
              <p className="mt-4 marketing-body max-w-md">
                Choose a package or request a custom quote. We handle design,
                development, hosting guidance, and launch support.
              </p>
              <Link
                href="#reviews"
                className="mt-6 inline-flex items-center gap-1.5 text-sm text-charcoal underline underline-offset-4 transition hover:opacity-70"
              >
                See client reviews on Google
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="rounded-2xl border border-line bg-cream-50 p-8">
              <p className="marketing-eyebrow">Popular package</p>
              <h3 className="mt-3 text-2xl font-normal tracking-tight text-charcoal">
                {featured.name}
              </h3>
              <p className="mt-2 text-muted">{featured.description}</p>
              <div className="mt-6">
                <PriceDisplay
                  original={featured.priceFrom}
                  originalTo={featured.priceTo}
                  priceLabel={featured.priceLabel}
                  plusVat={featured.plusVat}
                  size="lg"
                />
              </div>
              <ul className="mt-6 space-y-2.5 text-sm text-charcoal/80">
                {featured.features.slice(0, 4).map((f) => (
                  <li key={f} className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-charcoal/70" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={`/quote?package=${featured.id}`}
                className="marketing-btn-primary mt-8 w-full justify-center"
              >
                View all packages
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Closing CTA ─── */}
      <section className="marketing-cta-band border-t border-line">
        <div className="mx-auto max-w-3xl px-4 text-center md:px-8">
          <h2 className="font-display text-3xl font-semibold leading-[1.05] tracking-[-0.02em] text-charcoal md:text-[2.75rem]">
            Let&apos;s build something exceptional together
          </h2>
          <p className="mt-4 text-lg text-muted">
            Tell us about your project—we respond within one business day.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="marketing-btn-primary">
              Contact us
            </Link>
            <Link href="/shop" className="marketing-btn-secondary">
              View pricing
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
