import { notFound, redirect } from "next/navigation";
import { getModuleComponent } from "@/features/modules/registry";
import { isPortalId, portalHasModule } from "@/lib/portals";

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

export default async function PortalModulePage({
  params,
}: {
  params: Promise<{ portal: string; module: string }>;
}) {
  const { portal, module } = await params;

  if (RESERVED.has(portal)) {
    redirect(`/${portal}${module ? `/${module}` : ""}`);
  }

  if (!isPortalId(portal) || !portalHasModule(portal, module)) {
    notFound();
  }

  const Component = getModuleComponent(module);
  if (!Component) notFound();

  return <Component />;
}
