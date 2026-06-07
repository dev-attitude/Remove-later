import { HostingDashboardOverview } from "@/components/hosting/HostingDashboard";
import type { Metadata } from "next";
import { SKYRAPAY_HOSTING } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Dashboard | ${SKYRAPAY_HOSTING.label}`,
  description: "Manage domains, email, MySQL databases, SSL, and cPanel — GM Consultations client account.",
};

export default function HostingDashboardPage() {
  return <HostingDashboardOverview />;
}
