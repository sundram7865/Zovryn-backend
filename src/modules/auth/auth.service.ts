import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/database";
import { env } from "../../config/env";
import { ApiError } from "../../utils/ApiError";
import { RegisterInput, LoginInput } from "./auth.schema";
import { JwtPayload } from "../../types/common";
import { Role, UserRecord, UserPublic } from "../../types/domain";

const SALT_ROUNDS = 12;

function generateToken(payload: Omit<JwtPayload, "iat" | "exp">): string {
  return jwt.sign(payload, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  } as jwt.SignOptions);
}

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    throw ApiError.conflict("A user with this email already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: (input.role as Role) ?? Role.VIEWER,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  }) as unknown as UserPublic;

  return { user};
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  }) as unknown as UserRecord | null;

  if (!user) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  if (!user.isActive) {
    throw ApiError.forbidden("Your account has been deactivated");
  }

  const isPasswordValid = await bcrypt.compare(
    input.password,
    user.passwordHash
  );

  if (!isPasswordValid) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "LOGIN",
      entity: "user",
      entityId: user.id,
    },
  });

  const token = generateToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
    token,
  };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  }) as unknown as UserPublic | null;

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  return user;
}