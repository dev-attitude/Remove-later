import { HostingDashboardOffers } from "@/components/hosting/HostingDashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Offers | Skyrapay Hosting",
};

export default function Page() {
  return <HostingDashboardOffers />;
}
