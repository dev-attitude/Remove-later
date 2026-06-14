import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { BrandLogo } from "@/components/marketing/BrandLogo";
import { COMPANY, NAV_LINKS, SERVICES } from "@/lib/site-content";

export function SiteFooter() {
  return (
    <footer className="marketing-chrome-footer border-t border-white/10 text-slate-200">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-2 lg:grid-cols-4 md:px-8">
        <div className="lg:col-span-1">
          <Link href="/" className="inline-block rounded-lg bg-white px-2 py-1">
            <BrandLogo className="h-12 w-auto" width={180} height={64} onDark />
          </Link>
          <p className="mx-auto mt-4 flex max-w-none items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">
            <span className="h-px flex-1 bg-white/20" aria-hidden />
            {COMPANY.tagline}
            <span className="h-px flex-1 bg-white/20" aria-hidden />
          </p>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            IT consulting, business registration, gadgets, and custom software for
            organisations across Namibia.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Company
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition hover:text-sky">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/refund-policy" className="transition hover:text-sky">
                Refund Policy
              </Link>
            </li>
            <li>
              <Link href={COMPANY.researchAppPath} className="transition hover:text-sky">
                Skyrapay Research
              </Link>
            </li>
            <li>
              <Link href="/business/login" className="transition hover:text-sky">
                Staff login
              </Link>
            </li>
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            Read our{" "}
            <Link href="/refund-policy" className="text-sky transition hover:text-white">
              refund policy
            </Link>{" "}
            for business services, hosting, shop orders, and how to{" "}
            <Link
              href="/refund-policy#request-refund"
              className="text-sky transition hover:text-white"
            >
              request a refund
            </Link>
            .
          </p>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Services
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {SERVICES.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="transition hover:text-sky">
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Contact
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-sky" />
              <a href={`mailto:${COMPANY.email}`} className="break-all transition hover:text-sky">
                {COMPANY.email}
              </a>
            </li>
            {COMPANY.phones.map((num) => (
              <li key={num} className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-sky" />
                <a href={`tel:${num.replace(/\s/g, "")}`} className="transition hover:text-sky">
                  {num}
                </a>
              </li>
            ))}
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky" />
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

      <div className="border-t border-white/10 bg-black/10 py-5 text-center text-xs text-slate-300">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-3 px-4 sm:flex-row sm:gap-6">
          <p>© {new Date().getFullYear()} {COMPANY.name}. All rights reserved.</p>
          <nav aria-label="Legal" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <Link href="/refund-policy" className="transition hover:text-sky">
              Refund Policy
            </Link>
            <Link href="/refund-policy#request-refund" className="transition hover:text-sky">
              Request a refund
            </Link>
            <Link href="/contact" className="transition hover:text-sky">
              Contact
            </Link>
            <Link href="/business/login" className="transition hover:text-sky">
              Staff login
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
