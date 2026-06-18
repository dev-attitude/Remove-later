import Link from "next/link";
import { BrandLogo } from "@/components/marketing/BrandLogo";
import { WhyChooseUsSection } from "@/components/marketing/WhyChooseUsSection";
import { BRAND } from "@/lib/brand";
import { COMPANY } from "@/lib/site-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `About | ${BRAND.companyName}`,
  description: `Learn about ${BRAND.companyLegal} — ${BRAND.tagline}.`,
};

export default function AboutPage() {
  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="marketing-eyebrow">About us</p>
            <h1 className="marketing-page-title">{COMPANY.name}</h1>
            <p className="mt-2 text-lg font-medium text-brand-600">{COMPANY.tagline}</p>
            <p className="mt-6 leading-relaxed text-muted">
              With offices in {COMPANY.offices.join(", ")}, and postal services via{" "}
              {COMPANY.poBox}, we serve businesses, institutions, and individuals who need
              reliable technology partners. Our team spans IT consulting, business strategy,
              hardware supply, and full-stack development—including the {COMPANY.productName}{" "}
              academic platform used by students and supervisors.
            </p>
            <p className="mt-4 leading-relaxed text-muted">
              Whether you need a laptop for coursework, a turnaround plan for your SME, or a
              production web application, we bring the same professionalism and attention to
              detail.
            </p>
            <p className="mt-4 text-sm text-muted">
              {COMPANY.businessHours.days}, {COMPANY.businessHours.time}.{" "}
              {COMPANY.businessHours.note}
            </p>
            <Link href="/contact" className="marketing-btn-primary mt-8 inline-flex">
              Work with us
            </Link>
          </div>
          <div className="flex justify-center bg-offwhite">
            <BrandLogo className="h-auto w-full max-w-sm" width={400} height={160} />
          </div>
        </div>
      </div>

      <div className="border-t border-line bg-cream-50/50">
        <WhyChooseUsSection showAboutLink />
      </div>
    </>
  );
}
