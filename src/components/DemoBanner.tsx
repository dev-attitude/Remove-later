"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, X } from "lucide-react";
import { fetchSystemStatus } from "@/lib/client/api";

export function DemoBanner() {
  const [visible, setVisible] = useState(false);
  const [runtimeMode, setRuntimeMode] = useState<"demo" | "live">("demo");
  const [services, setServices] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchSystemStatus()
      .then((s) => {
        setRuntimeMode(s.runtimeMode);
        setServices(s.services);
        setVisible(s.demoBanner || s.runtimeMode === "demo");
      })
      .catch(() => setVisible(process.env.NEXT_PUBLIC_DEMO_MODE !== "false"));
  }, []);

  if (!visible) return null;

  return (
    <div className="relative border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-950">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-2 pr-8">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>
          <strong>Demo mode</strong> — running with simulated data where services are
          not configured.
          {runtimeMode === "live" && " OpenAI is live;"}{" "}
          {!services.stripe && " billing is simulated."}
        </span>
        <Link href="/download" className="font-medium underline">
          Apps
        </Link>
        <span className="text-amber-700">·</span>
        <Link href="/student/how-it-works" className="font-medium underline">
          Go live guide
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
