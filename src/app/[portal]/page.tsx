import { notFound } from "next/navigation";
import { PortalDashboard } from "@/components/portal/PortalDashboard";
import { isPortalId } from "@/lib/portals";

export default async function PortalHomePage({
  params,
}: {
  params: Promise<{ portal: string }>;
}) {
  const { portal } = await params;
  if (!isPortalId(portal)) notFound();
  return <PortalDashboard portalId={portal} />;
}
