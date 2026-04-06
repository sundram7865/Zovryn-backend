import { Router } from "express";
import { Role } from "../../types/domain";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionQuerySchema,
} from "./transaction.schema";
import * as txController from "./transaction.controller";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  authorize(Role.VIEWER, Role.ANALYST, Role.ADMIN),
  validate(transactionQuerySchema, "query"),
  txController.listTransactions
);

router.get(
  "/:id",
  authorize(Role.VIEWER, Role.ANALYST, Role.ADMIN),
  txController.getTransactionById
);

router.post(
  "/",
  authorize(Role.ADMIN),
  validate(createTransactionSchema),
  txController.createTransaction
);

router.put(
  "/:id",
  authorize(Role.ADMIN),
  validate(updateTransactionSchema),
  txController.updateTransaction
);

router.delete("/:id", authorize(Role.ADMIN), txController.deleteTransaction);

export default router;