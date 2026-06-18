import Link from "next/link";
import { Mail, MapPin, Phone, Star } from "lucide-react";
import { BrandLogo } from "@/components/marketing/BrandLogo";
import { COMPANY, NAV_LINKS, SERVICES } from "@/lib/site-content";

export function SiteFooter() {
  return (
    <footer
      className="marketing-chrome-footer border-t border-line text-muted"
      style={{
        background:
          "radial-gradient(ellipse 60% 70% at 50% 100%, rgba(231,175,140,0.12), transparent 60%), radial-gradient(ellipse 50% 60% at 90% 100%, rgba(150,170,200,0.1), transparent 55%), #f7f4ed",
      }}
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-2 lg:grid-cols-4 md:px-8">
        <div className="lg:col-span-1">
          <Link
            href="/"
            className="inline-flex items-center rounded-lg bg-offwhite px-2.5 py-1.5 ring-1 ring-line transition hover:ring-charcoal/20"
          >
            <BrandLogo className="h-10 w-auto" width={180} height={64} onDark />
          </Link>
          <p className="mx-auto mt-4 flex max-w-none items-center gap-3 text-[10px] font-medium uppercase tracking-[0.25em] text-muted">
            <span className="h-px flex-1 bg-line" aria-hidden />
            {COMPANY.tagline}
            <span className="h-px flex-1 bg-line" aria-hidden />
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            IT consulting, business registration, gadgets, and custom software for
            organisations across Namibia.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-medium uppercase tracking-wider text-charcoal">
            Company
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="underline-offset-2 transition hover:text-charcoal hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/refund-policy" className="underline-offset-2 transition hover:text-charcoal hover:underline">
                Refund Policy
              </Link>
            </li>
            <li>
              <Link href={COMPANY.researchAppPath} className="underline-offset-2 transition hover:text-charcoal hover:underline">
                Skyrapay Research
              </Link>
            </li>
            <li>
              <Link href="/business/login" className="underline-offset-2 transition hover:text-charcoal hover:underline">
                Staff login
              </Link>
            </li>
            <li>
              <a
                href={COMPANY.googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 transition hover:text-sky"
              >
                <Star className="h-3.5 w-3.5 fill-charcoal/70 text-charcoal/70" />
                Leave a Google review
              </a>
            </li>
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-muted">
            Read our{" "}
            <Link href="/refund-policy" className="text-charcoal underline underline-offset-2 transition hover:opacity-70">
              refund policy
            </Link>{" "}
            for business services, hosting, shop orders, and how to{" "}
            <Link
              href="/refund-policy#request-refund"
              className="text-charcoal underline underline-offset-2 transition hover:opacity-70"
            >
              request a refund
            </Link>
            .
          </p>
        </div>

        <div>
          <h3 className="text-xs font-medium uppercase tracking-wider text-charcoal">
            Services
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {SERVICES.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="underline-offset-2 transition hover:text-charcoal hover:underline">
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-medium uppercase tracking-wider text-charcoal">
            Contact
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-charcoal/60" />
              <a href={`mailto:${COMPANY.email}`} className="break-all transition hover:text-sky">
                {COMPANY.email}
              </a>
            </li>
            {COMPANY.phones.map((num) => (
              <li key={num} className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-charcoal/60" />
                <a href={`tel:${num.replace(/\s/g, "")}`} className="underline-offset-2 transition hover:text-charcoal hover:underline">
                  {num}
                </a>
              </li>
            ))}
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-charcoal/60" />
              <span>
                {COMPANY.location}
                <br />
                {COMPANY.poBox}
              </span>
            </li>
            <li className="text-xs text-muted">
              {COMPANY.businessHours.days}, {COMPANY.businessHours.time}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line py-5 text-center text-xs text-muted">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-3 px-4 sm:flex-row sm:gap-6">
          <p>© {new Date().getFullYear()} {COMPANY.name}. All rights reserved.</p>
          <nav aria-label="Legal" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <Link href="/refund-policy" className="underline-offset-2 transition hover:text-charcoal hover:underline">
              Refund Policy
            </Link>
            <Link href="/refund-policy#request-refund" className="underline-offset-2 transition hover:text-charcoal hover:underline">
              Request a refund
            </Link>
            <Link href="/contact" className="underline-offset-2 transition hover:text-charcoal hover:underline">
              Contact
            </Link>
            <a
              href={COMPANY.googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-2 transition hover:text-charcoal hover:underline"
            >
              Google review
            </a>
            <Link href="/business/login" className="underline-offset-2 transition hover:text-charcoal hover:underline">
              Staff login
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
