import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { COMPANY } from "@/lib/site-content";
import { RefundRequestForm } from "@/components/marketing/RefundRequestForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Refund Policy | ${BRAND.companyName}`,
  description: `Refund and cancellation policy for ${BRAND.companyLegal} — consulting, hosting, shop orders, and digital services.`,
};

const SECTIONS = [
  {
    title: "1. Overview",
    body: [
      `${COMPANY.name} (“we”, “us”, “our”) is committed to fair and transparent business practices. This Refund Policy explains when refunds may be granted for services and products purchased through our website, in person, or by quotation and invoice.`,
      "By placing an order or making a payment, you agree to the terms below. Where a written quotation, service agreement, or invoice specifies different refund terms, those agreed terms take precedence for that engagement.",
    ],
  },
  {
    title: "2. Business services — consultation, business plans & registration",
    body: [
      "This section applies to refundable business services, including business consultation, business plans, proposals, company profiles, business registration packages, and related document or advisory work offered under our business consulting services.",
      "Where a refund is approved for these services, a 30% service and administration charge applies to the refundable amount. You will receive 70% of the eligible payment back. Example: if N$ 1,000 qualifies for refund, N$ 300 is retained and N$ 700 is refunded.",
      "Fees are generally non-refundable once substantive work has commenced (research, drafting, filing, or client meetings completed), because time and resources are allocated to your project. If work has not yet started, a full refund may be considered minus the 30% charge above where policy allows.",
      "If you cancel before we begin substantive work, we may refund the eligible balance after the 30% charge, or reallocate the amount as credit toward a future business service within 90 days.",
      "If we are unable to deliver the agreed scope due to our fault, we will offer a partial or full refund without the 30% charge, or complete the work at no additional charge—whichever is most appropriate.",
    ],
  },
  {
    title: "3. Other professional & consulting services",
    body: [
      "Fees for IT consulting, system development, student assistance, assignment writing, research writing, and similar professional work are generally non-refundable once work has commenced.",
      "If you cancel before we begin substantive work, we may refund any unused deposit minus reasonable administrative costs, or reallocate the amount as credit toward a future service within 90 days.",
      "If we are unable to deliver the agreed scope due to our fault, we will offer a partial or full refund, or complete the work at no additional charge—whichever is most appropriate.",
    ],
  },
  {
    title: "4. Hosting, domains & recurring services",
    body: [
      "Domain registrations, SSL certificates, and third-party registry fees are usually non-refundable once submitted to a registrar, even if the registration is later cancelled.",
      "Hosting, email, and other subscription plans may be cancelled before the next billing cycle. Refunds for unused prepaid periods are considered on a case-by-case basis and are not guaranteed for partial months already in progress.",
      "Setup fees, migration work, and one-off configuration charged separately are non-refundable once the service has been provisioned.",
    ],
  },
  {
    title: "5. Shop orders & physical products",
    body: [
      "Gadgets, hardware, and other physical items may be returned within 7 calendar days of delivery if unused, in original packaging, and accompanied by proof of purchase.",
      "Opened software licences, personalised items, and products marked as final sale cannot be refunded unless defective.",
      "Return shipping costs are the customer’s responsibility unless the item was faulty or incorrectly supplied by us.",
    ],
  },
  {
    title: "6. Digital subscriptions & software",
    body: [
      "Subscriptions to the Skyrapay Research Suite and other digital products may be cancelled at any time. Cancellation stops future billing; fees already paid for the current billing period are generally not refunded unless required by law or explicitly stated at purchase.",
      "Free trials convert to paid plans according to the terms shown at signup. Please cancel before the trial ends if you do not wish to be charged.",
    ],
  },
  {
    title: "7. Deposits, quotations & invoices",
    body: [
      "Deposits quoted on invoices or quotations confirm your booking and may be forfeited if you cancel after work has started or after materials or third-party services have been ordered on your behalf.",
      "Balance invoices for completed milestones are due as stated on the invoice. Disputes must be raised in writing within 7 days of invoice delivery.",
    ],
  },
  {
    title: "8. How to request a refund",
    body: [
      "Use the refund request form on this page, or email us with your full name, order or invoice reference, date of payment, and a clear explanation of your request.",
      "We aim to acknowledge refund requests within 2 business days and to resolve them within 10 business days, subject to verification and any third-party processing times.",
      "Approved refunds are returned to the original payment method where possible. Bank transfer refunds may require your account details and can take additional time to clear.",
    ],
  },
  {
    title: "9. Chargebacks & disputes",
    body: [
      "Please contact us before initiating a chargeback or payment dispute. We will work in good faith to resolve legitimate concerns.",
      "Unjustified chargebacks for services already delivered may result in suspension of access to hosting, software, or ongoing support until the matter is resolved.",
    ],
  },
  {
    title: "10. Changes to this policy",
    body: [
      "We may update this Refund Policy from time to time. The version published on this page applies to purchases made after the update date shown below.",
    ],
  },
] as const;

export default function RefundPolicyPage() {
  const updated = "11 June 2026";

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
      <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
        <div className="lg:col-span-3" id="policy">
          <p className="marketing-eyebrow">Legal</p>
          <h1 className="marketing-page-title">Refund Policy</h1>
          <p className="mt-4 marketing-lead">
            How refunds and cancellations work for services and products from {COMPANY.name}.
          </p>
          <p className="mt-2 text-sm text-slate-500">Last updated: {updated}</p>

          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950">
            <p className="font-semibold">30% charge on refundable business services</p>
            <p className="mt-1 leading-relaxed">
              Approved refunds for business consultation, business plans, registration packages, and
              related business consulting work are subject to a{" "}
              <strong>30% service and administration charge</strong>. The refundable balance paid
              to you is <strong>70%</strong> of the eligible amount.
            </p>
          </div>

          <div className="mt-12 space-y-10">
            {SECTIONS.map((section) => (
              <section key={section.title}>
                <h2 className="font-display text-xl font-bold text-navy">{section.title}</h2>
                <div className="mt-3 space-y-3 marketing-body">
                  {section.body.map((paragraph) => (
                    <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-24" id="request-refund">
            <p className="marketing-eyebrow">Submit a request</p>
            <h2 className="font-display text-2xl font-bold text-navy">File for a refund</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Complete the form below. Your request is logged in our system and we will email you
              within 2 business days.
            </p>
            <div className="marketing-form-panel mt-6">
              <RefundRequestForm />
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Prefer email?{" "}
              <a href={`mailto:${COMPANY.email}`} className="text-royal hover:underline">
                {COMPANY.email}
              </a>
              . {COMPANY.businessHours.days}, {COMPANY.businessHours.time}.
            </p>
          </div>
        </div>
      </div>

      <div className="marketing-info-banner mt-12">
        <p className="font-semibold text-navy">Need help before requesting a refund?</p>
        <p className="mt-1">
          <Link href="/contact" className="font-medium text-royal hover:underline">
            Contact us
          </Link>{" "}
          — we may be able to resolve your issue without a refund.
        </p>
      </div>
    </div>
  );
}
