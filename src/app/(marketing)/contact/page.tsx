import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/marketing/ContactForm";
import { COMPANY } from "@/lib/site-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | GM Consultations",
  description: "Get in touch with GM Consultations for IT, business, and development services.",
};

export default function ContactPage() {
  const { businessHours } = COMPANY;

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-400">Contact</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-white">Let&apos;s talk</h1>
          <p className="mt-4 text-slate-400">
            Questions about a service, gadget order, or website project? Reach us by phone or
            email—we respond during business hours.
          </p>

          <div className="mt-6 rounded-xl border border-brand-500/25 bg-brand-950/40 px-4 py-3 text-sm text-slate-300">
            <p className="font-semibold text-brand-200">
              {businessHours.days} · {businessHours.time}
            </p>
            <p className="mt-1 text-slate-400">{businessHours.note}</p>
          </div>

          <ul className="mt-10 space-y-6">
            <li className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-600/20">
                <Mail className="h-5 w-5 text-brand-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Email</p>
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="break-all text-white hover:text-brand-300"
                >
                  {COMPANY.email}
                </a>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-600/20">
                <Phone className="h-5 w-5 text-brand-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Phone / WhatsApp</p>
                <ul className="mt-1 space-y-1">
                  {COMPANY.phones.map((num) => (
                    <li key={num}>
                      <a
                        href={`tel:${num.replace(/\s/g, "")}`}
                        className="text-white hover:text-brand-300"
                      >
                        {num}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-600/20">
                <MapPin className="h-5 w-5 text-brand-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Offices</p>
                <p className="text-white">{COMPANY.offices.join(" · ")}</p>
                <p className="mt-2 text-sm text-slate-400">Postal address</p>
                <p className="text-white">{COMPANY.poBox}</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-600/20">
                <Clock className="h-5 w-5 text-brand-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Business hours</p>
                <p className="text-white">
                  {businessHours.days}, {businessHours.time}
                </p>
              </div>
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/30 p-8">
          <h2 className="text-lg font-semibold text-white">Send a message</h2>
          <p className="mt-2 text-sm text-slate-400">
            For business consultations, include your preferred date and time between{" "}
            {businessHours.time} on weekdays.
          </p>
          <div className="mt-6">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
