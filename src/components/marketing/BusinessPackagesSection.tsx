import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { PriceDisplay } from "@/components/marketing/PriceDisplay";
import {
  BUSINESS_BRANDING_SERVICES,
  BUSINESS_DOCUMENT_PACKAGES,
  BUSINESS_REGISTRATION_PACKAGES,
  type BusinessPackage,
} from "@/lib/site-content";

function PackageCard({ pkg, contactSubject }: { pkg: BusinessPackage; contactSubject: string }) {
  return (
    <article
      className={`marketing-service-card flex flex-col ${
        pkg.popular ? "border-royal/40 ring-2 ring-sky/30" : ""
      }`}
    >
      {pkg.popular && (
        <span className="mb-3 inline-block w-fit rounded-full bg-royal px-3 py-0.5 text-xs font-bold text-white">
          Popular
        </span>
      )}
      <h3 className="text-lg font-bold text-navy">{pkg.name}</h3>
      <div className="mt-2">
        <PriceDisplay
          original={pkg.price}
          priceLabel={
            pkg.priceLabel === "Quote on request"
              ? undefined
              : pkg.priceLabel || "From"
          }
          size="md"
        />
      </div>
      <p className="mt-2 flex-1 text-sm text-slate-600">{pkg.description}</p>
      <ul className="mt-4 space-y-2 text-sm text-slate-700">
        {pkg.includes.map((item) => (
          <li key={item} className="flex gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            {item}
          </li>
        ))}
      </ul>
      <Link
        href={`/contact?service=${contactSubject}&package=${pkg.id}`}
        className="mt-6 block rounded-lg border border-royal/30 bg-brand-50 py-2.5 text-center text-sm font-semibold text-navy transition hover:bg-sky/20"
      >
        Request this package
      </Link>
    </article>
  );
}

export function BusinessPackagesSection() {
  return (
    <div className="mt-16 space-y-16">
      <section>
        <h2 className="text-2xl font-bold text-navy">Branding & digital presence</h2>
        <p className="mt-2 text-slate-600">
          In addition to registration and planning, we help your business look professional online
          and in print.
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-3">
          {BUSINESS_BRANDING_SERVICES.map((item) => (
            <li
              key={item}
              className="flex gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-royal" />
              {item}
            </li>
          ))}
        </ul>
        <Link href="/shop" className="marketing-btn-secondary mt-6 inline-flex text-sm">
          Website packages & pricing
        </Link>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-navy">Business registration packages</h2>
        <p className="mt-2 text-slate-600">
          Fixed NAD pricing for CC, cash loan, NGO, and (Pty) Ltd registration. All filings handled
          by our team during business hours (Mon–Fri, 08:00–18:00).
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {BUSINESS_REGISTRATION_PACKAGES.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} contactSubject="registration" />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-navy">Business plans & proposals</h2>
        <p className="mt-2 text-slate-600">
          Professional documents for banks, investors, tenders, and clients.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {BUSINESS_DOCUMENT_PACKAGES.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} contactSubject="documents" />
          ))}
        </div>
      </section>
    </div>
  );
}
