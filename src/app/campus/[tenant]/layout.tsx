import { CampusShell } from "@/components/campus/CampusShell";
import { resolveCampusTenant } from "@/lib/campus/tenant";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  params: Promise<{ tenant: string }>;
};

export default async function CampusTenantLayout({ children, params }: Props) {
  const { tenant: slug } = await params;
  const tenant = await resolveCampusTenant(slug);

  return <CampusShell tenant={tenant}>{children}</CampusShell>;
}
