import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { PriceDisplay } from "@/components/marketing/PriceDisplay";
import type { BusinessPackage } from "@/lib/site-content";

type StudentWritingPackagesSectionProps = {
  title: string;
  description: string;
  packages: BusinessPackage[];
  contactService: "assignment-writing" | "research-writing";
};

function PackageCard({
  pkg,
  contactService,
}: {
  pkg: BusinessPackage;
  contactService: StudentWritingPackagesSectionProps["contactService"];
}) {
  return (
    <article
      className={`marketing-service-card flex flex-col ${
        pkg.popular ? "border-royal/40 ring-2 ring-sky/30" : ""
      }`}
    >
      {pkg.popular && (
        <span className="mb-3 inline-block w-fit rounded-full bg-royal px-3 py-0.5 text-xs font-bold text-offwhite">
          Popular
        </span>
      )}
      <h3 className="text-lg font-bold text-navy">{pkg.name}</h3>
      <div className="mt-2">
        <PriceDisplay
          original={pkg.price}
          priceLabel={pkg.priceLabel === undefined ? "From" : pkg.priceLabel}
          size="md"
        />
      </div>
      <p className="mt-2 flex-1 text-sm text-muted">{pkg.description}</p>
      <ul className="mt-4 space-y-2 text-sm text-charcoal">
        {pkg.includes.map((item) => (
          <li key={item} className="flex gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            {item}
          </li>
        ))}
      </ul>
      <Link
        href={`/contact?service=${contactService}&package=${pkg.id}`}
        className="mt-6 block rounded-lg border border-royal/30 bg-brand-50 py-2.5 text-center text-sm font-semibold text-navy transition hover:bg-sky/20"
      >
        Request this package
      </Link>
    </article>
  );
}

export function StudentWritingPackagesSection({
  title,
  description,
  packages,
  contactService,
}: StudentWritingPackagesSectionProps) {
  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold text-navy">{title}</h2>
      <p className="mt-2 max-w-3xl text-muted">{description}</p>
      <p className="mt-2 text-sm text-muted">
        Prices are shown in your local currency (invoiced in NAD, ex VAT). Scope is confirmed
        before work begins — we issue formal quotations and invoices through our business office.
      </p>
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => (
          <PackageCard key={pkg.id} pkg={pkg} contactService={contactService} />
        ))}
      </div>
    </section>
  );
}
