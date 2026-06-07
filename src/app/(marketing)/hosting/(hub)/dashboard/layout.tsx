import { HostingAccountShell } from "@/components/hosting/HostingAccountShell";

export default function HostingDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HostingAccountShell>{children}</HostingAccountShell>;
}
