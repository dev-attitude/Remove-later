import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";
import { COMPANY, NAV_LINKS, SERVICES } from "@/lib/site-content";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#040810] text-slate-400">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-2 lg:grid-cols-4 md:px-8">
        <div className="lg:col-span-1">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image
              src="/logo.png"
              alt={COMPANY.name}
              width={56}
              height={56}
              className="h-14 w-14 rounded-lg object-contain"
            />
          </Link>
          <p className="mt-4 text-sm leading-relaxed">
            {COMPANY.name} delivers IT, business consulting, quality gadgets, and
            custom software—helping organisations across Namibia and beyond succeed
            digitally.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
            Company
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-brand-300">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href={COMPANY.researchAppPath} className="hover:text-brand-300">
                Research Suite App
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
            Services
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {SERVICES.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="hover:text-brand-300">
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
            Contact
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
              <a href={`mailto:${COMPANY.email}`} className="hover:text-white">
                {COMPANY.email}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
              <span>{COMPANY.phone}</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
              <span>{COMPANY.location}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
      </div>
    </footer>
  );
}
