"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  DnsRecord,
  GrowthToolId,
  HostingClientAccount,
  InstalledApp,
} from "@/lib/hosting-account-types";
import {
  addActivity,
  loadClientAccount,
  saveClientAccount,
} from "@/lib/hosting-account-store";

export function useHostingAccount() {
  const [account, setAccount] = useState<HostingClientAccount | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setAccount(loadClientAccount());
    setLoaded(true);
  }, []);

  const persist = useCallback((next: HostingClientAccount) => {
    saveClientAccount(next);
    setAccount(next);
  }, []);

  const toggleDomainAutoRenew = useCallback(
    (domain: string) => {
      if (!account) return;
      const domains = account.domains.map((d) =>
        d.domain === domain ? { ...d, autoRenew: !d.autoRenew } : d
      );
      const d = domains.find((x) => x.domain === domain);
      persist(
        addActivity(
          { ...account, domains },
          `Auto-renew ${d?.autoRenew ? "enabled" : "disabled"} for ${domain}`,
          "domain"
        )
      );
    },
    [account, persist]
  );

  const renewDomain = useCallback(
    (domain: string) => {
      if (!account) return;
      const expires = new Date();
      expires.setFullYear(expires.getFullYear() + 1);
      const domains = account.domains.map((d) =>
        d.domain === domain
          ? { ...d, expiresAt: expires.toISOString(), status: "active" as const }
          : d
      );
      persist(
        addActivity({ ...account, domains }, `Domain ${domain} renewed for 1 year`, "domain")
      );
    },
    [account, persist]
  );

  const updateDns = useCallback(
    (domain: string, records: DnsRecord[]) => {
      if (!account) return;
      persist(
        addActivity(
          { ...account, dnsByDomain: { ...account.dnsByDomain, [domain]: records } },
          `DNS updated for ${domain}`,
          "domain"
        )
      );
    },
    [account, persist]
  );

  const addMailbox = useCallback(
    (localPart: string, domain: string, quotaMb: number) => {
      if (!account) return false;
      const address = `${localPart}@${domain}`;
      if (account.emails.some((e) => e.address === address)) return false;
      const emails = [
        ...account.emails,
        {
          id: `mail-${Date.now()}`,
          address,
          storageUsedMb: 0,
          quotaMb,
          createdAt: new Date().toISOString(),
        },
      ];
      persist(addActivity({ ...account, emails }, `Mailbox ${address} created`, "email"));
      return true;
    },
    [account, persist]
  );

  const deleteMailbox = useCallback(
    (id: string) => {
      if (!account) return;
      const box = account.emails.find((e) => e.id === id);
      const emails = account.emails.filter((e) => e.id !== id);
      persist(
        addActivity(
          { ...account, emails },
          `Mailbox ${box?.address ?? id} removed`,
          "email"
        )
      );
    },
    [account, persist]
  );

  const setMailboxForwarding = useCallback(
    (id: string, forwarding: string) => {
      if (!account) return;
      const emails = account.emails.map((e) =>
        e.id === id ? { ...e, forwarding: forwarding || undefined } : e
      );
      persist({ ...account, emails });
    },
    [account, persist]
  );

  const toggleSslAutoRenew = useCallback(
    (domain: string) => {
      if (!account) return;
      const ssl = account.ssl.map((s) =>
        s.domain === domain ? { ...s, autoRenew: !s.autoRenew } : s
      );
      persist({ ...account, ssl });
    },
    [account, persist]
  );

  const reissueSsl = useCallback(
    (domain: string) => {
      if (!account) return;
      const expires = new Date();
      expires.setFullYear(expires.getFullYear() + 1);
      const ssl = account.ssl.map((s) =>
        s.domain === domain
          ? { ...s, status: "active" as const, expiresAt: expires.toISOString() }
          : s
      );
      persist(
        addActivity({ ...account, ssl }, `SSL reissued for ${domain}`, "ssl")
      );
    },
    [account, persist]
  );

  const installApp = useCallback(
    (appId: string, name: string, version: string, domain: string) => {
      if (!account) return false;
      if (account.installedApps.some((a) => a.appId === appId && a.domain === domain)) {
        return false;
      }
      const installedApps: InstalledApp[] = [
        ...account.installedApps,
        {
          id: `app-${Date.now()}`,
          appId,
          name,
          domain,
          version,
          installedAt: new Date().toISOString(),
        },
      ];
      persist(
        addActivity(
          { ...account, installedApps },
          `${name} installed on ${domain}`,
          "app"
        )
      );
      return true;
    },
    [account, persist]
  );

  const uninstallApp = useCallback(
    (id: string) => {
      if (!account) return;
      const app = account.installedApps.find((a) => a.id === id);
      const installedApps = account.installedApps.filter((a) => a.id !== id);
      persist(
        addActivity(
          { ...account, installedApps },
          `${app?.name ?? "App"} removed from ${app?.domain ?? "hosting"}`,
          "app"
        )
      );
    },
    [account, persist]
  );

  const redeemOffer = useCallback(
    (offerId: string) => {
      if (!account) return;
      const offers = account.offers.map((o) =>
        o.id === offerId ? { ...o, redeemed: true } : o
      );
      const offer = offers.find((o) => o.id === offerId);
      persist(
        addActivity(
          { ...account, offers },
          `Offer redeemed: ${offer?.title ?? offerId}`,
          "order"
        )
      );
    },
    [account, persist]
  );

  const recordGrowthToolUse = useCallback(
    (toolId: GrowthToolId) => {
      if (!account) return;
      const growthToolsUsed = account.growthToolsUsed.includes(toolId)
        ? account.growthToolsUsed
        : [...account.growthToolsUsed, toolId];
      persist({ ...account, growthToolsUsed });
    },
    [account, persist]
  );

  const updateProfile = useCallback(
    (profile: Partial<HostingClientAccount["profile"]>) => {
      if (!account) return;
      persist({ ...account, profile: { ...account.profile, ...profile } });
    },
    [account, persist]
  );

  const updateCustomer = useCallback(
    (customer: Partial<HostingClientAccount["customer"]>) => {
      if (!account) return;
      persist({ ...account, customer: { ...account.customer, ...customer } });
    },
    [account, persist]
  );

  const setPhpVersion = useCallback(
    (serviceId: string, phpVersion: string) => {
      if (!account) return;
      const hostingServices = account.hostingServices.map((h) =>
        h.id === serviceId ? { ...h, phpVersion } : h
      );
      persist(
        addActivity(
          { ...account, hostingServices },
          `PHP version set to ${phpVersion}`,
          "hosting"
        )
      );
    },
    [account, persist]
  );

  const addDatabase = useCallback(
    (name: string) => {
      if (!account) return false;
      if (account.databases.some((d) => d.name === name)) return false;
      const databases = [
        ...account.databases,
        {
          id: `db-${Date.now()}`,
          name,
          sizeMb: 0,
          engine: "MySQL 8.0",
          users: 1,
        },
      ];
      persist(
        addActivity({ ...account, databases }, `Database ${name} created`, "hosting")
      );
      return true;
    },
    [account, persist]
  );

  const deleteDatabase = useCallback(
    (id: string) => {
      if (!account) return;
      const db = account.databases.find((d) => d.id === id);
      const databases = account.databases.filter((d) => d.id !== id);
      persist(
        addActivity(
          { ...account, databases },
          `Database ${db?.name ?? id} deleted`,
          "hosting"
        )
      );
    },
    [account, persist]
  );

  return {
    account,
    loaded,
    displayName: account?.profile.displayName ?? "Jun",
    toggleDomainAutoRenew,
    renewDomain,
    updateDns,
    addMailbox,
    deleteMailbox,
    setMailboxForwarding,
    toggleSslAutoRenew,
    reissueSsl,
    installApp,
    uninstallApp,
    redeemOffer,
    recordGrowthToolUse,
    updateProfile,
    updateCustomer,
    setPhpVersion,
    addDatabase,
    deleteDatabase,
  };
}
