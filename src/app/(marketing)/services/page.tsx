import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { SERVICES } from "@/lib/site-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Services | ${BRAND.companyName}`,
  description:
    "IT services, assignment writing, research writing, business consulting, gadgets, system development, and web apps for Namibia.",
};

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
      <span className="marketing-eyebrow-chip">Services</span>
      <h1 className="marketing-page-title mt-4">End-to-end solutions for your organisation</h1>
      <p className="mt-4 max-w-2xl marketing-lead">
        Full-service IT, assignment & research writing, business registration, devices, and custom
        software—from school to university and beyond.
      </p>

      <div className="mt-14 grid gap-6 md:grid-cols-2">
        {SERVICES.map((service) => {
          const Icon = service.icon;
          return (
            <article key={service.slug} className="marketing-service-card group flex flex-col">
              <div className="flex items-start gap-4">
                <div className="marketing-icon-pill h-12 w-12 shrink-0 group-hover:bg-charcoal group-hover:text-offwhite group-hover:shadow-inset">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-normal tracking-tight text-charcoal">{service.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{service.description}</p>
                </div>
              </div>
              <ul className="mt-6 flex-1 space-y-2.5 text-sm text-charcoal">
                {service.features.slice(0, 4).map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-charcoal/40" aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={`/services/${service.slug}`}
                className="mt-6 inline-flex items-center gap-1 text-sm text-charcoal underline-offset-4 group-hover:underline"
              >
                Full details{" "}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
            </article>
          );
        })}
      </div>

      <div className="marketing-hero-glow mt-16 overflow-hidden rounded-2xl border border-line p-8 text-center md:p-12">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-charcoal">
          Need a website or custom app?
        </h2>
        <p className="mt-2 text-muted">Browse packages and request a quote online.</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link href="/shop" className="marketing-btn-primary inline-flex">
            Go to shop
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/hosting" className="marketing-btn-secondary inline-flex">
            View hosting plans
          </Link>
        </div>
      </div>
    </div>
  );
}
