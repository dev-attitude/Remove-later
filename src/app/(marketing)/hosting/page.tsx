import Link from "next/link";
import {
  CheckCircle2,
  Cloud,
  Database,
  Globe,
  HardDrive,
  Mail,
  Server,
  Shield,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PriceDisplay } from "@/components/marketing/PriceDisplay";
import { BRAND, SKYRAPAY_HOSTING } from "@/lib/brand";
import {
  COMPANY,
  HOSTING_HIGHLIGHTS,
  HOSTING_INCLUDED,
  HOSTING_OFFERINGS,
  HOSTING_PLATFORM_FEATURES,
  HOSTING_WEBSITE_PLANS,
  type BusinessPackage,
} from "@/lib/site-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${SKYRAPAY_HOSTING.name} | Domains, Websites, Email & MySQL`,
  description:
    "Skyrapay Hosting — register domains, host websites, create business email and MySQL databases on cPanel. Namibian support from Skyrapay Consultations.",
};

const OFFERING_ICONS: Record<string, LucideIcon> = {
  "hosting-domain": Globe,
  "hosting-website": Cloud,
  "hosting-email": Mail,
  "hosting-mysql": Database,
  "hosting-backup": HardDrive,
  "hosting-ssl": Shield,
  "hosting-maintenance": Wrench,
};

const PLATFORM_ICONS = [Globe, Cloud, Mail, Database, Shield, Server] as const;
const HIGHLIGHT_ICONS = [Server, Cloud, Shield] as const;

function OfferingCard({ plan }: { plan: BusinessPackage }) {
  const Icon = OFFERING_ICONS[plan.id] ?? Cloud;
  return (
    <article
      className={`marketing-service-card relative flex flex-col ${
        plan.popular ? "border-royal/40 ring-2 ring-sky/30" : ""
      }`}
    >
      {plan.popular && (
        <span className="absolute -top-3 right-4 rounded-full bg-royal px-3 py-0.5 text-xs font-bold text-white">
          Most popular
        </span>
      )}
      <Icon className="h-8 w-8 text-royal" />
      <h3 className="mt-4 text-xl font-bold text-navy">{plan.name}</h3>
      <p className="mt-2 flex-1 text-sm text-slate-600">{plan.description}</p>
      <div className="mt-4">
        {plan.price > 0 ? (
          <PriceDisplay
            original={plan.price}
            currency="NAD"
            priceLabel={plan.priceLabel ?? "From"}
            size="md"
          />
        ) : (
          <p className="text-lg font-bold text-navy">{plan.priceLabel ?? "Included with hosting"}</p>
        )}
      </div>
      <ul className="mt-4 space-y-2 text-sm text-slate-700">
        {plan.includes.map((item) => (
          <li key={item} className="flex gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            {item}
          </li>
        ))}
      </ul>
      <Link
        href={
          plan.id === "hosting-domain"
            ? "/hosting/domains"
            : plan.id.startsWith("hosting-") && ["hosting-starter", "hosting-business", "hosting-premium"].includes(plan.id)
              ? `/hosting/plans`
              : plan.id === "hosting-website"
                ? "/hosting/plans"
                : `/hosting/plans`
        }
        className="mt-6 block rounded-lg border border-royal/30 bg-brand-50 py-2.5 text-center text-sm font-semibold text-navy transition hover:bg-sky/20"
      >
        {plan.id === "hosting-domain" ? "Buy your own domain name" : "Add to order"}
      </Link>
    </article>
  );
}

