import { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import * as dashboardService from "./dashboard.service";

export const getSummary = asyncHandler(async (_req: Request, res: Response) => {
  const data = await dashboardService.getSummary();
  ApiResponse.success(res, "Dashboard summary fetched", data);
});

export const getCategoryBreakdown = asyncHandler(
  async (_req: Request, res: Response) => {
    const data = await dashboardService.getCategoryBreakdown();
    ApiResponse.success(res, "Category breakdown fetched", data);
  }
);

export const getMonthlyTrends = asyncHandler(
  async (_req: Request, res: Response) => {
    const data = await dashboardService.getMonthlyTrends();
    ApiResponse.success(res, "Monthly trends fetched", data);
  }
);

export const getWeeklyTrends = asyncHandler(
  async (_req: Request, res: Response) => {
    const data = await dashboardService.getWeeklyTrends();
    ApiResponse.success(res, "Weekly trends fetched", data);
  }
);

export const getRecentActivity = asyncHandler(
  async (_req: Request, res: Response) => {
    const data = await dashboardService.getRecentActivity();
    ApiResponse.success(res, "Recent activity fetched", data);
  }
);