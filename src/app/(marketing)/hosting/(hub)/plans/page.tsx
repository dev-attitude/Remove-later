import { HostingPlansPanel } from "@/components/hosting/HostingPlansPanel";
import type { Metadata } from "next";
import { SKYRAPAY_HOSTING } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Hosting Plans | ${SKYRAPAY_HOSTING.name}`,
  description: "Starter, Business, and Premium cPanel hosting with email, MySQL, and SSL — Skyrapay Hosting Namibia.",
};

export default function HostingPlansPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-navy">Hosting plans & add-ons</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Choose a website hosting package and optional add-ons. Every plan includes cPanel, SSL,
        email accounts, and MySQL databases.
      </p>
      <div className="mt-8">
        <HostingPlansPanel />
      </div>
    </div>
  );
}
