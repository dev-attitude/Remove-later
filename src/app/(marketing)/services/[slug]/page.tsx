import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { BusinessPackagesSection } from "@/components/marketing/BusinessPackagesSection";
import { ItServicesCatalog } from "@/components/marketing/ItServicesCatalog";
import { StudentAssistanceSection } from "@/components/marketing/StudentAssistanceSection";
import { StudentWritingPackagesSection } from "@/components/marketing/StudentWritingPackagesSection";
import { BRAND } from "@/lib/brand";
import { IT_SERVICES_POSITIONING } from "@/lib/it-services";
import {
  ASSIGNMENT_WRITING_PACKAGES,
  getServiceBySlug,
  RESEARCH_WRITING_PACKAGES,
  SERVICES,
} from "@/lib/site-content";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return { title: `Service | ${BRAND.companyName}` };
  return {
    title: `${service.title} | ${BRAND.companyName}`,
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
  const isIt = slug === "it-consulting";
  const isStudent = slug === "student-assistance";
  const isAssignment = slug === "assignment-writing";
  const isResearch = slug === "research-writing";

  return (
    <div
      className={`mx-auto px-4 py-16 md:px-8 md:py-24 ${isIt ? "max-w-7xl" : "max-w-4xl"}`}
    >
      <Link
        href="/services"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" />
        All services
      </Link>

      <div className="mt-8 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
          <Icon className="h-8 w-8" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-charcoal md:text-4xl">
            {service.title}
          </h1>
          <p className="mt-1 text-muted">{service.short}</p>
        </div>
      </div>

      <p className="mt-8 text-lg leading-relaxed text-charcoal">{service.description}</p>

      {isIt && (
        <p className="mt-4 max-w-3xl text-muted">{IT_SERVICES_POSITIONING}</p>
      )}

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        <div className="rounded-2xl border border-line bg-offwhite p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-charcoal">
            {isIt ? "Core capabilities" : "What we offer"}
          </h2>
          <ul className="mt-4 space-y-3">
            {service.features.map((f) => (
              <li key={f} className="flex gap-2 text-sm text-charcoal">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-line bg-offwhite p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-charcoal">Deliverables</h2>
          <ul className="mt-4 space-y-3">
            {service.deliverables.map((d) => (
              <li key={d} className="flex gap-2 text-sm text-charcoal">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-600" />
                {d}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {isIt && <ItServicesCatalog />}

      {isBusiness && <BusinessPackagesSection />}

      {isStudent && <StudentAssistanceSection />}

      {isAssignment && (
        <StudentWritingPackagesSection
          title="Assignment writing packages"
          description="Fixed assignment rates for undergraduate and postgraduate work. Tell us your module, word count, and deadline—we confirm scope before starting."
          packages={ASSIGNMENT_WRITING_PACKAGES}
          contactService="assignment-writing"
        />
      )}

      {isResearch && (
        <StudentWritingPackagesSection
          title="Research writing packages"
          description="Proposals, theses, PhD monthly support, and data collection — fixed rates by academic level."
          packages={RESEARCH_WRITING_PACKAGES}
          contactService="research-writing"
        />
      )}

      <div className="mt-12 flex flex-wrap gap-4">
        <Link href="/contact" className="marketing-btn-primary">
          Request consultation
        </Link>
        {isWeb && (
          <Link href="/quote" className="marketing-btn-secondary">
            Get a web package quote
          </Link>
        )}
        {isBusiness && (
          <Link href="/contact?service=registration" className="marketing-btn-secondary">
            Register my business
          </Link>
        )}
        {isIt && (
          <Link href="/quote" className="marketing-btn-secondary">
            Get a project quote
          </Link>
        )}
        {isStudent && (
          <>
            <Link href="/services/assignment-writing" className="marketing-btn-secondary">
              Assignment writing packages
            </Link>
            <Link href="/services/research-writing" className="marketing-btn-secondary">
              Research writing packages
            </Link>
            <Link
              href="/contact?service=student-assistance"
              className="marketing-btn-secondary"
            >
              Request student assistance
            </Link>
            <Link href="/research" className="marketing-btn-secondary">
              Skyrapay Research Suite
            </Link>
          </>
        )}
        {isAssignment && (
          <Link href="/contact?service=assignment-writing" className="marketing-btn-secondary">
            Request assignment help
          </Link>
        )}
        {isResearch && (
          <Link href="/contact?service=research-writing" className="marketing-btn-secondary">
            Request research support
          </Link>
        )}
      </div>
    </div>
  );
}
