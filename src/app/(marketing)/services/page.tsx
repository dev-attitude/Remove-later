import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { SERVICES } from "@/lib/site-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Services | ${BRAND.companyName}`,
  description: "IT consulting, business consulting, gadgets, system development, and web apps.",
};

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
      <p className="marketing-eyebrow">Services</p>
      <h1 className="marketing-page-title">End-to-end solutions for your organisation</h1>
      <p className="mt-4 max-w-2xl marketing-lead">
        From strategy and devices to custom software—we help you plan, build, and grow.
      </p>

      <div className="mt-14 grid gap-8 md:grid-cols-2">
        {SERVICES.map((service) => {
          const Icon = service.icon;
          return (
            <article key={service.slug} className="marketing-service-card flex flex-col">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                  <Icon className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{service.title}</h2>
                  <p className="mt-2 text-sm text-slate-600">{service.description}</p>
                </div>
              </div>
              <ul className="mt-6 flex-1 space-y-2 text-sm text-slate-700">
                {service.features.slice(0, 4).map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-brand-600">•</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={`/services/${service.slug}`}
                className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
              >
                Full details <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          );
        })}
      </div>

      <div className="mt-16 rounded-2xl border border-brand-200 bg-brand-50 p-8 text-center md:p-12">
        <h2 className="text-2xl font-bold text-slate-900">Need a website or custom app?</h2>
        <p className="mt-2 text-slate-600">Browse packages and request a quote online.</p>
        <Link href="/shop" className="marketing-btn-primary mt-6 inline-flex">
          Go to shop
        </Link>
      </div>
    </div>
  );
}
