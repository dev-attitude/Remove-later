import Link from "next/link";
import {
  CheckCircle2,
  Cloud,
  Database,
  Globe,
  Mail,
  Server,
  Shield,
} from "lucide-react";
import { HostingOfferingCard } from "@/components/hosting/HostingOfferingCard";
import { BRAND, SKYRAPAY_HOSTING } from "@/lib/brand";
import {
  COMPANY,
  HOSTING_INCLUDED,
  HOSTING_OFFERINGS,
  HOSTING_PLATFORM_FEATURES,
  HOSTING_WEBSITE_PLANS,
  SKYRAPAY_SERVICE_CATALOGUE,
} from "@/lib/site-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${SKYRAPAY_HOSTING.label} | Domains, Websites, Email & MySQL`,
  description:
    "Register domains, host websites, create business email and MySQL databases on cPanel — GM Consultations, Namibia.",
};

const PLATFORM_ICONS = [Globe, Cloud, Mail, Database, Shield, Server] as const;

export default function HostingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
      <div className="max-w-3xl">
        <p className="marketing-eyebrow">{SKYRAPAY_HOSTING.name}</p>
        <h1 className="marketing-page-title">
          Domains, websites, email &amp; databases—your way
        </h1>
        <p className="mt-4 marketing-lead">
          Register your domain, host your website, create business email accounts, and set up MySQL
          databases—all from your own <strong>cPanel account</strong>, managed by{" "}
          {BRAND.companyLegal}. Enterprise infrastructure via our Namecheap reseller platform, with
          local support from {COMPANY.location}.
        </p>
      </div>

      <div className="marketing-info-banner mt-8 max-w-3xl">
        <p className="font-semibold">Order hosting online</p>
        <p className="mt-1 text-sm opacity-90">
          Search domains, choose a plan, checkout, and manage everything from your client account at{" "}
          {SKYRAPAY_HOSTING.domain}/hosting.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/hosting/domains" className="marketing-btn-primary text-sm">
            Buy your own domain name
          </Link>
          <Link href="/hosting/plans" className="marketing-btn-secondary text-sm">
            View hosting plans
          </Link>
          <Link href="/hosting/pricing" className="marketing-btn-secondary text-sm">
            Full price list
          </Link>
          <Link
            href="/hosting/dashboard"
            className="inline-flex items-center rounded-lg border border-white/30 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
          >
            My account
          </Link>
        </div>
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
        <h2 className="mt-2 text-3xl font-bold text-navy">What you can do with our hosting</h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Order any service on its own or as a bundle—domain + hosting + email is the most common
          package for new businesses going online.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {HOSTING_OFFERINGS.map((plan) => (
          <HostingOfferingCard key={plan.id} plan={plan} />
        ))}
      </div>

      <div className="mt-20">
        <p className="marketing-eyebrow">Hosting plans</p>
        <h2 className="mt-2 text-3xl font-bold text-navy">Website hosting packages</h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          All plans include cPanel, free SSL, email accounts, MySQL databases, FTP access, and
          one-click WordPress install. Prices shown in your local currency — invoiced in NAD.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {HOSTING_WEBSITE_PLANS.map((plan) => (
          <HostingOfferingCard key={plan.id} plan={plan} />
        ))}
      </div>

      <div className="mt-20 rounded-2xl border border-slate-200 bg-slate-50 p-8 md:p-10">
        <h2 className="text-2xl font-bold text-navy">Included with every hosting account</h2>
        <p className="mt-2 text-slate-600">
          Whether you are a startup or an established business, your hosting account comes
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

      <div className="mt-20">
        <p className="marketing-eyebrow">Technology &amp; business solutions</p>
        <h2 className="mt-2 text-3xl font-bold text-navy">
          One provider for everything around your hosting
        </h2>
        <p className="mt-2 max-w-3xl text-slate-600">
          {BRAND.companyLegal} is a one-stop technology and business solutions provider. Clients who
          register a company with us later add a website, hosting, business email, security, and
          ongoing IT support—one team, one invoice.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {SKYRAPAY_SERVICE_CATALOGUE.map((cat) => (
          <article
            key={cat.id}
            className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h3 className="text-lg font-bold text-navy">{cat.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{cat.summary}</p>
            <ul className="mt-4 flex-1 space-y-2">
              {cat.items.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href={cat.href}
              className="mt-5 inline-flex items-center text-sm font-semibold text-brand-700 hover:underline"
            >
              {cat.cta} →
            </Link>
          </article>
        ))}
      </div>

      <div className="mt-16 rounded-2xl bg-gradient-to-r from-navy to-royal p-8 text-center text-white md:p-12">
        <h2 className="text-2xl font-bold md:text-3xl">Need a website built too?</h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-200">
          {BRAND.companyName} designs your site, registers your domain, sets up
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
            Start your order
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
