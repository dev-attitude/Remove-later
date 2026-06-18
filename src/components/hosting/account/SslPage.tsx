"use client";

import { useHostingAccount } from "@/lib/use-hosting-account";
import { daysUntil, expiryLabel } from "@/lib/hosting-account-store";
import {
  AccountEmptyState,
  AccountPageHeader,
  StatusBadge,
  ToggleSwitch,
} from "@/components/hosting/account/AccountShared";

export function SslPage() {
  const { account, loaded, toggleSslAutoRenew, reissueSsl } = useHostingAccount();

  if (!loaded) return null;
  if (!account) return <AccountEmptyState />;

  return (
    <div>
      <AccountPageHeader
        title="SSL Certificates"
        description="HTTPS certificates for your domains — AutoSSL installs and renews automatically"
      />

      <div className="overflow-hidden rounded-xl border border-line bg-offwhite shadow-sm">
        {account.ssl.length === 0 ? (
          <p className="p-8 text-center text-muted">
            No SSL certificates yet — they are issued when you add a domain and hosting.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-cream-50 text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Domain</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3">Auto-renew</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {account.ssl.map((s) => (
                <tr key={s.domain}>
                  <td className="px-4 py-3 font-medium text-navy">{s.domain}</td>
                  <td className="px-4 py-3 text-muted">{s.type}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={expiryLabel(s.expiresAt) === "expired" ? "expired" : s.status} />
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(s.expiresAt).toLocaleDateString()} ({daysUntil(s.expiresAt)}d)
                  </td>
                  <td className="px-4 py-3">
                    <ToggleSwitch
                      checked={s.autoRenew}
                      onChange={() => toggleSslAutoRenew(s.domain)}
                      label={`Auto-renew SSL for ${s.domain}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => reissueSsl(s.domain)}
                      className="text-sm font-semibold text-royal hover:underline"
                    >
                      Reissue
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-line bg-cream-50 p-4 text-sm text-muted">
        <p className="font-semibold text-navy">About AutoSSL</p>
        <p className="mt-1">
          Free SSL is included with all hosting plans. Certificates renew automatically before expiry
          when auto-renew is enabled. Use Reissue if you change domains or need a fresh certificate.
        </p>
      </div>
    </div>
  );
}
