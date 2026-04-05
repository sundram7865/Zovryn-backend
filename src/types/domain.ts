export enum Role {
  VIEWER = "VIEWER",
  ANALYST = "ANALYST",
  ADMIN = "ADMIN",
}

export enum TransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
}

export enum AuditAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPublic {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionRecord {
  id: string;
  userId: string;
  amount: { toNumber(): number };
  type: TransactionType;
  category: string;
  date: Date;
  notes: string | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: { id: string; name: string; email: string };
}

export interface AuditLogRecord {
  id: string;
  userId: string;
  action: AuditAction;
  entity: string;
  entityId: string | null;
  meta: unknown;
  createdAt: Date;
}