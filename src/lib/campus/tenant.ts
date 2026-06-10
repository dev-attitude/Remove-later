import { notFound } from "next/navigation";
import { DEMO_TENANTS, getDemoTenant } from "./data";
import { prisma } from "@/lib/db";
import type { CampusTenantView } from "./types";

export async function resolveCampusTenant(slug: string): Promise<CampusTenantView> {
  const demo = getDemoTenant(slug);
  if (demo) return demo;

  const row = await prisma.campusTenant.findUnique({ where: { slug } });
  if (!row) notFound();

  return {
    slug: row.slug,
    name: row.name,
    tagline: row.tagline ?? "",
    institutionType: row.institutionType as CampusTenantView["institutionType"],
    primaryColor: row.primaryColor,
    campuses: row.campusesJson ? (JSON.parse(row.campusesJson) as string[]) : [],
  };
}

export function listCampusTenants(): CampusTenantView[] {
  return DEMO_TENANTS;
}
