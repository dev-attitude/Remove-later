import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FlaskConical,
  Sparkles,
  Star,
} from "lucide-react";
import { BrandLogo } from "@/components/marketing/BrandLogo";
import { PriceDisplay } from "@/components/marketing/PriceDisplay";
import { COMPANY, SERVICES, SHOP_PACKAGES } from "@/lib/site-content";

export default function HomePage() {
  const featured = SHOP_PACKAGES.find((p) => p.popular) ?? SHOP_PACKAGES[1];

  return (
    <>
      <section className="marketing-hero">
        <div className="marketing-hero-glow absolute inset-0" />
        <div className="marketing-grid-pattern absolute inset-0 opacity-60" />
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-12 md:px-8 md:pb-20 md:pt-16">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="marketing-eyebrow flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-brand-600" />
                {COMPANY.name}
              </p>
              <h1 className="mt-6 font-display text-4xl font-bold leading-tight text-slate-900 md:text-5xl lg:text-6xl">
                Technology & business solutions that{" "}
                <span className="bg-gradient-to-r from-royal to-sky bg-clip-text text-transparent">
                  drive real results
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
                {COMPANY.name} combines IT consulting, business advisory, premium gadgets,
                and custom software development—so your organisation can grow with confidence.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/quote" className="marketing-btn-primary">
                  Get a quote
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/shop" className="marketing-btn-secondary">
                  Browse packages
                </Link>
                <Link href="/shop#our-apps" className="marketing-btn-secondary">
                  View our live apps
                </Link>
              </div>
              <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
                {["Trusted locally", "End-to-end delivery", "Ongoing support"].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative flex justify-center bg-white lg:justify-end">
              <BrandLogo
                className="h-auto w-full max-w-md"
                width={480}
                height={200}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="marketing-section-panel">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="text-center">
            <h2 className="marketing-section-title">What we do</h2>
            <p className="mx-auto mt-4 max-w-2xl marketing-body">
              Five core service lines—one partner for your digital journey.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service) => {
              const Icon = service.icon;
              return (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="marketing-service-card group"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-700 transition group-hover:bg-brand-600 group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-slate-900">{service.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{service.short}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600 group-hover:text-brand-700">
                    Learn more <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
            <Link
              href={COMPANY.researchAppPath}
              className="marketing-service-card group border-brand-200 bg-gradient-to-br from-brand-50 to-white ring-1 ring-brand-100"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white">
                <FlaskConical className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-navy">{COMPANY.productName}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Our AI-powered academic research platform—available to students and
                institutions.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600">
                Open app <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="marketing-section-title">Ready to launch your website?</h2>
              <p className="mt-4 marketing-body">
                Choose a package or request a custom quote. We handle design, development,
                hosting guidance, and launch support.
              </p>
              <div className="mt-8 rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mt-3 text-sm italic text-slate-700">
                  &ldquo;Professional delivery from brief to go-live. Our business site and
                  research tools both run on Skyrapay Consultations infrastructure.&rdquo;
                </p>
                <p className="mt-2 text-xs text-slate-500">— Satisfied client</p>
              </div>
            </div>
            <div className="rounded-xl border border-brand-100 bg-white p-8 shadow-sm ring-1 ring-brand-50">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
                Popular package
              </p>
              <h3 className="mt-2 text-2xl font-bold text-navy">{featured.name}</h3>
              <p className="mt-2 text-slate-600">{featured.description}</p>
              <div className="mt-6">
                <PriceDisplay
                  original={featured.priceFrom}
                  currency="USD"
                  priceLabel={featured.priceLabel}
                  size="lg"
                />
              </div>
              <ul className="mt-6 space-y-2 text-sm text-slate-700">
                {featured.features.slice(0, 4).map((f) => (
                  <li key={f} className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
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

      <section className="marketing-cta-band">
        <div className="mx-auto max-w-4xl px-4 text-center md:px-8">
          <h2 className="font-display text-2xl font-bold text-slate-900 md:text-3xl">
            Let&apos;s build something exceptional together
          </h2>
          <p className="mt-4 text-slate-600">
            Tell us about your project—we respond within one business day.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
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
