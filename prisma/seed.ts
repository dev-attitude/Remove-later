import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Demo1234!", 12);

  await prisma.user.upsert({
    where: { email: "demo@gmresearch.com" },
    update: {},
    create: {
      email: "demo@gmresearch.com",
      name: "Demo User",
      passwordHash,
      role: "student",
      portal: "student",
    },
  });

  await prisma.user.upsert({
    where: { email: "supervisor@gmresearch.com" },
    update: {},
    create: {
      email: "supervisor@gmresearch.com",
      name: "Demo Supervisor",
      passwordHash,
      role: "supervisor",
      portal: "institution",
    },
  });

  await prisma.user.upsert({
    where: { email: "developer@gmresearch.com" },
    update: {},
    create: {
      email: "developer@gmresearch.com",
      name: "Platform Developer",
      passwordHash,
      role: "developer",
      portal: "developer",
    },
  });

  console.log("Seed complete:");
  console.log("  demo@gmresearch.com / Demo1234! (student)");
  console.log("  supervisor@gmresearch.com / Demo1234! (institution)");
  console.log("  developer@gmresearch.com / Demo1234! (developer)");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
