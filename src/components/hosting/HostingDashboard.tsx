"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  Cloud,
  Database,
  ExternalLink,
  Globe,
  Mail,
  Server,
  Shield,
} from "lucide-react";
import { useHostingDemoAccount } from "@/lib/use-hosting-demo-account";
import { formatNad } from "@/lib/business-manage";

function EmptyDashboard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
      <Server className="mx-auto h-12 w-12 text-slate-300" />
      <h2 className="mt-4 text-xl font-bold text-navy">No hosting account yet</h2>
      <p className="mt-2 text-slate-600">
        Complete a demo order to see your dashboard, domains, hosting, email, and SSL here.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/hosting/domains" className="marketing-btn-primary">
          Buy your own domain name
        </Link>
        <Link href="/hosting/plans" className="marketing-btn-secondary">
          View hosting plans
        </Link>
      </div>
    </div>
  );
}

export function HostingDashboardOverview() {
  const { account, loaded } = useHostingDemoAccount();
  if (!loaded) return null;
  if (!account) return <EmptyDashboard />;

  const doneSteps = account.provisioningSteps.filter((s) => s.done).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          Order {account.orderId} · Welcome back, {account.customer.name}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Domains", value: account.domains.length, icon: Globe, href: "/hosting/dashboard/domains" },
          { label: "Hosting", value: account.plan ? 1 : 0, icon: Server, href: "/hosting/dashboard/hosting" },
          { label: "Private email", value: account.emails.length, icon: Mail, href: "/hosting/dashboard/email" },
          { label: "SSL certificates", value: account.ssl.length, icon: Shield, href: "/hosting/dashboard/ssl" },
        ].map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-royal/30 hover:shadow-md"
          >
            <Icon className="h-6 w-6 text-royal" />
            <p className="mt-3 text-2xl font-bold text-navy">{value}</p>
            <p className="text-sm text-slate-600">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="flex items-center gap-2 font-bold text-navy">
            <Cloud className="h-5 w-5 text-royal" />
            Provisioning progress
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {doneSteps} of {account.provisioningSteps.length} steps complete (demo)
          </p>
          <ul className="mt-4 space-y-3">
            {account.provisioningSteps.map((step) => (
              <li key={step.stepKey} className="flex items-center gap-3 text-sm">
                {step.done ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ) : (
                  <Circle className="h-5 w-5 text-slate-300" />
                )}
                <span className={step.done ? "text-navy" : "text-slate-500"}>{step.title}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="flex items-center gap-2 font-bold text-navy">
            <Server className="h-5 w-5 text-royal" />
            cPanel access
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Manage files, email, MySQL databases, and DNS from cPanel.
          </p>
          <div className="mt-4 rounded-lg bg-slate-50 p-4 font-mono text-xs text-slate-700">
            {account.cpanelUrl}
          </div>
          <button
            type="button"
            disabled
            className="mt-4 flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-400"
          >
            <ExternalLink className="h-4 w-4" />
            Open cPanel (available when live)
          </button>
        </div>
      </div>
    </div>
  );
}

