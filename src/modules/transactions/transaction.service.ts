import { prisma } from "../../config/database";
import { ApiError } from "../../utils/ApiError";
import { getPaginationParams, buildPaginationMeta } from "../../utils/Pagination";
import { TransactionType, TransactionRecord } from "../../types/domain";
import {
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionQuery,
} from "./transaction.schema";

const TX_SELECT = {
  id: true,
  amount: true,
  type: true,
  category: true,
  date: true,
  notes: true,
  isDeleted: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: { id: true, name: true, email: true },
  },
} as const;

type WhereClause = {
  isDeleted: boolean;
  type?: string;
  category?: { contains: string; mode: string };
  date?: { gte?: Date; lte?: Date };
  OR?: Array<{
    notes?: { contains: string; mode: string };
    category?: { contains: string; mode: string };
  }>;
};

export async function listTransactions(query: TransactionQuery) {
  const { skip, take, page, limit } = getPaginationParams(
    query.page,
    query.limit
  );

  const where: WhereClause = { isDeleted: false };

  if (query.type) where.type = query.type;
  if (query.category)
    where.category = { contains: query.category, mode: "insensitive" };
  if (query.from || query.to) {
    where.date = {
      ...(query.from && { gte: new Date(query.from) }),
      ...(query.to && { lte: new Date(query.to) }),
    };
  }
  if (query.search) {
    where.OR = [
      { notes: { contains: query.search, mode: "insensitive" } },
      { category: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const [transactions, total] = (await prisma.$transaction([
    prisma.transaction.findMany({
      where: where as never,
      select: TX_SELECT,
      skip,
      take,
      orderBy: { date: "desc" },
    }),
    prisma.transaction.count({
      where: where as never,
    }),
  ])) as unknown as [TransactionRecord[], number];

  return { transactions, meta: buildPaginationMeta(total, page, limit) };
}

export async function getTransactionById(id: string) {
  const tx = (await prisma.transaction.findFirst({
    where: { id, isDeleted: false },
    select: TX_SELECT,
  })) as unknown as TransactionRecord | null;

  if (!tx) throw ApiError.notFound("Transaction not found");
  return tx;
}

export async function createTransaction(
  input: CreateTransactionInput,
  userId: string
) {
  const tx = (await prisma.transaction.create({
    data: {
      userId,
      amount: input.amount,
      type: input.type as TransactionType,
      category: input.category,
      date: new Date(input.date),
      notes: input.notes,
    },
    select: TX_SELECT,
  })) as unknown as TransactionRecord;

  await prisma.auditLog.create({
    data: {
      userId,
      action: "CREATE",
      entity: "transaction",
      entityId: tx.id,
      meta: {
        amount: input.amount,
        type: input.type,
        category: input.category,
      },
    },
  });

  return tx;
}

export async function updateTransaction(
  id: string,
  input: UpdateTransactionInput,
  userId: string
) {
  const existing = (await prisma.transaction.findFirst({
    where: { id, isDeleted: false },
  })) as unknown as TransactionRecord | null;

  if (!existing) throw ApiError.notFound("Transaction not found");

  const updated = (await prisma.transaction.update({
    where: { id },
    data: {
      ...(input.amount !== undefined && { amount: input.amount }),
      ...(input.type && { type: input.type as TransactionType }),
      ...(input.category && { category: input.category }),
      ...(input.date && { date: new Date(input.date) }),
      ...(input.notes !== undefined && { notes: input.notes }),
    },
    select: TX_SELECT,
  })) as unknown as TransactionRecord;

  await prisma.auditLog.create({
    data: {
      userId,
      action: "UPDATE",
      entity: "transaction",
      entityId: id,
      meta: { changes: input },
    },
  });

  return updated;
}

export async function deleteTransaction(id: string, userId: string) {
  const existing = (await prisma.transaction.findFirst({
    where: { id, isDeleted: false },
  })) as unknown as TransactionRecord | null;

  if (!existing) throw ApiError.notFound("Transaction not found");

  await prisma.transaction.update({
    where: { id },
    data: { isDeleted: true },
  });

  await prisma.auditLog.create({
    data: {
      userId,
      action: "DELETE",
      entity: "transaction",
      entityId: id,
    },
  });
}