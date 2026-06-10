import type { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";

export type CampusSeedMember = { userId: string; role: string };

const LEGACY_SLUGS = ["meyfield", "unam-demo", "nursing-demo"];

export async function seedCampus(prisma: PrismaClient, members: CampusSeedMember[] = []) {
  await prisma.campusTenant.deleteMany({ where: { slug: { in: LEGACY_SLUGS } } });

  const tenants = [
    {
      slug: "horizon-university",
      name: "Horizon University",
      tagline: "Multi-campus public university — demo tenant",
      institutionType: "university",
      primaryColor: "#0f766e",
      campusesJson: JSON.stringify(["Main Campus", "Coastal Campus", "Northern Campus"]),
    },
    {
      slug: "acacia-college",
      name: "Acacia College",
      tagline: "Private teacher training college — demo tenant",
      institutionType: "teacher_training",
      primaryColor: "#1e40af",
      campusesJson: JSON.stringify(["City Campus"]),
    },
    {
      slug: "unity-nursing",
      name: "Unity Nursing Institute",
      tagline: "Nursing & health sciences — demo tenant",
      institutionType: "nursing",
      primaryColor: "#be123c",
      campusesJson: JSON.stringify(["Central Campus", "Clinical Training Site"]),
    },
  ];

  for (const t of tenants) {
    const tenant = await prisma.campusTenant.upsert({
      where: { slug: t.slug },
      update: t,
      create: t,
    });

    for (const member of members) {
      await prisma.campusMembership.upsert({
        where: { tenantId_userId: { tenantId: tenant.id, userId: member.userId } },
        update: { role: member.role },
        create: { tenantId: tenant.id, userId: member.userId, role: member.role },
      });
    }

    await prisma.campusStudent.deleteMany({ where: { tenantId: tenant.id } });
    const demoStudent = {
      studentNumber: "SC2026001",
      name: "Demo Student",
      email: "student@smartcampus.demo",
      programmeCode: t.slug === "horizon-university" ? "BSC-CS" : t.slug === "unity-nursing" ? "DIP-NUR" : "BED-FP",
      enrollmentYear: 2024,
      failureRisk: 18,
      dropoutRisk: 12,
      feeDefaultRisk: 25,
      graduationLikelihood: 86,
      attendancePct: 91,
      averageMark: 68,
      feesOutstanding: 3500,
    };
    const riskStudents =
      t.slug === "horizon-university"
        ? [
            { studentNumber: "221045678", name: "John Mbeki", programmeCode: "BSC-CS", failureRisk: 92, dropoutRisk: 40, feeDefaultRisk: 15, graduationLikelihood: 30, attendancePct: 58, averageMark: 45, feesOutstanding: 18500 },
            { studentNumber: "221078901", name: "Mary Kapena", programmeCode: "LLB", failureRisk: 55, dropoutRisk: 80, feeDefaultRisk: 22, graduationLikelihood: 48, attendancePct: 65, averageMark: 51, feesOutstanding: 22000 },
            { studentNumber: "221034567", name: "Paul Tjiueza", programmeCode: "BCOM", failureRisk: 74, dropoutRisk: 35, feeDefaultRisk: 74, graduationLikelihood: 52, attendancePct: 72, averageMark: 56, feesOutstanding: 31000 },
          ]
        : [
            { studentNumber: "AC2021045", name: "John Mbeki", programmeCode: "DIP-ED", failureRisk: 92, dropoutRisk: 45, feeDefaultRisk: 20, graduationLikelihood: 28, attendancePct: 62, averageMark: 48, feesOutstanding: 4200 },
            { studentNumber: "AC2021088", name: "Mary Kapena", programmeCode: "BED-FP", failureRisk: 68, dropoutRisk: 80, feeDefaultRisk: 35, graduationLikelihood: 42, attendancePct: 71, averageMark: 52, feesOutstanding: 8900 },
            { studentNumber: "AC2021032", name: "Paul Tjiueza", programmeCode: "DIP-ED", failureRisk: 74, dropoutRisk: 38, feeDefaultRisk: 74, graduationLikelihood: 55, attendancePct: 78, averageMark: 58, feesOutstanding: 12400 },
          ];

    for (const s of [demoStudent, ...riskStudents]) {
      await prisma.campusStudent.create({ data: { tenantId: tenant.id, ...s } });
    }

    await prisma.campusProgramme.deleteMany({ where: { tenantId: tenant.id } });
    const programmes =
      t.slug === "horizon-university"
        ? [
            { code: "BSC-CS", name: "BSc Computer Science", faculty: "Science", nqfLevel: 8, passRate: 68 },
            { code: "LLB", name: "Bachelor of Laws", faculty: "Law", nqfLevel: 8, passRate: 71 },
            { code: "BCOM", name: "BCom Accounting", faculty: "Commerce", nqfLevel: 8, passRate: 74 },
          ]
        : t.slug === "unity-nursing"
          ? [
              { code: "DIP-NUR", name: "Diploma in Nursing", faculty: "Health Sciences", nqfLevel: 6, passRate: 82 },
              { code: "BNS", name: "Bachelor of Nursing Science", faculty: "Health Sciences", nqfLevel: 8, passRate: 76 },
            ]
          : [
              { code: "BED-FP", name: "BEd Foundation Phase", faculty: "Education", nqfLevel: 7, passRate: 78 },
              { code: "DIP-ED", name: "Diploma in Education", faculty: "Education", nqfLevel: 6, passRate: 72 },
            ];
    for (const p of programmes) {
      await prisma.campusProgramme.create({ data: { tenantId: tenant.id, ...p } });
    }

    await prisma.campusCrmLead.deleteMany({ where: { tenantId: tenant.id } });
    const leads = [
      { name: "Ministry of Education — Bursary Partner", leadType: "sponsor", stage: "negotiation", email: "partnerships@ministry.example" },
      { name: "T. Shikongo (2026 applicant)", leadType: "prospect", stage: "application", email: "t.shikongo@email.example" },
      { name: "Class of 2019 Alumni Network", leadType: "alumni", stage: "engaged", email: "alumni@institution.example" },
      { name: "First Capital Bank — Graduate Programme", leadType: "partner", stage: "active", email: "hr@bank.example" },
    ];
    for (const l of leads) {
      await prisma.campusCrmLead.create({ data: { tenantId: tenant.id, ...l } });
    }

    await prisma.campusCredential.deleteMany({ where: { tenantId: tenant.id } });
    const hash = createHash("sha256").update(`demo-${tenant.slug}-2024`).digest("hex").slice(0, 16);
    await prisma.campusCredential.create({
      data: {
        tenantId: tenant.id,
        studentName: "Demo Graduate",
        studentNumber: demoStudent.studentNumber,
        qualification: programmes[0].name,
        yearAwarded: 2024,
        verifyCode: `SC360-${tenant.slug.toUpperCase()}-2024-DEMO`,
        blockchainHash: `0x${hash}`,
      },
    });
  }

  console.log("  Campus tenants: horizon-university, acacia-college, unity-nursing");
}
