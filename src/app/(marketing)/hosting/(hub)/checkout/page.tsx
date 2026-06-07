import { HostingCheckoutPanel } from "@/components/hosting/HostingCheckoutPanel";
import type { Metadata } from "next";
import { SKYRAPAY_HOSTING } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Checkout | ${SKYRAPAY_HOSTING.label}`,
};

export default function HostingCheckoutPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-navy">Checkout</h1>
      <p className="mt-2 text-slate-600">
        Complete your order — our team will confirm and send payment details within one business day.
      </p>
      <div className="mt-8">
        <HostingCheckoutPanel />
      </div>
    </div>
  );
}
