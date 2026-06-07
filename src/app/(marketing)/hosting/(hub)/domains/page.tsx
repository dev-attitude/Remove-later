import { DomainSearchPanel } from "@/components/hosting/DomainSearchPanel";
import type { Metadata } from "next";
import { SKYRAPAY_HOSTING } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Buy Your Own Domain Name | ${SKYRAPAY_HOSTING.name}`,
  description: "Search and register .com, .com.na, .org and more — demo domain search for Skyrapay Hosting.",
};

export default function HostingDomainsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-navy">Buy your own domain name</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Search available domains and add them to your cart. When our Namecheap reseller is live,
        registration happens instantly in your name.
      </p>
      <div className="mt-8">
        <DomainSearchPanel />
      </div>
    </div>
  );
}
