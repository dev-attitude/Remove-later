/**
 * Reset (or create) the primary owner account for Business Manager.
 * Usage: npx tsx scripts/reset-owner-password.ts
 * Optional env: OWNER_EMAIL, OWNER_PASSWORD, OWNER_NAME
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { COMPANY } from "../src/lib/site-content";

const prisma = new PrismaClient();

const DEFAULT_EMAIL = COMPANY.email;
const DEFAULT_PASSWORD = "GmOwner!2026";
const DEFAULT_NAME = "Erastus";
const COMPLIMENTARY_UNTIL = new Date("2099-12-31T23:59:59.000Z");

async function main() {
  const email = (process.env.OWNER_EMAIL || DEFAULT_EMAIL).toLowerCase().trim();
  const password = process.env.OWNER_PASSWORD || DEFAULT_PASSWORD;
  const name = process.env.OWNER_NAME || DEFAULT_NAME;
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      role: "owner",
      portal: "developer",
      passwordHash,
    },
    create: {
      email,
      name,
      role: "owner",
      portal: "developer",
      passwordHash,
    },
  });

  await prisma.subscription.upsert({
    where: { userId: user.id },
    update: {
      portal: "developer",
      tierId: "dev-owner",
      status: "active",
      currentPeriodEnd: COMPLIMENTARY_UNTIL,
    },
    create: {
      userId: user.id,
      portal: "developer",
      tierId: "dev-owner",
      status: "active",
      currentPeriodEnd: COMPLIMENTARY_UNTIL,
    },
  });

  console.log("Owner account ready:");
  console.log(`  Name:  ${name}`);
  console.log(`  Email: ${email}`);
  console.log(`  Role:  owner`);
  console.log(`  Staff login: https://www.gmconsultations.com/business/login`);
  console.log(`  Business Manager: https://www.gmconsultations.com/manage`);
  if (!process.env.OWNER_PASSWORD) {
    console.log(`  New password: ${DEFAULT_PASSWORD}`);
    console.log("  Change this after signing in. Set OWNER_PASSWORD env for a custom password.");
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