export default function HostingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
      <div className="max-w-3xl">
        <p className="marketing-eyebrow">{SKYRAPAY_HOSTING.name}</p>
        <h1 className="marketing-page-title">
          Domains, websites, email &amp; databases—your way
        </h1>
        <p className="mt-4 marketing-lead">
          <strong>{SKYRAPAY_HOSTING.name}</strong> is the hosting brand of {BRAND.companyLegal}.
          Register your domain, host your website, create business email accounts, and set up MySQL
          databases—all from your own <strong>cPanel account</strong>. Powered by enterprise
          infrastructure via our Namecheap reseller platform, with local support from{" "}
          {COMPANY.location}.
        </p>
      </div>

      <div className="marketing-info-banner mt-8 max-w-3xl">
        <p className="font-semibold">Try the full hosting platform (demo)</p>
        <p className="mt-1 text-sm opacity-90">
          Search domains, pick a plan, checkout, and open your client dashboard — all working in
          demo mode now. When {SKYRAPAY_HOSTING.domain} and Namecheap reseller go live, the same
          flow connects to real provisioning.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/hosting/domains" className="marketing-btn-primary text-sm">
            Buy your own domain name
          </Link>
          <Link href="/hosting/plans" className="marketing-btn-secondary text-sm">
            View hosting plans
          </Link>
          <Link
            href="/hosting/dashboard"
            className="inline-flex items-center rounded-lg border border-white/30 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
          >
            My account
          </Link>
        </div>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {HOSTING_HIGHLIGHTS.map((item, i) => {
          const Icon = HIGHLIGHT_ICONS[i] ?? Cloud;
          return (
            <article
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-navy">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.text}</p>
            </article>
          );
        })}
      </div>

      <div className="mt-20">
        <p className="marketing-eyebrow">Your cPanel account</p>
        <h2 className="mt-2 text-3xl font-bold text-navy">Everything in one hosting account</h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Each customer gets their own cPanel login. Buy a domain, upload a website, create email
          mailboxes, and spin up MySQL databases—no need to call us for every small change.
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {HOSTING_PLATFORM_FEATURES.map((item, i) => {
          const Icon = PLATFORM_ICONS[i] ?? Cloud;
          return (
            <article
              key={item.title}
              className="flex gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-navy">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{item.text}</p>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-20">
        <p className="marketing-eyebrow">Services</p>
        <h2 className="mt-2 text-3xl font-bold text-navy">What you can do with Skyrapay Hosting</h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Order any service on its own or as a bundle—domain + hosting + email is the most common
          package for new businesses going online.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {HOSTING_OFFERINGS.map((plan) => (
          <OfferingCard key={plan.id} plan={plan} />
        ))}
      </div>

      <div className="mt-20">
        <p className="marketing-eyebrow">Hosting plans</p>
        <h2 className="mt-2 text-3xl font-bold text-navy">Website hosting packages</h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          All plans include cPanel, free SSL, email accounts, MySQL databases, FTP access, and
          one-click WordPress install. Prices in NAD, billed monthly.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {HOSTING_WEBSITE_PLANS.map((plan) => (
          <OfferingCard key={plan.id} plan={plan} />
        ))}
      </div>

      <div className="mt-20 rounded-2xl border border-slate-200 bg-slate-50 p-8 md:p-10">
        <h2 className="text-2xl font-bold text-navy">Included with every hosting account</h2>
        <p className="mt-2 text-slate-600">
          Whether you are a startup or an established business, your Skyrapay Hosting account comes
          with the full toolkit to run your online presence.
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {HOSTING_INCLUDED.map((item) => (
            <li key={item} className="flex gap-2 text-sm text-slate-700">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-16 rounded-2xl bg-gradient-to-r from-navy to-royal p-8 text-center text-white md:p-12">
        <h2 className="text-2xl font-bold md:text-3xl">Need a website built too?</h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-200">
          {BRAND.companyName} designs your site, registers your domain on Skyrapay Hosting, sets up
          email and MySQL, and optionally maintains everything—one team from launch to ongoing care.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/shop" className="marketing-btn-secondary">
            View website packages
          </Link>
          <Link
            href="/hosting/domains"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-navy transition hover:bg-sky/90"
          >
            Start demo order
          </Link>
          <Link
            href="/contact?service=hosting"
            className="inline-flex items-center gap-2 rounded-lg border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Contact us instead
          </Link>
        </div>
      </div>
    </div>
  );
}
