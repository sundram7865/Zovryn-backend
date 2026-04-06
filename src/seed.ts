import { PrismaClient, Role, TransactionType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...\n");

  // ─────────────────────────────────────────────
  // Clean existing data (dev only)
  // ─────────────────────────────────────────────
  await prisma.auditLog.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.user.deleteMany();
  console.log("🧹 Cleared existing data");

  const passwordHash = await bcrypt.hash("Password123!", 12);

  // ─────────────────────────────────────────────
  // Create Users
  // ─────────────────────────────────────────────
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@finance.com",
      passwordHash,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  const analyst = await prisma.user.create({
    data: {
      name: "Analyst User",
      email: "analyst@finance.com",
      passwordHash,
      role: Role.ANALYST,
      isActive: true,
    },
  });

  const viewer = await prisma.user.create({
    data: {
      name: "Viewer User",
      email: "viewer@finance.com",
      passwordHash,
      role: Role.VIEWER,
      isActive: true,
    },
  });

  console.log("👤 Created users:");
  console.log(`   ADMIN    → admin@finance.com    / Password123!`);
  console.log(`   ANALYST  → analyst@finance.com  / Password123!`);
  console.log(`   VIEWER   → viewer@finance.com   / Password123!\n`);

  // ─────────────────────────────────────────────
  // Create Sample Transactions
  // ─────────────────────────────────────────────
  const transactions = [
    // Income
    { amount: 85000, type: TransactionType.INCOME, category: "Salary", date: "2025-01-05", notes: "January salary" },
    { amount: 12000, type: TransactionType.INCOME, category: "Freelance", date: "2025-01-15", notes: "Web project payment" },
    { amount: 85000, type: TransactionType.INCOME, category: "Salary", date: "2025-02-05", notes: "February salary" },
    { amount: 5000, type: TransactionType.INCOME, category: "Investment", date: "2025-02-20", notes: "Dividend received" },
    { amount: 85000, type: TransactionType.INCOME, category: "Salary", date: "2025-03-05", notes: "March salary" },
    { amount: 18000, type: TransactionType.INCOME, category: "Freelance", date: "2025-03-18", notes: "Consulting fee" },
    { amount: 85000, type: TransactionType.INCOME, category: "Salary", date: "2025-04-05", notes: "April salary" },
    // Expenses
    { amount: 22000, type: TransactionType.EXPENSE, category: "Rent", date: "2025-01-01", notes: "Monthly rent" },
    { amount: 4500, type: TransactionType.EXPENSE, category: "Groceries", date: "2025-01-08", notes: "Weekly groceries" },
    { amount: 1200, type: TransactionType.EXPENSE, category: "Utilities", date: "2025-01-10", notes: "Electricity bill" },
    { amount: 22000, type: TransactionType.EXPENSE, category: "Rent", date: "2025-02-01", notes: "Monthly rent" },
    { amount: 8000, type: TransactionType.EXPENSE, category: "Travel", date: "2025-02-14", notes: "Valentine's trip" },
    { amount: 3200, type: TransactionType.EXPENSE, category: "Groceries", date: "2025-02-20", notes: "Monthly groceries" },
    { amount: 22000, type: TransactionType.EXPENSE, category: "Rent", date: "2025-03-01", notes: "Monthly rent" },
    { amount: 15000, type: TransactionType.EXPENSE, category: "Electronics", date: "2025-03-12", notes: "Keyboard + mouse" },
    { amount: 5500, type: TransactionType.EXPENSE, category: "Dining", date: "2025-03-25", notes: "Team dinner" },
    { amount: 22000, type: TransactionType.EXPENSE, category: "Rent", date: "2025-04-01", notes: "Monthly rent" },
    { amount: 2800, type: TransactionType.EXPENSE, category: "Utilities", date: "2025-04-03", notes: "Internet + electricity" },
  ];

  for (const tx of transactions) {
    await prisma.transaction.create({
      data: {
        userId: admin.id,
        amount: tx.amount,
        type: tx.type,
        category: tx.category,
        date: new Date(tx.date),
        notes: tx.notes,
      },
    });
  }

  console.log(`💰 Created ${transactions.length} sample transactions\n`);
  console.log("✅ Seed complete!\n");
  console.log("─────────────────────────────────────");
  console.log("Quick start:");
  console.log("  POST /api/auth/login");
  console.log('  Body: { "email": "admin@finance.com", "password": "Password123!" }');
  console.log("─────────────────────────────────────\n");
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });