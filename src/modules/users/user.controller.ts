import { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import * as userService from "./user.service";
import { UserListQuery, UpdateRoleInput, UpdateStatusInput } from "./user.schema";

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as UserListQuery;
  const result = await userService.listUsers(query);
  ApiResponse.success(
    res,
    "Users fetched",
    result.users,
    result.meta as unknown as Record<string, unknown>
  );
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const user = await userService.getUserById(id);
  ApiResponse.success(res, "User fetched", user);
});

export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as UpdateRoleInput;
  const id = String(req.params.id);
  const updated = await userService.updateUserRole(id, req.user!.id, input);
  ApiResponse.success(res, "User role updated", updated);
});

export const updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as UpdateStatusInput;
  const id = String(req.params.id);
  const updated = await userService.updateUserStatus(id, req.user!.id, input);
  ApiResponse.success(res, "User status updated", updated);
});