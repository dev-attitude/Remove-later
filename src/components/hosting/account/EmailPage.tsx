"use client";

import { useState } from "react";
import { ExternalLink, Mail, Plus, Trash2 } from "lucide-react";
import { useHostingAccount } from "@/lib/use-hosting-account";
import { AccountEmptyState, AccountPageHeader } from "@/components/hosting/account/AccountShared";

export function EmailPage() {
  const { account, loaded, addMailbox, deleteMailbox, setMailboxForwarding } = useHostingAccount();
  const [localPart, setLocalPart] = useState("");
  const [domain, setDomain] = useState("");
  const [error, setError] = useState("");

  if (!loaded) return null;
  if (!account) return <AccountEmptyState />;

  const domains = account.domains.map((d) => d.domain);
  const selectedDomain = domain || domains[0] || "";

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!localPart.trim() || !selectedDomain) {
      setError("Enter a mailbox name and ensure you have a domain.");
      return;
    }
    const ok = addMailbox(localPart.trim().toLowerCase(), selectedDomain, 1024);
    if (ok) {
      setLocalPart("");
      setError("");
    } else {
      setError("Mailbox already exists or could not be created.");
    }
  }

  return (
    <div className="space-y-6">
      <AccountPageHeader
        title="Private Email"
        description="Business mailboxes on your domain — webmail, Outlook, and mobile"
        action={
          <a
            href={`https://webmail.${selectedDomain || "gmconsultations.com"}`}
            target="_blank"
            rel="noopener noreferrer"
            className="marketing-btn-secondary inline-flex text-sm"
          >
            <ExternalLink className="h-4 w-4" />
            Open webmail
          </a>
        }
      />

      <form
        onSubmit={handleCreate}
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="flex items-center gap-2 font-bold text-navy">
          <Plus className="h-5 w-5" />
          Create mailbox
        </h2>
        <div className="mt-4 flex flex-wrap items-end gap-2">
          <div>
            <label className="text-xs font-medium text-slate-500">Local part</label>
            <input
              value={localPart}
              onChange={(e) => setLocalPart(e.target.value)}
              placeholder="info"
              className="marketing-input mt-1 font-mono text-sm"
              required
            />
          </div>
          <span className="pb-2 text-slate-500">@</span>
          <div>
            <label className="text-xs font-medium text-slate-500">Domain</label>
            <select
              value={selectedDomain}
              onChange={(e) => setDomain(e.target.value)}
              className="marketing-input mt-1 text-sm"
              disabled={domains.length === 0}
            >
              {domains.length === 0 ? (
                <option value="">No domain</option>
              ) : (
                domains.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))
              )}
            </select>
          </div>
          <button type="submit" className="marketing-btn-primary text-sm" disabled={!domains.length}>
            Create
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </form>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {account.emails.length === 0 ? (
          <p className="p-8 text-center text-slate-600">No mailboxes yet — create one above.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Storage</th>
                <th className="px-4 py-3">Forward to</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {account.emails.map((m) => (
                <tr key={m.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 font-medium text-navy">
                      <Mail className="h-4 w-4 text-royal" />
                      {m.address}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {m.storageUsedMb} MB / {m.quotaMb >= 1024 ? `${m.quotaMb / 1024} GB` : `${m.quotaMb} MB`}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="email"
                      defaultValue={m.forwarding ?? ""}
                      placeholder="optional@email.com"
                      onBlur={(e) => setMailboxForwarding(m.id, e.target.value)}
                      className="marketing-input max-w-xs text-sm"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => deleteMailbox(m.id)}
                      className="text-red-600 hover:text-red-800"
                      aria-label="Delete mailbox"
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
    </div>
  );
}
