import { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import * as authService from "./auth.service";
import { RegisterInput, LoginInput } from "./auth.schema";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as RegisterInput;
  const result = await authService.registerUser(input);
  ApiResponse.created(res, "User registered successfully", result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as LoginInput;
  const result = await authService.loginUser(input);
  ApiResponse.success(res, "Login successful", result);
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const user = await authService.getMe(userId);
  ApiResponse.success(res, "Profile fetched", user);
});