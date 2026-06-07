import { HostingDashboardDatabases } from "@/components/hosting/HostingDashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MySQL Databases | Skyrapay Hosting",
};

export default function Page() {
  return <HostingDashboardDatabases />;
}
