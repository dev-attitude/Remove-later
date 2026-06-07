"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useHostingAccount } from "@/lib/use-hosting-account";
import { AVAILABLE_APPS } from "@/lib/hosting-account-types";
import { AccountEmptyState, AccountPageHeader } from "@/components/hosting/account/AccountShared";

export function AppsPage() {
  const { account, loaded, installApp, uninstallApp } = useHostingAccount();
  const [selectedApp, setSelectedApp] = useState<(typeof AVAILABLE_APPS)[number] | null>(null);
  const [domain, setDomain] = useState("");
  const [message, setMessage] = useState("");

  if (!loaded) return null;
  if (!account) return <AccountEmptyState />;

  const domains = account.domains.map((d) => d.domain);

  function handleInstall(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedApp || !domain) return;
    const ok = installApp(selectedApp.id, selectedApp.name, selectedApp.version, domain);
    setMessage(ok ? `${selectedApp.name} installed on ${domain}.` : "Already installed on this domain.");
    if (ok) {
      setSelectedApp(null);
      setDomain("");
    }
  }

  return (
    <div className="space-y-8">
      <AccountPageHeader
        title="Apps"
        description="One-click installers for WordPress, Joomla, and more via cPanel"
      />

      <div>
        <h2 className="font-bold text-navy">Available apps</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {AVAILABLE_APPS.map((app) => (
            <button
              key={app.id}
              type="button"
              onClick={() => {
                setSelectedApp(app);
                setDomain(domains[0] ?? "");
                setMessage("");
              }}
              className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-royal/40"
            >
              <p className="font-semibold text-navy">{app.name}</p>
              <p className="mt-1 text-xs text-slate-500">{app.desc}</p>
              <p className="mt-2 text-xs text-slate-400">v{app.version}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="font-bold text-navy">Installed apps</h2>
        </div>
        {account.installedApps.length === 0 ? (
          <p className="p-6 text-slate-600">No apps installed yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">App</th>
                <th className="px-4 py-3">Domain</th>
                <th className="px-4 py-3">Version</th>
                <th className="px-4 py-3">Installed</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {account.installedApps.map((app) => (
                <tr key={app.id}>
                  <td className="px-4 py-3 font-medium text-navy">{app.name}</td>
                  <td className="px-4 py-3 text-slate-600">{app.domain}</td>
                  <td className="px-4 py-3 text-slate-600">{app.version}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(app.installedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => uninstallApp(app.id)}
                      className="text-red-600"
                      aria-label="Uninstall"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {message && (
        <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">{message}</p>
      )}

      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <form
            onSubmit={handleInstall}
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          >
            <h2 className="text-lg font-bold text-navy">Install {selectedApp.name}</h2>
            <label className="mt-4 block text-sm font-medium text-navy">Select domain</label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="marketing-input mt-1 w-full text-sm"
              required
            >
              {domains.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setSelectedApp(null)} className="marketing-btn-secondary text-sm">
                Cancel
              </button>
              <button type="submit" className="marketing-btn-primary text-sm">
                Install now
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
