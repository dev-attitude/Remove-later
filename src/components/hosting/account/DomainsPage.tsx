"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Settings } from "lucide-react";
import { useHostingAccount } from "@/lib/use-hosting-account";
import type { DnsRecord } from "@/lib/hosting-account-types";
import {
  AccountEmptyState,
  AccountPageHeader,
  StatusBadge,
  ToggleSwitch,
} from "@/components/hosting/account/AccountShared";

export function DomainsPage() {
  const { account, loaded, toggleDomainAutoRenew, renewDomain, updateDns } = useHostingAccount();
  const [search, setSearch] = useState("");
  const [dnsDomain, setDnsDomain] = useState<string | null>(null);
  const [dnsRecords, setDnsRecords] = useState<DnsRecord[]>([]);

  if (!loaded) return null;
  if (!account) return <AccountEmptyState />;

  const filtered = account.domains.filter((d) =>
    d.domain.toLowerCase().includes(search.toLowerCase())
  );

  function openDns(domain: string) {
    setDnsDomain(domain);
    setDnsRecords(account!.dnsByDomain[domain] ?? []);
  }

  function saveDns() {
    if (dnsDomain) {
      updateDns(dnsDomain, dnsRecords);
      setDnsDomain(null);
    }
  }

  return (
    <div>
      <AccountPageHeader
        title="Domain List"
        description="Manage registration, renewal, and DNS for your domains"
        action={
          <Link href="/hosting/domains" className="marketing-btn-primary inline-flex text-sm">
            <Plus className="h-4 w-4" />
            Register domain
          </Link>
        }
      />

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          placeholder="Search domains…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="marketing-input w-full pl-9"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-offwhite shadow-sm">
        {filtered.length === 0 ? (
          <p className="p-8 text-center text-muted">No domains found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-cream-50 text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Domain</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3">Auto-renew</th>
                <th className="px-4 py-3">Privacy</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((d) => (
                <tr key={d.domain}>
                  <td className="px-4 py-3 font-medium text-navy">{d.domain}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={d.status} />
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(d.expiresAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <ToggleSwitch
                      checked={d.autoRenew}
                      onChange={() => toggleDomainAutoRenew(d.domain)}
                      label={`Auto-renew ${d.domain}`}
                    />
                  </td>
                  <td className="px-4 py-3 text-muted">{d.privacy ? "On" : "Off"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openDns(d.domain)}
                        className="inline-flex items-center gap-1 text-royal hover:underline"
                      >
                        <Settings className="h-3.5 w-3.5" />
                        DNS
                      </button>
                      <button
                        type="button"
                        onClick={() => renewDomain(d.domain)}
                        className="text-royal hover:underline"
                      >
                        Renew
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {dnsDomain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-offwhite p-6 shadow-xl">
            <h2 className="text-lg font-bold text-navy">DNS — {dnsDomain}</h2>
            <p className="mt-1 text-sm text-muted">Edit records for this domain</p>
            <div className="mt-4 space-y-3">
              {dnsRecords.map((r, i) => (
                <div key={r.id} className="grid gap-2 rounded-lg border border-line p-3 sm:grid-cols-4">
                  <select
                    value={r.type}
                    onChange={(e) => {
                      const next = [...dnsRecords];
                      next[i] = { ...r, type: e.target.value as DnsRecord["type"] };
                      setDnsRecords(next);
                    }}
                    className="marketing-input text-sm"
                  >
                    {["A", "CNAME", "MX", "TXT"].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <input
                    value={r.host}
                    onChange={(e) => {
                      const next = [...dnsRecords];
                      next[i] = { ...r, host: e.target.value };
                      setDnsRecords(next);
                    }}
                    className="marketing-input text-sm"
                    placeholder="Host"
                  />
                  <input
                    value={r.value}
                    onChange={(e) => {
                      const next = [...dnsRecords];
                      next[i] = { ...r, value: e.target.value };
                      setDnsRecords(next);
                    }}
                    className="marketing-input text-sm sm:col-span-2"
                    placeholder="Value"
                  />
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setDnsDomain(null)} className="marketing-btn-secondary text-sm">
                Cancel
              </button>
              <button type="button" onClick={saveDns} className="marketing-btn-primary text-sm">
                Save DNS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
