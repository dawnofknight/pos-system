#!/usr/bin/env node

const { PrismaClient } = require("@prisma/client");
const { execSync } = require("child_process");

const prisma = new PrismaClient();

async function checkAndSetup() {
  console.log("🔍 Checking database status...\n");

  try {
    // Try to count users
    const userCount = await prisma.user.count();
    console.log(`✅ Database tables exist! Found ${userCount} users.`);

    if (userCount === 0) {
      console.log("\n🌱 No users found. Running seed...\n");
      execSync("node prisma/seed.js", { stdio: "inherit" });
    } else {
      console.log("✅ Database already has data!");
      const users = await prisma.user.findMany({
        select: { email: true, role: true },
      });
      console.log("\nExisting users:");
      users.forEach((u) => console.log(`  - ${u.email} (${u.role})`));
    }
  } catch (error) {
    if (error.code === "P2021") {
      console.log("❌ Tables do not exist! Setting up database...\n");

      console.log("1️⃣ Generating Prisma Client...");
      execSync("npx prisma generate", { stdio: "inherit" });

      console.log("\n2️⃣ Pushing schema to database...");
      execSync("npx prisma db push --accept-data-loss", { stdio: "inherit" });

      console.log("\n3️⃣ Seeding database...");
      execSync("node prisma/seed.js", { stdio: "inherit" });

      console.log("\n✅ Setup complete!");
    } else {
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkAndSetup().catch(console.error);
