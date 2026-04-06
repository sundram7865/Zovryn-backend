import { Router } from "express";
import { Role } from "../../types/domain";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import {
  updateRoleSchema,
  updateStatusSchema,
  userListQuerySchema,
} from "./user.schema";
import * as userController from "./user.controller";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  authorize(Role.ADMIN),
  validate(userListQuerySchema, "query"),
  userController.listUsers
);

router.get("/:id", authorize(Role.ADMIN), userController.getUserById);

router.patch(
  "/:id/role",
  authorize(Role.ADMIN),
  validate(updateRoleSchema),
  userController.updateUserRole
);

router.patch(
  "/:id/status",
  authorize(Role.ADMIN),
  validate(updateStatusSchema),
  userController.updateUserStatus
);

export default router;