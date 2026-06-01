import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";
import { COMPANY, NAV_LINKS, SERVICES } from "@/lib/site-content";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-100 bg-slate-50">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-2 lg:grid-cols-4 md:px-8">
        <div className="lg:col-span-1">
          <Link href="/" className="inline-block">
            <Image
              src="/logo.png"
              alt={COMPANY.name}
              width={180}
              height={64}
              className="h-12 w-auto object-contain"
            />
          </Link>
          <p className="marketing-tagline-rule mt-4 !max-w-none !text-[10px]">
            {COMPANY.tagline}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            IT consulting, business registration, gadgets, and custom software for
            organisations across Namibia.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Company
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition hover:text-brand-700">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href={COMPANY.researchAppPath} className="transition hover:text-brand-700">
                Research Suite
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Services
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
            {SERVICES.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="transition hover:text-brand-700">
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Contact
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
              <a href={`mailto:${COMPANY.email}`} className="break-all hover:text-brand-700">
                {COMPANY.email}
              </a>
            </li>
            {COMPANY.phones.map((num) => (
              <li key={num} className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                <a href={`tel:${num.replace(/\s/g, "")}`} className="hover:text-brand-700">
                  {num}
                </a>
              </li>
            ))}
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
              <span>
                {COMPANY.location}
                <br />
                {COMPANY.poBox}
              </span>
            </li>
            <li className="text-xs text-slate-500">
              {COMPANY.businessHours.days}, {COMPANY.businessHours.time}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
      </div>
    </footer>
  );
}
