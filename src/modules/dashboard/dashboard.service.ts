import { prisma } from "../../config/database";

// ─────────────────────────────────────────────
// Internal result shapes
// ─────────────────────────────────────────────

interface GroupByTypeResult {
  type: string;
  _sum: { amount: { toNumber(): number } | null };
}

interface RawTrendRow {
  month?: string;
  week?: string;
  type: string;
  total: number | string;
}

interface RecentTx {
  id: string;
  amount: { toNumber(): number };
  type: string;
  category: string;
  date: Date;
  notes: string | null;
  createdAt: Date;
  user: { id: string; name: string };
}

// ─────────────────────────────────────────────
// Summary: total income, expense, net balance
// ─────────────────────────────────────────────

export async function getSummary() {
  const result = (await prisma.transaction.groupBy({
    by: ["type"],
    where: { isDeleted: false },
    _sum: { amount: true },
  })) as unknown as GroupByTypeResult[];

  let totalIncome = 0;
  let totalExpense = 0;

  for (const row of result) {
    const val = row._sum.amount ? row._sum.amount.toNumber() : 0;
    if (row.type === "INCOME") totalIncome = val;
    if (row.type === "EXPENSE") totalExpense = val;
  }

  return {
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense,
  };
}

// ─────────────────────────────────────────────
// Category-wise totals
// ─────────────────────────────────────────────

export async function getCategoryBreakdown() {
  const result = (await prisma.transaction.groupBy({
    by: ["category", "type"],
    where: { isDeleted: false },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
  })) as unknown as Array<{
    category: string;
    type: string;
    _sum: { amount: { toNumber(): number } | null };
  }>;

  return result.map((row) => ({
    category: row.category,
    type: row.type,
    total: row._sum.amount ? row._sum.amount.toNumber() : 0,
  }));
}

// ─────────────────────────────────────────────
// Monthly trends (last 12 months) — raw SQL
// ─────────────────────────────────────────────

export async function getMonthlyTrends() {
  const rows = (await prisma.$queryRaw`
    SELECT
      TO_CHAR(date, 'YYYY-MM') AS month,
      type,
      CAST(SUM(amount) AS FLOAT) AS total
    FROM transactions
    WHERE
      is_deleted = false
      AND date >= NOW() - INTERVAL '12 months'
    GROUP BY TO_CHAR(date, 'YYYY-MM'), type
    ORDER BY month ASC, type ASC
  `) as unknown as RawTrendRow[];

  return rows.map((r) => ({
    month: r.month ?? "",
    type: r.type,
    total: Number(r.total),
  }));
}

// ─────────────────────────────────────────────
// Weekly trends (last 8 weeks) — raw SQL
// ─────────────────────────────────────────────

export async function getWeeklyTrends() {
  const rows = (await prisma.$queryRaw`
    SELECT
      TO_CHAR(DATE_TRUNC('week', date), 'YYYY-MM-DD') AS week,
      type,
      CAST(SUM(amount) AS FLOAT) AS total
    FROM transactions
    WHERE
      is_deleted = false
      AND date >= NOW() - INTERVAL '8 weeks'
    GROUP BY DATE_TRUNC('week', date), type
    ORDER BY week ASC, type ASC
  `) as unknown as RawTrendRow[];

  return rows.map((r) => ({
    week: r.week ?? "",
    type: r.type,
    total: Number(r.total),
  }));
}

// ─────────────────────────────────────────────
// Recent activity (last 10 transactions)
// ─────────────────────────────────────────────

export async function getRecentActivity() {
  const transactions = (await prisma.transaction.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      amount: true,
      type: true,
      category: true,
      date: true,
      notes: true,
      createdAt: true,
      user: { select: { id: true, name: true } },
    },
  })) as unknown as RecentTx[];

  return transactions.map((tx) => ({
    id: tx.id,
    amount: tx.amount.toNumber(),
    type: tx.type,
    category: tx.category,
    date: tx.date,
    notes: tx.notes,
    createdAt: tx.createdAt,
    user: tx.user,
  }));
}