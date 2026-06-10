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

  const admin = await prisma.user.findUnique({ where: { email: "admin@gmresearch.com" } });
  const campusUser = await prisma.user.findUnique({
    where: { email: "campus@gmconsultations.com" },
  });
  const campusMembers = [admin?.id, campusUser?.id].filter((id): id is string => Boolean(id));
  await seedCampus(prisma, campusMembers);

  console.log("Seed complete:");
  console.log("  admin@gmresearch.com / GmResearch!Admin2026 (all portals, no charge)");
  console.log("  demo@gmresearch.com / Demo1234! (student)");
  console.log("  supervisor@gmresearch.com / Demo1234! (institution)");
  console.log("  developer@gmresearch.com / Demo1234! (developer)");
  console.log("  campus@gmconsultations.com / SmartCampus!Demo2026 (SmartCampus 360)");
  console.log("  Campus: /campus/login — meyfield, unam-demo, nursing-demo");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
