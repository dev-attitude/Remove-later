"use client";

import Link from "next/link";
import { AlertCircle, X } from "lucide-react";
import { useState } from "react";
import { SKYRAPAY_HOSTING } from "@/lib/brand";

export function HostingDemoBanner() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div className="relative border-b border-amber-300 bg-amber-50 px-4 py-2.5 text-center text-sm text-amber-950">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-2 pr-8">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>
          <strong>{SKYRAPAY_HOSTING.name} — Demo mode</strong> — domain search, checkout, and
          client dashboard are simulated. Real Namecheap reseller integration coming soon.
        </span>
        <Link href="/hosting" className="font-medium underline">
          Overview
        </Link>
      </div>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 hover:bg-amber-100"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
