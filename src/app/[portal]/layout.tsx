import { notFound } from "next/navigation";
import { PortalShell } from "@/components/portal/PortalShell";
import { isPortalId } from "@/lib/portals";

export default async function PortalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ portal: string }>;
}) {
  const { portal } = await params;
  if (!isPortalId(portal)) notFound();
  return <PortalShell portalId={portal}>{children}</PortalShell>;
}
