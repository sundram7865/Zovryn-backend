import { prisma } from "../../config/database";
import { ApiError } from "../../utils/ApiError";
import { getPaginationParams, buildPaginationMeta } from "../../utils/Pagination";
import { Role, UserPublic } from "../../types/domain";
import { UserListQuery, UpdateRoleInput, UpdateStatusInput } from "./user.schema";

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function listUsers(query: UserListQuery) {
  const { skip, take, page, limit } = getPaginationParams(
    query.page,
    query.limit
  );

  const where = {
    ...(query.role && { role: query.role as Role }),
    ...(query.isActive !== undefined && { isActive: query.isActive }),
  };

  const [users, total] = (await prisma.$transaction([
    prisma.user.findMany({
      where,
      select: USER_SELECT,
      skip,
      take,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ])) as unknown as [UserPublic[], number];

  return { users, meta: buildPaginationMeta(total, page, limit) };
}

export async function getUserById(id: string) {
  const user = (await prisma.user.findUnique({
    where: { id },
    select: USER_SELECT,
  })) as unknown as UserPublic | null;

  if (!user) throw ApiError.notFound("User not found");
  return user;
}

export async function updateUserRole(
  targetId: string,
  requesterId: string,
  input: UpdateRoleInput
) {
  if (targetId === requesterId && input.role !== "ADMIN") {
    throw ApiError.badRequest("You cannot change your own role");
  }

  const user = (await prisma.user.findUnique({
    where: { id: targetId },
  })) as unknown as UserPublic | null;

  if (!user) throw ApiError.notFound("User not found");

  const updated = (await prisma.user.update({
    where: { id: targetId },
    data: { role: input.role as Role },
    select: USER_SELECT,
  })) as unknown as UserPublic;

  await prisma.auditLog.create({
    data: {
      userId: requesterId,
      action: "UPDATE",
      entity: "user",
      entityId: targetId,
      meta: { field: "role", from: user.role, to: input.role },
    },
  });

  return updated;
}

export async function updateUserStatus(
  targetId: string,
  requesterId: string,
  input: UpdateStatusInput
) {
  if (targetId === requesterId) {
    throw ApiError.badRequest("You cannot deactivate your own account");
  }

  const user = (await prisma.user.findUnique({
    where: { id: targetId },
  })) as unknown as UserPublic | null;

  if (!user) throw ApiError.notFound("User not found");

  const updated = (await prisma.user.update({
    where: { id: targetId },
    data: { isActive: input.isActive },
    select: USER_SELECT,
  })) as unknown as UserPublic;

  await prisma.auditLog.create({
    data: {
      userId: requesterId,
      action: "UPDATE",
      entity: "user",
      entityId: targetId,
      meta: { field: "isActive", from: user.isActive, to: input.isActive },
    },
  });

  return updated;
}