"use client";

import { useState } from "react";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useHostingAccount } from "@/lib/use-hosting-account";
import {
  AccountEmptyState,
  AccountPageHeader,
  StatusBadge,
  UsageBar,
} from "@/components/hosting/account/AccountShared";

const PHP_VERSIONS = ["8.3", "8.2", "8.1", "8.0", "7.4"];

export function HostingListPage() {
  const { account, loaded, setPhpVersion, addDatabase, deleteDatabase } = useHostingAccount();
  const [newDbName, setNewDbName] = useState("");
  const [dbError, setDbError] = useState("");

  if (!loaded) return null;
  if (!account) return <AccountEmptyState />;

  function handleAddDb(e: React.FormEvent) {
    e.preventDefault();
    if (!newDbName.trim()) return;
    const ok = addDatabase(newDbName.trim());
    if (ok) {
      setNewDbName("");
      setDbError("");
    } else {
      setDbError("Database name already exists or is invalid.");
    }
  }

  return (
    <div className="space-y-8">
      <AccountPageHeader
        title="Hosting List"
        description="cPanel accounts, resource usage, PHP, and MySQL databases"
        action={
          account.hostingServices.length === 0 ? (
            <Link href="/hosting/plans" className="marketing-btn-primary text-sm">
              Add hosting plan
            </Link>
          ) : (
            <a
              href={account.cpanelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="marketing-btn-primary inline-flex text-sm"
            >
              <ExternalLink className="h-4 w-4" />
              cPanel login
            </a>
          )
        }
      />

      {account.hostingServices.length === 0 ? (
        <div className="rounded-xl border border-line bg-offwhite p-8 text-center text-muted">
          No hosting packages on this account.
        </div>
      ) : (
        account.hostingServices.map((host) => (
          <div key={host.id} className="rounded-xl border border-line bg-offwhite shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line px-6 py-4">
              <div>
                <p className="text-lg font-bold text-navy">{host.planName}</p>
                <p className="text-sm text-muted">{host.primaryDomain}</p>
              </div>
              <StatusBadge status={host.status} />
            </div>
            <div className="grid gap-6 p-6 md:grid-cols-2">
              <UsageBar used={host.diskUsedGb} total={host.diskTotalGb} label="Disk usage" />
              <UsageBar used={host.bandwidthUsedGb} total={host.bandwidthTotalGb} label="Bandwidth" />
            </div>
            <div className="border-t border-line px-6 py-4">
              <dl className="grid gap-4 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-muted">PHP version</dt>
                  <dd className="mt-1">
                    <select
                      value={host.phpVersion}
                      onChange={(e) => setPhpVersion(host.id, e.target.value)}
                      className="marketing-input mt-1 text-sm"
                    >
                      {PHP_VERSIONS.map((v) => (
                        <option key={v} value={v}>
                          PHP {v}
                        </option>
                      ))}
                    </select>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Backups</dt>
                  <dd className="mt-1 font-medium capitalize text-navy">{host.backupSchedule}</dd>
                </div>
                <div>
                  <dt className="text-muted">cPanel</dt>
                  <dd className="mt-1 truncate font-mono text-xs text-muted">{account.cpanelUrl}</dd>
                </div>
              </dl>
            </div>
          </div>
        ))
      )}

      <div className="rounded-xl border border-line bg-offwhite shadow-sm">
        <div className="border-b border-line px-6 py-4">
          <h2 className="font-bold text-navy">MySQL databases</h2>
          <p className="text-sm text-muted">Create and manage databases — access via phpMyAdmin in cPanel</p>
        </div>
        <form onSubmit={handleAddDb} className="flex flex-wrap gap-2 border-b border-line px-6 py-4">
          <input
            value={newDbName}
            onChange={(e) => setNewDbName(e.target.value)}
            placeholder="database_name"
            className="marketing-input max-w-xs font-mono text-sm"
            pattern="[a-z0-9_]+"
          />
          <button type="submit" className="marketing-btn-primary inline-flex text-sm">
            <Plus className="h-4 w-4" />
            Create database
          </button>
          {dbError && <p className="w-full text-sm text-red-600">{dbError}</p>}
        </form>
        {account.databases.length === 0 ? (
          <p className="p-6 text-muted">No databases yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-cream-50 text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Engine</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Users</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {account.databases.map((db) => (
                <tr key={db.id}>
                  <td className="px-4 py-3 font-mono font-medium text-navy">{db.name}</td>
                  <td className="px-4 py-3 text-muted">{db.engine}</td>
                  <td className="px-4 py-3 text-muted">{db.sizeMb} MB</td>
                  <td className="px-4 py-3 text-muted">{db.users}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => deleteDatabase(db.id)}
                      className="text-red-600 hover:text-red-800"
                      aria-label="Delete database"
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
