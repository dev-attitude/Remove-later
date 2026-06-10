import { prisma } from "@/lib/db";
import type { CampusInstitutionType, CampusTenantView, ExecutiveMetrics, RiskStudent } from "./types";

/** Fictional white-label demo tenants — show prospects how their own brand would look */
export const DEMO_TENANTS: CampusTenantView[] = [
  {
    slug: "horizon-university",
    name: "Horizon University",
    tagline: "Multi-campus public university — demo tenant",
    institutionType: "university",
    primaryColor: "#0f766e",
    campuses: ["Main Campus", "Coastal Campus", "Northern Campus"],
  },
  {
    slug: "acacia-college",
    name: "Acacia College",
    tagline: "Private teacher training college — demo tenant",
    institutionType: "teacher_training",
    primaryColor: "#1e40af",
    campuses: ["City Campus"],
  },
  {
    slug: "unity-nursing",
    name: "Unity Nursing Institute",
    tagline: "Nursing & health sciences — demo tenant",
    institutionType: "nursing",
    primaryColor: "#be123c",
    campuses: ["Central Campus", "Clinical Training Site"],
  },
];

const METRICS_BY_TENANT: Record<string, ExecutiveMetrics> = {
  "horizon-university": {
    enrollment: 32_500,
    retentionPct: 91,
    graduationRatePct: 68,
    tuitionRevenue: 450_000_000,
    outstandingFees: 62_000_000,
    collectionRatePct: 86,
    passRatePct: 71,
    staffCount: 2100,
    currency: "NAD",
  },
  "acacia-college": {
    enrollment: 2840,
    retentionPct: 88,
    graduationRatePct: 72,
    tuitionRevenue: 18_400_000,
    outstandingFees: 2_100_000,
    collectionRatePct: 89,
    passRatePct: 76,
    staffCount: 186,
    currency: "NAD",
  },
  "unity-nursing": {
    enrollment: 920,
    retentionPct: 85,
    graduationRatePct: 78,
    tuitionRevenue: 6_800_000,
    outstandingFees: 890_000,
    collectionRatePct: 87,
    passRatePct: 82,
    staffCount: 64,
    currency: "NAD",
  },
};

export function getDemoTenant(slug: string): CampusTenantView | undefined {
  return DEMO_TENANTS.find((t) => t.slug === slug);
}

export function formatCampusCurrency(amount: number, currency = "NAD"): string {
  return `${currency === "NAD" ? "N$" : currency} ${amount.toLocaleString("en-NA")}`;
}

export async function getTenantMetrics(slug: string): Promise<ExecutiveMetrics> {
  const demo = METRICS_BY_TENANT[slug];
  if (demo) return demo;
  return METRICS_BY_TENANT["acacia-college"];
}

export async function getRiskStudents(slug: string): Promise<RiskStudent[]> {
  const tenant = await prisma.campusTenant.findUnique({ where: { slug } });
  if (!tenant) return fallbackRisk(slug);

  const rows = await prisma.campusStudent.findMany({
    where: { tenantId: tenant.id },
    orderBy: { failureRisk: "desc" },
    take: 12,
  });

  if (rows.length === 0) return fallbackRisk(slug);

  return rows.map((s) => ({
    studentNumber: s.studentNumber,
    name: s.name,
    programme: s.programmeCode ?? "—",
    failureRisk: Math.round(s.failureRisk),
    dropoutRisk: Math.round(s.dropoutRisk),
    feeDefaultRisk: Math.round(s.feeDefaultRisk),
    graduationLikelihood: Math.round(s.graduationLikelihood ?? 0),
  }));
}

function fallbackRisk(slug: string): RiskStudent[] {
  const base =
    slug === "horizon-university"
      ? [
          { studentNumber: "221045678", name: "John M.", programme: "BSc Computer Science" },
          { studentNumber: "221078901", name: "Mary K.", programme: "LLB Law" },
          { studentNumber: "221034567", name: "Paul T.", programme: "BCom Accounting" },
        ]
      : [
          { studentNumber: "AC2021045", name: "John M.", programme: "Diploma in Education" },
          { studentNumber: "AC2021088", name: "Mary K.", programme: "BEd Foundation Phase" },
          { studentNumber: "AC2021032", name: "Paul T.", programme: "Diploma in Education" },
        ];
  return base.map((s, i) => ({
    ...s,
    failureRisk: [92, 80, 74][i] ?? 70,
    dropoutRisk: [45, 80, 38][i] ?? 50,
    feeDefaultRisk: [20, 35, 74][i] ?? 40,
    graduationLikelihood: [28, 42, 55][i] ?? 50,
  }));
}

export async function getCrmLeads(slug: string) {
  const tenant = await prisma.campusTenant.findUnique({ where: { slug } });
  if (!tenant) return demoCrmLeads();

  const leads = await prisma.campusCrmLead.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  if (leads.length === 0) return demoCrmLeads();
  return leads;
}

function demoCrmLeads() {
  return [
    { name: "Sponsor — Ministry of Education", leadType: "sponsor", stage: "negotiation", email: "partnerships@ministry.example" },
    { name: "Prospect — T. Shikongo", leadType: "prospect", stage: "application", email: "t.shikongo@email.example" },
    { name: "Alumni — Class of 2019", leadType: "alumni", stage: "engaged", email: "alumni@institution.example" },
    { name: "Industry — First Capital Bank", leadType: "partner", stage: "active", email: "hr@bank.example" },
  ];
}

export function institutionTypeLabel(type: CampusInstitutionType): string {
  const map: Record<CampusInstitutionType, string> = {
    university: "University",
    college: "College",
    vocational: "Vocational Training Centre",
    nursing: "Nursing School",
    teacher_training: "Teacher Training College",
  };
  return map[type] ?? "Institution";
}
