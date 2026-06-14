import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WHY_CHOOSE_SUMMARY, WHY_CHOOSE_US } from "@/lib/site-content";

type WhyChooseUsSectionProps = {
  showSummary?: boolean;
  showAboutLink?: boolean;
};

export function WhyChooseUsSection({
  showSummary = true,
  showAboutLink = false,
}: WhyChooseUsSectionProps) {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="marketing-eyebrow">Why choose us</p>
          <h2 className="marketing-section-title">
            Why Skyrapay Consultations&nbsp;CC
          </h2>
          {showSummary && (
            <p className="mt-4 marketing-body">{WHY_CHOOSE_SUMMARY}</p>
          )}
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {WHY_CHOOSE_US.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.id}
                className="marketing-service-card flex flex-col border-slate-200/80 bg-white"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-sky text-white shadow-sm">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-navy">{item.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                  {item.description}
                </p>
              </article>
            );
          })}
        </div>

        {showAboutLink && (
          <div className="mt-10 text-center">
            <Link
              href="/contact"
              className="marketing-btn-primary inline-flex"
            >
              Work with us
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
