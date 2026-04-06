import { Router } from "express";
import { Role } from "../../types/domain";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import * as dashboardController from "./dashboard.controller";

const router = Router();

router.use(authenticate);

router.get(
  "/summary",
  authorize(Role.VIEWER, Role.ANALYST, Role.ADMIN),
  dashboardController.getSummary
);

router.get(
  "/by-category",
  authorize(Role.VIEWER, Role.ANALYST, Role.ADMIN),
  dashboardController.getCategoryBreakdown
);

router.get(
  "/trends/monthly",
  authorize(Role.ANALYST, Role.ADMIN),
  dashboardController.getMonthlyTrends
);

router.get(
  "/trends/weekly",
  authorize(Role.ANALYST, Role.ADMIN),
  dashboardController.getWeeklyTrends
);

router.get(
  "/recent",
  authorize(Role.VIEWER, Role.ANALYST, Role.ADMIN),
  dashboardController.getRecentActivity
);

export default router;