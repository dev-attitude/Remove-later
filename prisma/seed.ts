import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { seedCampus } from "./seed-campus";

const prisma = new PrismaClient();

const COMPLIMENTARY_UNTIL = new Date("2099-12-31T23:59:59.000Z");

async function upsertComplimentaryUser(input: {
  email: string;
  name: string;
  role: string;
  portal: string;
  passwordHash: string;
  tierId: string;
}) {
  const user = await prisma.user.upsert({
    where: { email: input.email },
    update: {
      name: input.name,
      role: input.role,
      portal: input.portal,
      passwordHash: input.passwordHash,
    },
    create: {
      email: input.email,
      name: input.name,
      passwordHash: input.passwordHash,
      role: input.role,
      portal: input.portal,
    },
  });

  await prisma.subscription.upsert({
    where: { userId: user.id },
    update: {
      portal: input.portal,
      tierId: input.tierId,
      status: "active",
      currentPeriodEnd: COMPLIMENTARY_UNTIL,
    },
    create: {
      userId: user.id,
      portal: input.portal,
      tierId: input.tierId,
      status: "active",
      currentPeriodEnd: COMPLIMENTARY_UNTIL,
    },
  });

  return user;
}

async function main() {
  const passwordHash = await bcrypt.hash("Demo1234!", 12);
  const adminPasswordHash = await bcrypt.hash("GmResearch!Admin2026", 12);
  const campusPasswordHash = await bcrypt.hash("SmartCampus!Demo2026", 12);
  const campusStudentPasswordHash = await bcrypt.hash("Student!Demo2026", 12);

  await upsertComplimentaryUser({
    email: "demo@gmresearch.com",
    name: "Demo User",
    role: "student",
    portal: "student",
    passwordHash,
    tierId: "stu-pro",
  });

  await upsertComplimentaryUser({
    email: "supervisor@gmresearch.com",
    name: "Demo Supervisor",
    role: "supervisor",
    portal: "institution",
    passwordHash,
    tierId: "inst-supervisor",
  });

  await upsertComplimentaryUser({
    email: "developer@gmresearch.com",
    name: "Platform Developer",
    role: "developer",
    portal: "developer",
    passwordHash,
    tierId: "dev-owner",
  });

  await upsertComplimentaryUser({
    email: "admin@gmresearch.com",
    name: "Platform Admin",
    role: "admin",
    portal: "developer",
    passwordHash: adminPasswordHash,
    tierId: "dev-owner",
  });

  await upsertComplimentaryUser({
    email: "campus@gmconsultations.com",
    name: "SmartCampus Demo VC",
    role: "admin",
    portal: "institution",
    passwordHash: campusPasswordHash,
    tierId: "inst-admin",
  });

  await upsertComplimentaryUser({
    email: "student@smartcampus.demo",
    name: "Demo Student",
    role: "student",
    portal: "student",
    passwordHash: campusStudentPasswordHash,
    tierId: "stu-pro",
  });

  const staffAccounts: { email: string; name: string; campusRole: string }[] = [
    { email: "registrar@smartcampus.demo", name: "Demo Registrar", campusRole: "registrar" },
    { email: "finance@smartcampus.demo", name: "Demo Finance Officer", campusRole: "finance" },
    { email: "lecturer@smartcampus.demo", name: "Demo Lecturer", campusRole: "lecturer" },
    { email: "exams@smartcampus.demo", name: "Demo Exams Officer", campusRole: "exams" },
  ];
  const staffPasswordHash = await bcrypt.hash("Staff!Demo2026", 12);
  for (const s of staffAccounts) {
    await upsertComplimentaryUser({
      email: s.email,
      name: s.name,
      role: "staff",
      portal: "institution",
      passwordHash: staffPasswordHash,
      tierId: "inst-staff",
    });
  }

  const admin = await prisma.user.findUnique({ where: { email: "admin@gmresearch.com" } });
  const campusUser = await prisma.user.findUnique({
    where: { email: "campus@gmconsultations.com" },
  });
  const campusStudent = await prisma.user.findUnique({
    where: { email: "student@smartcampus.demo" },
  });
  const campusMembers = [
    admin?.id ? { userId: admin.id, role: "vc" } : null,
    campusUser?.id ? { userId: campusUser.id, role: "vc" } : null,
    campusStudent?.id ? { userId: campusStudent.id, role: "student" } : null,
  ].filter((m): m is { userId: string; role: string } => m !== null);

  for (const s of staffAccounts) {
    const user = await prisma.user.findUnique({ where: { email: s.email } });
    if (user) campusMembers.push({ userId: user.id, role: s.campusRole });
  }

  await seedCampus(prisma, campusMembers);

  console.log("Seed complete:");
  console.log("  admin@gmresearch.com / GmResearch!Admin2026 (all portals, no charge)");
  console.log("  demo@gmresearch.com / Demo1234! (student)");
  console.log("  supervisor@gmresearch.com / Demo1234! (institution)");
  console.log("  developer@gmresearch.com / Demo1234! (developer)");
  console.log("  campus@gmconsultations.com / SmartCampus!Demo2026 (SmartCampus 360 management)");
  console.log("  student@smartcampus.demo / Student!Demo2026 (SmartCampus 360 student)");
  console.log("  registrar|finance|lecturer|exams@smartcampus.demo / Staff!Demo2026 (dept portals)");
  console.log("  Campus: /campus/login — horizon-university, acacia-college, unity-nursing");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
