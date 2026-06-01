import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import {
  BUSINESS_BRANDING_SERVICES,
  BUSINESS_DOCUMENT_PACKAGES,
  BUSINESS_REGISTRATION_PACKAGES,
  type BusinessPackage,
} from "@/lib/site-content";

function formatNAD(pkg: BusinessPackage) {
  if (pkg.priceLabel === "Quote on request" || pkg.price === 0) {
    return "Quote on request";
  }
  const prefix = pkg.priceLabel === "From" ? "From " : "";
  return `${prefix}N$ ${pkg.price.toLocaleString("en-NA")}`;
}

function PackageCard({ pkg, contactSubject }: { pkg: BusinessPackage; contactSubject: string }) {
  return (
    <article
      className={`marketing-service-card flex flex-col ${
        pkg.popular ? "border-brand-500/50 ring-1 ring-brand-500/30" : ""
      }`}
    >
      {pkg.popular && (
        <span className="mb-3 inline-block w-fit rounded-full bg-brand-600 px-3 py-0.5 text-xs font-bold text-white">
          Popular
        </span>
      )}
      <h3 className="text-lg font-bold text-white">{pkg.name}</h3>
      <p className="mt-2 text-2xl font-bold text-brand-300">{formatNAD(pkg)}</p>
      <p className="mt-2 flex-1 text-sm text-slate-400">{pkg.description}</p>
      <ul className="mt-4 space-y-2 text-sm text-slate-300">
        {pkg.includes.map((item) => (
          <li key={item} className="flex gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            {item}
          </li>
        ))}
      </ul>
      <Link
        href={`/contact?service=${contactSubject}&package=${pkg.id}`}
        className="mt-6 block rounded-lg border border-brand-500/40 py-2.5 text-center text-sm font-semibold text-brand-300 transition hover:bg-brand-600/20"
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
        <h2 className="text-2xl font-bold text-white">Branding & digital presence</h2>
        <p className="mt-2 text-slate-400">
          In addition to registration and planning, we help your business look professional online
          and in print.
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-3">
          {BUSINESS_BRANDING_SERVICES.map((item) => (
            <li
              key={item}
              className="flex gap-2 rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3 text-sm text-slate-300"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-400" />
              {item}
            </li>
          ))}
        </ul>
        <Link href="/shop" className="marketing-btn-secondary mt-6 inline-flex text-sm">
          Website packages & pricing
        </Link>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white">Business registration packages</h2>
        <p className="mt-2 text-slate-400">
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
        <h2 className="text-2xl font-bold text-white">Business plans & proposals</h2>
        <p className="mt-2 text-slate-400">
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
