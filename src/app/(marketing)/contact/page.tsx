import { Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/marketing/ContactForm";
import { COMPANY } from "@/lib/site-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | GM Consultations",
  description: "Get in touch with GM Consultations for IT, business, and development services.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-400">Contact</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-white">Let&apos;s talk</h1>
          <p className="mt-4 text-slate-400">
            Questions about a service, gadget order, or website project? Send a message—we
            typically respond within one business day.
          </p>

          <ul className="mt-10 space-y-6">
            <li className="flex gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600/20">
                <Mail className="h-5 w-5 text-brand-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Email</p>
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="text-white hover:text-brand-300"
                >
                  {COMPANY.email}
                </a>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600/20">
                <Phone className="h-5 w-5 text-brand-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Phone</p>
                <p className="text-white">{COMPANY.phone}</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600/20">
                <MapPin className="h-5 w-5 text-brand-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Location</p>
                <p className="text-white">{COMPANY.location}</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/30 p-8">
          <h2 className="text-lg font-semibold text-white">Send a message</h2>
          <div className="mt-6">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