export function HostingDashboardExpiring() {
  const { account, loaded } = useHostingDemoAccount();
  if (!loaded) return null;
  if (!account) return <EmptyDashboard />;

  const items = [
    ...account.domains.map((d) => ({
      name: d.domain,
      type: "Domain",
      expiresAt: d.expiresAt,
    })),
    ...account.ssl.map((s) => ({
      name: s.domain,
      type: "SSL",
      expiresAt: s.expiresAt,
    })),
  ];

  const now = Date.now();

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <h1 className="text-xl font-bold text-navy">Expiring / Expired</h1>
        <p className="text-sm text-slate-500">Domains and SSL certificates due for renewal</p>
      </div>
      {items.length === 0 ? (
        <p className="p-6 text-slate-600">Nothing expiring — add a domain to your account first.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.map((item) => {
            const exp = new Date(item.expiresAt).getTime();
            const daysLeft = Math.ceil((exp - now) / (24 * 60 * 60 * 1000));
            const label =
              daysLeft < 0 ? "Expired" : daysLeft <= 30 ? "Expiring soon" : "Active";
            return (
              <li
                key={`${item.type}-${item.name}`}
                className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
              >
                <div>
                  <p className="font-semibold text-navy">{item.name}</p>
                  <p className="text-xs text-slate-500">
                    {item.type} · Expires {new Date(item.expiresAt).toLocaleDateString()}
                    {daysLeft >= 0 ? ` (${daysLeft} days)` : ""}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    label === "Expired"
                      ? "bg-red-100 text-red-800"
                      : label === "Expiring soon"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function HostingDashboardDomains() {
  const { account, loaded } = useHostingDemoAccount();
  if (!loaded) return null;
  if (!account) return <EmptyDashboard />;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <h1 className="text-xl font-bold text-navy">Domain List</h1>
        <p className="text-sm text-slate-500">Register, renew, and manage DNS records</p>
      </div>
      {account.domains.length === 0 ? (
        <p className="p-6 text-slate-600">No domains on this account.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {account.domains.map((d) => (
            <li key={d.domain} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
              <div>
                <p className="font-semibold text-navy">{d.domain}</p>
                <p className="text-xs text-slate-500">
                  Expires {new Date(d.expiresAt).toLocaleDateString()}
                </p>
              </div>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold capitalize text-amber-800">
                {d.status}
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className="border-t border-slate-100 px-6 py-4">
        <Link href="/hosting/domains" className="text-sm font-semibold text-royal hover:underline">
          + Register another domain
        </Link>
      </div>
    </div>
  );
}

export function HostingDashboardHostingList() {
  const { account, loaded } = useHostingDemoAccount();
  if (!loaded) return null;
  if (!account) return <EmptyDashboard />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-navy">Hosting List</h1>
        <p className="text-sm text-slate-500">Your cPanel hosting accounts and resources</p>
      </div>

      {!account.plan ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-600">No hosting package on this account yet.</p>
          <Link href="/hosting/plans" className="mt-4 inline-block text-sm font-semibold text-royal hover:underline">
            View hosting plans
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <p className="font-bold text-navy">{account.plan.name}</p>
            <p className="text-sm text-royal">{formatNad(account.plan.price)}/month</p>
          </div>
          <ul className="divide-y divide-slate-100 px-6 py-2 text-sm text-slate-700">
            {account.plan.includes.map((item) => (
              <li key={item} className="py-2">
                {item}
              </li>
            ))}
          </ul>
          <div className="border-t border-slate-100 px-6 py-4">
            <p className="text-xs font-semibold uppercase text-slate-400">cPanel</p>
            <p className="mt-1 font-mono text-xs text-slate-600">{account.cpanelUrl}</p>
          </div>
        </div>
      )}

      {account.databases.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="flex items-center gap-2 font-bold text-navy">
              <Database className="h-5 w-5 text-royal" />
              MySQL databases
            </h2>
          </div>
          <ul className="divide-y divide-slate-100">
            {account.databases.map((db) => (
              <li key={db.name} className="flex justify-between px-6 py-4 text-sm">
                <span className="font-mono font-semibold text-navy">{db.name}</span>
                <span className="text-slate-500">
                  {db.engine} · {db.size}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function HostingDashboardEmail() {
  const { account, loaded } = useHostingDemoAccount();
  if (!loaded) return null;
  if (!account) return <EmptyDashboard />;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <h1 className="text-xl font-bold text-navy">Private Email</h1>
        <p className="text-sm text-slate-500">Business mailboxes on your domain</p>
      </div>
      {account.emails.length === 0 ? (
        <p className="p-6 text-slate-600">Add a hosting plan to create email accounts.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {account.emails.map((m) => (
            <li key={m.address} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
              <p className="font-semibold text-navy">{m.address}</p>
              <p className="text-sm text-slate-500">
                {m.storageUsed} / {m.quota}
              </p>
            </li>
          ))}
        </ul>
      )}
      <div className="border-t border-slate-100 px-6 py-4">
        <button type="button" disabled className="text-sm font-semibold text-slate-400">
          + Create mailbox (available when live)
        </button>
      </div>
    </div>
  );
}

export function HostingDashboardSsl() {
  const { account, loaded } = useHostingDemoAccount();
  if (!loaded) return null;
  if (!account) return <EmptyDashboard />;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <h1 className="text-xl font-bold text-navy">SSL Certificates</h1>
        <p className="text-sm text-slate-500">AutoSSL installs and renews HTTPS for your domains</p>
      </div>
      {account.ssl.length === 0 ? (
        <p className="p-6 text-slate-600">No SSL certificates yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {account.ssl.map((s) => (
            <li key={s.domain} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
              <p className="font-semibold text-navy">{s.domain}</p>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold capitalize text-amber-800">
                {s.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function HostingDashboardGrowthTools() {
  const { account, loaded } = useHostingDemoAccount();
  if (!loaded) return null;
  if (!account) return <EmptyDashboard />;

  const tools = [
    { name: "Logo Maker", desc: "Create a logo for your brand (demo)" },
    { name: "Business Card Maker", desc: "Design print-ready business cards" },
    { name: "Site Maker", desc: "Launch a one-page site on your domain" },
    { name: "Social media kit", desc: "Banners and posts sized for major platforms" },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold text-navy">Growth Tools</h1>
      <p className="mt-1 text-sm text-slate-500">Marketing and branding tools for your business (demo)</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {tools.map((t) => (
          <div key={t.name} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="font-semibold text-navy">{t.name}</p>
            <p className="mt-1 text-sm text-slate-600">{t.desc}</p>
            <button type="button" disabled className="mt-3 text-sm font-medium text-slate-400">
              Open (coming soon)
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HostingDashboardApps() {
  const { account, loaded } = useHostingDemoAccount();
  if (!loaded) return null;
  if (!account) return <EmptyDashboard />;

  const apps = [
    { name: "WordPress", desc: "One-click install from cPanel" },
    { name: "Joomla", desc: "CMS for blogs and business sites" },
    { name: "phpMyAdmin", desc: "Manage MySQL databases" },
    { name: "Roundcube Webmail", desc: "Access email in the browser" },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold text-navy">Apps</h1>
      <p className="mt-1 text-sm text-slate-500">Install apps on your hosting account via cPanel</p>
      <ul className="mt-6 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-sm">
        {apps.map((app) => (
          <li key={app.name} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
            <div>
              <p className="font-semibold text-navy">{app.name}</p>
              <p className="text-sm text-slate-500">{app.desc}</p>
            </div>
            <button type="button" disabled className="text-sm font-medium text-slate-400">
              Install (demo)
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HostingDashboardOffers() {
  const { account, loaded } = useHostingDemoAccount();
  if (!loaded) return null;
  if (!account) return <EmptyDashboard />;

  const offers = [
    { title: "20% off annual hosting", detail: "Pay yearly and save on Business or Premium plans" },
    { title: "Free domain with Premium", detail: "Register one .com domain free for the first year" },
    { title: "Managed maintenance trial", detail: "First month of website maintenance at 50% off" },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold text-navy">My Offers</h1>
      <p className="mt-1 text-sm text-slate-500">Promotions available on your account (demo)</p>
      <div className="mt-6 space-y-4">
        {offers.map((o) => (
          <div
            key={o.title}
            className="rounded-xl border border-royal/20 bg-gradient-to-r from-brand-50 to-white p-5"
          >
            <p className="font-semibold text-navy">{o.title}</p>
            <p className="mt-1 text-sm text-slate-600">{o.detail}</p>
            <button type="button" disabled className="mt-3 text-sm font-semibold text-slate-400">
              Redeem (demo)
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HostingDashboardProfile() {
  const { account, loaded, displayName } = useHostingDemoAccount();
  if (!loaded) return null;
  if (!account) return <EmptyDashboard />;

  return (
    <div className="max-w-lg rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <h1 className="text-xl font-bold text-navy">Profile</h1>
        <p className="text-sm text-slate-500">Account holder details</p>
      </div>
      <dl className="divide-y divide-slate-100 px-6 py-2 text-sm">
        <div className="flex justify-between py-3">
          <dt className="text-slate-500">Display name</dt>
          <dd className="font-semibold text-navy">{displayName}</dd>
        </div>
        <div className="flex justify-between py-3">
          <dt className="text-slate-500">Full name</dt>
          <dd className="font-semibold text-navy">{account.customer.name}</dd>
        </div>
        <div className="flex justify-between py-3">
          <dt className="text-slate-500">Email</dt>
          <dd className="font-semibold text-navy">{account.customer.email}</dd>
        </div>
        {account.customer.phone && (
          <div className="flex justify-between py-3">
            <dt className="text-slate-500">Phone</dt>
            <dd className="font-semibold text-navy">{account.customer.phone}</dd>
          </div>
        )}
        <div className="flex justify-between py-3">
          <dt className="text-slate-500">Order ID</dt>
          <dd className="font-mono text-xs text-navy">{account.orderId}</dd>
        </div>
      </dl>
    </div>
  );
}

export function HostingDashboardDatabases() {
  return <HostingDashboardHostingList />;
}

export function HostingDashboardBackups() {
  return <HostingDashboardHostingList />;
}
