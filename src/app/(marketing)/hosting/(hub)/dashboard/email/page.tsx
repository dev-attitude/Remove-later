import { HostingDashboardEmail } from "@/components/hosting/HostingDashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Private Email | Skyrapay Hosting",
};

export default function Page() {
  return <HostingDashboardEmail />;
}
