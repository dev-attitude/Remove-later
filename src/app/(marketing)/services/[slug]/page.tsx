import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { BusinessPackagesSection } from "@/components/marketing/BusinessPackagesSection";
import { getServiceBySlug, SERVICES } from "@/lib/site-content";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return { title: "Service | GM Consultations" };
  return {
    title: `${service.title} | GM Consultations`,
    description: service.short,
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const Icon = service.icon;
  const isWeb = slug === "web-app-development";
  const isBusiness = slug === "business-consulting";

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 md:px-8 md:py-24">
      <Link
        href="/services"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" />
        All services
      </Link>

      <div className="mt-8 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
          <Icon className="h-8 w-8" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900 md:text-4xl">
            {service.title}
          </h1>
          <p className="mt-1 text-slate-600">{service.short}</p>
        </div>
      </div>

      <p className="mt-8 text-lg leading-relaxed text-slate-700">{service.description}</p>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">What we offer</h2>
          <ul className="mt-4 space-y-3">
            {service.features.map((f) => (
              <li key={f} className="flex gap-2 text-sm text-slate-700">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Deliverables</h2>
          <ul className="mt-4 space-y-3">
            {service.deliverables.map((d) => (
              <li key={d} className="flex gap-2 text-sm text-slate-700">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-600" />
                {d}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {isBusiness && <BusinessPackagesSection />}

      <div className="mt-12 flex flex-wrap gap-4">
        <Link href="/contact" className="marketing-btn-primary">
          Request consultation
        </Link>
        {isWeb && (
          <Link href="/shop" className="marketing-btn-secondary">
            Purchase web package
          </Link>
        )}
        {isBusiness && (
          <Link href="/contact?service=registration" className="marketing-btn-secondary">
            Register my business
          </Link>
        )}
      </div>
    </div>
  );
}
