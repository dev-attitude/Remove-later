import { HostingCartPanel } from "@/components/hosting/HostingCartPanel";
import type { Metadata } from "next";
import { SKYRAPAY_HOSTING } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Cart | ${SKYRAPAY_HOSTING.label}`,
};

export default function HostingCartPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-navy">Your cart</h1>
      <p className="mt-2 text-slate-600">Review domains, hosting plans, and add-ons before checkout.</p>
      <div className="mt-8">
        <HostingCartPanel />
      </div>
    </div>
  );
}
