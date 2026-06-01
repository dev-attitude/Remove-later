import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  FlaskConical,
  Sparkles,
  Star,
} from "lucide-react";
import { COMPANY, SERVICES, SHOP_PACKAGES } from "@/lib/site-content";

export default function HomePage() {
  const featured = SHOP_PACKAGES.find((p) => p.popular) ?? SHOP_PACKAGES[1];

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="marketing-hero-glow absolute inset-0" />
        <div className="marketing-grid-pattern absolute inset-0 opacity-40" />
        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 md:px-8 md:pb-28 md:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-600/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-300">
                <Sparkles className="h-3.5 w-3.5" />
                {COMPANY.tagline}
              </p>
              <h1 className="mt-6 font-display text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
                Technology & business solutions that{" "}
                <span className="bg-gradient-to-r from-brand-300 via-white to-slate-300 bg-clip-text text-transparent">
                  drive real results
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
                {COMPANY.name} combines IT consulting, business advisory, premium gadgets,
                and custom software development—so your organisation can grow with confidence.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/shop" className="marketing-btn-primary">
                  Purchase web services
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/services" className="marketing-btn-secondary">
                  Explore services
                </Link>
              </div>
              <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
                {["Trusted locally", "End-to-end delivery", "Ongoing support"].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative flex justify-center lg:justify-end">
              <div className="marketing-card-glow relative rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/90 to-brand-950/50 p-2 shadow-2xl">
                <Image
                  src="/logo.png"
                  alt={COMPANY.name}
                  width={420}
                  height={420}
                  className="rounded-xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/5 bg-[#080e1c] py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
              What we do
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-400">
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
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600/20 text-brand-300 transition group-hover:bg-brand-600 group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-white">{service.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{service.short}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-400 group-hover:text-brand-300">
                    Learn more <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
            <Link
              href={COMPANY.researchAppPath}
              className="marketing-service-card group border-brand-500/30 bg-brand-950/30"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white">
                <FlaskConical className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">GM Research Suite</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Our AI-powered academic research platform—unchanged and available to students
                and institutions.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-400">
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
              <h2 className="font-display text-3xl font-bold text-white">
                Ready to launch your website?
              </h2>
              <p className="mt-4 text-slate-400">
                Choose a package or request a custom quote. We handle design, development,
                hosting guidance, and launch support.
              </p>
              <div className="mt-8 marketing-card-glow rounded-2xl border border-brand-500/20 bg-slate-900/50 p-6">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mt-3 text-sm italic text-slate-300">
                  &ldquo;Professional delivery from brief to go-live. Our business site and
                  research tools both run on GM Consultations infrastructure.&rdquo;
                </p>
                <p className="mt-2 text-xs text-slate-500">— Satisfied client</p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-brand-950 p-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-400">
                Popular package
              </p>
              <h3 className="mt-2 text-2xl font-bold text-white">{featured.name}</h3>
              <p className="mt-2 text-slate-400">{featured.description}</p>
              <p className="mt-6 text-3xl font-bold text-white">
                {featured.priceLabel}{" "}
                <span className="text-brand-300">
                  ${featured.priceFrom.toLocaleString()}
                </span>
                <span className="text-lg font-normal text-slate-500"> {featured.currency}</span>
              </p>
              <ul className="mt-6 space-y-2 text-sm text-slate-300">
                {featured.features.slice(0, 4).map((f) => (
                  <li key={f} className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={`/shop?package=${featured.id}`} className="marketing-btn-primary mt-8 w-full justify-center">
                View all packages
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 bg-gradient-to-r from-brand-950 via-[#0a1020] to-brand-950 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center md:px-8">
          <h2 className="font-display text-2xl font-bold text-white md:text-3xl">
            Let&apos;s build something exceptional together
          </h2>
          <p className="mt-4 text-slate-400">
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
