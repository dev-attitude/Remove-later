import { notFound } from "next/navigation";
import { SubscriptionPage } from "@/components/portal/SubscriptionPage";
import { isPortalId } from "@/lib/portals";

export default async function PortalSubscriptionRoute({
  params,
}: {
  params: Promise<{ portal: string }>;
}) {
  const { portal } = await params;
  if (!isPortalId(portal)) notFound();
  return <SubscriptionPage portalId={portal} />;
}
