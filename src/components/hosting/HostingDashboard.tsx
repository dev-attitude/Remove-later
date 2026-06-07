"use client";

import { useEffect, useState } from "react";
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
import {
  HOSTING_DEMO_STORAGE_KEY,
  type HostingDemoAccount,
} from "@/lib/hosting-demo";
import { formatNad } from "@/lib/business-manage";

function useDemoAccount() {
  const [account, setAccount] = useState<HostingDemoAccount | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HOSTING_DEMO_STORAGE_KEY);
      if (raw) setAccount(JSON.parse(raw) as HostingDemoAccount);
    } catch {
      setAccount(null);
    }
    setLoaded(true);
  }, []);

  return { account, loaded };
}

function EmptyDashboard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
      <Server className="mx-auto h-12 w-12 text-slate-300" />
      <h2 className="mt-4 text-xl font-bold text-navy">No hosting account yet</h2>
      <p className="mt-2 text-slate-600">
        Complete a demo order to see your domains, email, MySQL databases, and SSL here.
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
  const { account, loaded } = useDemoAccount();
  if (!loaded) return null;
  if (!account) return <EmptyDashboard />;

  const doneSteps = account.provisioningSteps.filter((s) => s.done).length;

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Order {account.orderId}</p>
            <h1 className="text-2xl font-bold text-navy">Welcome, {account.customer.name}</h1>
            <p className="mt-1 text-sm text-slate-600">{account.customer.email}</p>
          </div>
          {account.plan && (
            <div className="rounded-lg bg-brand-50 px-4 py-2 text-right">
              <p className="text-xs text-slate-500">Hosting plan</p>
              <p className="font-bold text-navy">{account.plan.name}</p>
              <p className="text-sm text-royal">{formatNad(account.plan.price)}/mo</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Domains", value: account.domains.length, icon: Globe, href: "/hosting/dashboard/domains" },
          { label: "Email accounts", value: account.emails.length, icon: Mail, href: "/hosting/dashboard/email" },
          { label: "MySQL DBs", value: account.databases.length, icon: Database, href: "/hosting/dashboard/databases" },
          { label: "SSL certs", value: account.ssl.length, icon: Shield, href: "/hosting/dashboard/ssl" },
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
            When provisioning completes, log in to manage files, email, databases, and DNS.
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

export function HostingDashboardDomains() {
  const { account, loaded } = useDemoAccount();
  if (!loaded) return null;
  if (!account) return <EmptyDashboard />;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <h1 className="text-xl font-bold text-navy">Domains</h1>
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

export function HostingDashboardEmail() {
  const { account, loaded } = useDemoAccount();
  if (!loaded) return null;
  if (!account) return <EmptyDashboard />;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <h1 className="text-xl font-bold text-navy">Business email</h1>
        <p className="text-sm text-slate-500">Create and manage mailboxes on your domain</p>
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
        <button
          type="button"
          disabled
          className="text-sm font-semibold text-slate-400"
        >
          + Create mailbox (available when live)
        </button>
      </div>
    </div>
  );
}

export function HostingDashboardDatabases() {
  const { account, loaded } = useDemoAccount();
  if (!loaded) return null;
  if (!account) return <EmptyDashboard />;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <h1 className="text-xl font-bold text-navy">MySQL databases</h1>
        <p className="text-sm text-slate-500">Manage databases via cPanel or phpMyAdmin</p>
      </div>
      {account.databases.length === 0 ? (
        <p className="p-6 text-slate-600">No databases yet — add a hosting plan first.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {account.databases.map((db) => (
            <li key={db.name} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
              <div>
                <p className="font-mono font-semibold text-navy">{db.name}</p>
                <p className="text-xs text-slate-500">{db.engine}</p>
              </div>
              <p className="text-sm text-slate-500">{db.size}</p>
            </li>
          ))}
        </ul>
      )}
      <div className="border-t border-slate-100 px-6 py-4">
        <button type="button" disabled className="text-sm font-semibold text-slate-400">
          + Create database (available when live)
        </button>
      </div>
    </div>
  );
}

export function HostingDashboardSsl() {
  const { account, loaded } = useDemoAccount();
  if (!loaded) return null;
  if (!account) return <EmptyDashboard />;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <h1 className="text-xl font-bold text-navy">SSL certificates</h1>
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

export function HostingDashboardBackups() {
  const { account, loaded } = useDemoAccount();
  if (!loaded) return null;
  if (!account) return <EmptyDashboard />;

  const hasBackupAddon = account.addons.some((a) => a.id === "hosting-backup");

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold text-navy">Website backups</h1>
      {hasBackupAddon ? (
        <div className="mt-4 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-900">
          Backup service active — daily automated backups of files and MySQL databases (demo).
        </div>
      ) : (
        <p className="mt-2 text-slate-600">
          Weekly backups included on Starter; daily on Business and Premium. Add the backup add-on
          for enhanced off-site storage.
        </p>
      )}
      <Link href="/hosting/plans" className="mt-4 inline-block text-sm font-semibold text-royal hover:underline">
        Upgrade backup plan
      </Link>
    </div>
  );
}
