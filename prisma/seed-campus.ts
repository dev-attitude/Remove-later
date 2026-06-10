import type { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";

export async function seedCampus(prisma: PrismaClient, memberUserIds: string[] = []) {
  const tenants = [
    {
      slug: "meyfield",
      name: "Meyfield College",
      tagline: "Excellence in teacher education — Ondangwa",
      institutionType: "teacher_training",
      primaryColor: "#1e40af",
      campusesJson: JSON.stringify(["Ondangwa Main Campus"]),
    },
    {
      slug: "unam-demo",
      name: "University of Namibia (Demo)",
      tagline: "Multi-campus national university",
      institutionType: "university",
      primaryColor: "#0f766e",
      campusesJson: JSON.stringify(["Windhoek", "Oshakati", "Henties Bay"]),
    },
    {
      slug: "nursing-demo",
      name: "Namibia Nursing Institute (Demo)",
      tagline: "Clinical & vocational nursing education",
      institutionType: "nursing",
      primaryColor: "#be123c",
      campusesJson: JSON.stringify(["Windhoek Campus", "Rundu Clinical Site"]),
    },
  ];

  for (const t of tenants) {
    const tenant = await prisma.campusTenant.upsert({
      where: { slug: t.slug },
      update: t,
      create: t,
    });

    for (const userId of memberUserIds) {
      await prisma.campusMembership.upsert({
        where: { tenantId_userId: { tenantId: tenant.id, userId } },
        update: { role: "vc" },
        create: { tenantId: tenant.id, userId, role: "vc" },
      });
    }

    await prisma.campusStudent.deleteMany({ where: { tenantId: tenant.id } });
    const students =
      t.slug === "meyfield"
        ? [
            { studentNumber: "MC2021045", name: "John Mwandingi", programmeCode: "DIP-ED", failureRisk: 92, dropoutRisk: 45, feeDefaultRisk: 20, graduationLikelihood: 28, attendancePct: 62, averageMark: 48, feesOutstanding: 4200 },
            { studentNumber: "MC2021088", name: "Mary Kalola", programmeCode: "BED-FP", failureRisk: 68, dropoutRisk: 80, feeDefaultRisk: 35, graduationLikelihood: 42, attendancePct: 71, averageMark: 52, feesOutstanding: 8900 },
            { studentNumber: "MC2021032", name: "Paul Tjihuiko", programmeCode: "DIP-ED", failureRisk: 74, dropoutRisk: 38, feeDefaultRisk: 74, graduationLikelihood: 55, attendancePct: 78, averageMark: 58, feesOutstanding: 12400 },
          ]
        : [
            { studentNumber: "221045678", name: "John Mwandingi", programmeCode: "BSC-CS", failureRisk: 92, dropoutRisk: 40, feeDefaultRisk: 15, graduationLikelihood: 30, attendancePct: 58, averageMark: 45, feesOutstanding: 18500 },
            { studentNumber: "221078901", name: "Mary Kalola", programmeCode: "LLB", failureRisk: 55, dropoutRisk: 80, feeDefaultRisk: 22, graduationLikelihood: 48, attendancePct: 65, averageMark: 51, feesOutstanding: 22000 },
            { studentNumber: "221034567", name: "Paul Tjihuiko", programmeCode: "BCOM", failureRisk: 74, dropoutRisk: 35, feeDefaultRisk: 74, graduationLikelihood: 52, attendancePct: 72, averageMark: 56, feesOutstanding: 31000 },
          ];

    for (const s of students) {
      await prisma.campusStudent.create({
        data: { tenantId: tenant.id, ...s },
      });
    }

    await prisma.campusProgramme.deleteMany({ where: { tenantId: tenant.id } });
    const programmes =
      t.slug === "meyfield"
        ? [
            { code: "BED-FP", name: "BEd Foundation Phase", faculty: "Education", nqfLevel: 7, passRate: 78 },
            { code: "DIP-ED", name: "Diploma in Education", faculty: "Education", nqfLevel: 6, passRate: 72 },
          ]
        : [
            { code: "BSC-CS", name: "BSc Computer Science", faculty: "Science", nqfLevel: 8, passRate: 68 },
            { code: "LLB", name: "Bachelor of Laws", faculty: "Law", nqfLevel: 8, passRate: 71 },
            { code: "BCOM", name: "BCom Accounting", faculty: "Commerce", nqfLevel: 8, passRate: 74 },
          ];
    for (const p of programmes) {
      await prisma.campusProgramme.create({ data: { tenantId: tenant.id, ...p } });
    }

    await prisma.campusCrmLead.deleteMany({ where: { tenantId: tenant.id } });
    const leads = [
      { name: "Ministry of Education — Bursary Partner", leadType: "sponsor", stage: "negotiation", email: "partnerships@moe.gov.na" },
      { name: "T. Shikongo (2026 applicant)", leadType: "prospect", stage: "application", email: "t.shikongo@email.com" },
      { name: "Class of 2019 Alumni Network", leadType: "alumni", stage: "engaged", email: "alumni@institution.edu.na" },
      { name: "Bank Windhoek — Graduate Programme", leadType: "partner", stage: "active", email: "hr@bankwindhoek.com.na" },
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
        studentNumber: students[0].studentNumber,
        qualification: programmes[0].name,
        yearAwarded: 2024,
        verifyCode: `SC360-${tenant.slug.toUpperCase()}-2024-DEMO`,
        blockchainHash: `0x${hash}`,
      },
    });
  }

  console.log("  Campus tenants: meyfield, unam-demo, nursing-demo");
}
