import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ShopCheckout } from "@/components/marketing/ShopCheckout";
import { BRAND } from "@/lib/brand";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Get a Quote | ${BRAND.companyName}`,
  description: "Request a quote for websites, apps, e-commerce, and maintenance packages.",
};

export default function QuotePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-24">
      <Link
        href="/shop"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-royal"
      >
        <ArrowLeft className="h-4 w-4" />
        Browse all packages
      </Link>

      <p className="marketing-eyebrow mt-8">Get a quote</p>
      <h1 className="marketing-page-title">Request your project quote</h1>
      <p className="mt-4 marketing-lead">
        Choose a package, tell us about your project, and we&apos;ll email you a tailored quote
        within one business day ({BRAND.companyName} — Mon–Fri 08:00–18:00).
      </p>

      <section id="get-quote" className="marketing-form-panel mt-10 scroll-mt-24">
        <Suspense fallback={<p className="text-muted">Loading form…</p>}>
          <ShopCheckout />
        </Suspense>
      </section>
    </div>
  );
}
