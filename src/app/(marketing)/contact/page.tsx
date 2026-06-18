import { Suspense } from "react";
import { Clock, Mail, MapPin, Phone, Star } from "lucide-react";
import { ContactForm } from "@/components/marketing/ContactForm";
import { BRAND } from "@/lib/brand";
import { COMPANY } from "@/lib/site-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Contact | ${BRAND.companyName}`,
  description: `Get in touch with ${BRAND.companyLegal} for IT, business, and development services.`,
};

export default function ContactPage() {
  const { businessHours } = COMPANY;

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <p className="marketing-eyebrow">Contact</p>
          <h1 className="marketing-page-title">Let&apos;s talk</h1>
          <p className="mt-4 marketing-lead">
            Questions about a service, gadget order, or website project? Reach us by phone or
            email—we respond during business hours.
          </p>

          <div className="marketing-info-banner mt-6">
            <p className="font-semibold">
              {businessHours.days} · {businessHours.time}
            </p>
            <p className="mt-1 opacity-90">{businessHours.note}</p>
          </div>

          <ul className="mt-10 space-y-6">
            <li className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-100">
                <Mail className="h-5 w-5 text-brand-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted">Email</p>
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="break-all font-medium text-charcoal hover:text-brand-600"
                >
                  {COMPANY.email}
                </a>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-100">
                <Phone className="h-5 w-5 text-brand-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted">Phone / WhatsApp</p>
                <ul className="mt-1 space-y-1">
                  {COMPANY.phones.map((num) => (
                    <li key={num}>
                      <a
                        href={`tel:${num.replace(/\s/g, "")}`}
                        className="font-medium text-charcoal hover:text-brand-600"
                      >
                        {num}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-100">
                <MapPin className="h-5 w-5 text-brand-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted">Offices</p>
                <p className="font-medium text-charcoal">{COMPANY.offices.join(" · ")}</p>
                <p className="mt-2 text-sm text-muted">Postal address</p>
                <p className="text-charcoal">{COMPANY.poBox}</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-100">
                <Clock className="h-5 w-5 text-brand-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted">Business hours</p>
                <p className="font-medium text-charcoal">
                  {businessHours.days}, {businessHours.time}
                </p>
              </div>
            </li>
          </ul>

          <div className="mt-10 rounded-xl border border-amber-100 bg-amber-50/80 p-5">
            <p className="text-sm font-semibold text-charcoal">Happy with our service?</p>
            <p className="mt-1 text-sm text-muted">
              A Google review helps other businesses and students find us in Namibia.
            </p>
            <a
              href={COMPANY.googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800"
            >
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              Leave a review on Google
            </a>
          </div>
        </div>

        <div className="marketing-form-panel">
          <h2 className="text-lg font-semibold text-charcoal">Send a message</h2>
          <p className="mt-2 text-sm text-muted">
            For business consultations, include your preferred date and time between{" "}
            {businessHours.time} on weekdays.
          </p>
          <div className="mt-6">
            <Suspense fallback={<p className="text-muted">Loading form…</p>}>
              <ContactForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
