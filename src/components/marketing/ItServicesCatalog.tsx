import Link from "next/link";
import { CheckCircle2, TrendingUp } from "lucide-react";
import {
  HIGH_DEMAND_IT_SERVICES,
  IT_SERVICE_AUDIENCES,
  IT_SERVICE_CATEGORIES,
  IT_SERVICE_PILLARS,
} from "@/lib/it-services";

export function ItServicesCatalog() {
  return (
    <div className="mt-14 space-y-16">
      <section className="rounded-2xl border border-royal/20 bg-gradient-to-br from-brand-50 to-offwhite p-6 md:p-8">
        <div className="flex items-start gap-3">
          <TrendingUp className="h-6 w-6 shrink-0 text-royal" />
          <div>
            <h2 className="text-xl font-bold text-navy">High demand in Namibia</h2>
            <p className="mt-2 text-sm text-muted">
              These services are especially popular with institutions, government, and SMEs—we
              deliver them every day.
            </p>
          </div>
        </div>
        <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {HIGH_DEMAND_IT_SERVICES.map((item, i) => (
            <li
              key={item}
              className="flex items-center gap-2 rounded-lg border border-line bg-offwhite px-3 py-2.5 text-sm font-medium text-navy shadow-sm"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-royal/10 text-xs font-bold text-royal">
                {i + 1}
              </span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-navy">What we cover</h2>
        <p className="mt-2 max-w-3xl text-muted">
          One partner for software, support, infrastructure, security, cloud, AI, data, and
          training—built on our experience in web development, system development, hardware
          repair, and IT support.
        </p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {IT_SERVICE_PILLARS.map((pillar) => (
            <li
              key={pillar}
              className="rounded-full border border-royal/20 bg-offwhite px-3 py-1 text-xs font-semibold text-royal"
            >
              {pillar}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-navy">Full service catalogue</h2>
        <p className="mt-2 text-muted">
          Browse all areas below. Request a quote for any combination—we scope projects to your
          budget and timeline.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {IT_SERVICE_CATEGORIES.map((category) => (
            <article
              key={category.id}
              className="marketing-service-card flex flex-col"
            >
              <h3 className="text-lg font-bold text-navy">{category.title}</h3>
              {category.description && (
                <p className="mt-2 text-sm text-muted">{category.description}</p>
              )}
              <ul className="mt-4 flex-1 space-y-2">
                {category.items.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-charcoal">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-cream-50 p-6 md:p-8">
        <h2 className="text-lg font-bold text-navy">Who we serve</h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {IT_SERVICE_AUDIENCES.map((audience) => (
            <li
              key={audience}
              className="rounded-lg bg-offwhite px-3 py-2 text-sm font-medium text-charcoal shadow-sm"
            >
              {audience}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-muted">
          Need our research platform or a live example? Explore{" "}
          <Link href="/research" className="font-semibold text-royal underline">
            Skyrapay Research Suite
          </Link>{" "}
          and apps we&apos;ve built on the{" "}
          <Link href="/shop#our-apps" className="font-semibold text-royal underline">
            shop
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
