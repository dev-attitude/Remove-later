"use client";

import { HostingCurrencyBar } from "@/components/hosting/HostingCurrencyBar";

export function HostingCurrencyStrip() {
  return (
    <div className="-mx-4 mb-8 border border-slate-200 bg-slate-50 md:-mx-8 md:rounded-xl md:overflow-hidden">
      <HostingCurrencyBar />
    </div>
  );
}
