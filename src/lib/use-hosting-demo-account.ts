"use client";

import { useEffect, useState } from "react";
import { HOSTING_DEMO_STORAGE_KEY, type HostingDemoAccount } from "@/lib/hosting-demo";
import { HOSTING_DEMO_USER_NAME } from "@/lib/hosting-account-nav";

export function useHostingDemoAccount() {
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

  const displayName =
    account?.customer.name.split(/\s+/)[0] ?? HOSTING_DEMO_USER_NAME;

  return { account, loaded, displayName };
}
