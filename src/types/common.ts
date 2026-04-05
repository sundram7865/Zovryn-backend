export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface JwtPayload {
  sub: string;  // user id
  email: string;
  role: string;
  isActive: boolean;
  iat?: number;
  exp?: number;
}