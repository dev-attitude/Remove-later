import { Suspense } from "react";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
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
                <p className="text-sm font-medium text-slate-500">Email</p>
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="break-all font-medium text-slate-900 hover:text-brand-600"
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
                <p className="text-sm font-medium text-slate-500">Phone / WhatsApp</p>
                <ul className="mt-1 space-y-1">
                  {COMPANY.phones.map((num) => (
                    <li key={num}>
                      <a
                        href={`tel:${num.replace(/\s/g, "")}`}
                        className="font-medium text-slate-900 hover:text-brand-600"
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
                <p className="text-sm font-medium text-slate-500">Offices</p>
                <p className="font-medium text-slate-900">{COMPANY.offices.join(" · ")}</p>
                <p className="mt-2 text-sm text-slate-500">Postal address</p>
                <p className="text-slate-900">{COMPANY.poBox}</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-100">
                <Clock className="h-5 w-5 text-brand-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Business hours</p>
                <p className="font-medium text-slate-900">
                  {businessHours.days}, {businessHours.time}
                </p>
              </div>
            </li>
          </ul>
        </div>

        <div className="marketing-form-panel">
          <h2 className="text-lg font-semibold text-slate-900">Send a message</h2>
          <p className="mt-2 text-sm text-slate-600">
            For business consultations, include your preferred date and time between{" "}
            {businessHours.time} on weekdays.
          </p>
          <div className="mt-6">
            <Suspense fallback={<p className="text-slate-500">Loading form…</p>}>
              <ContactForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
