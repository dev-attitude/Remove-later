import { notFound, redirect } from "next/navigation";
import { PortalDashboard } from "@/components/portal/PortalDashboard";
import { isPortalId } from "@/lib/portals";

const RESERVED = new Set([
  "manage",
  "login",
  "register",
  "download",
  "research",
  "shop",
  "quote",
  "about",
  "contact",
  "api",
]);

export default async function PortalHomePage({
  params,
}: {
  params: Promise<{ portal: string }>;
}) {
  const { portal } = await params;
  if (RESERVED.has(portal)) redirect(`/${portal}`);
  if (!isPortalId(portal)) notFound();
  return <PortalDashboard portalId={portal} />;
}
