import { Role } from "./domain";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: Role;
        isActive: boolean;
      };
    }
  }
}