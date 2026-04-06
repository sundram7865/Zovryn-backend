import { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import * as txService from "./transaction.service";
import {
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionQuery,
} from "./transaction.schema";

export const listTransactions = asyncHandler(
  async (req: Request, res: Response) => {
    const query = req.query as unknown as TransactionQuery;
    const result = await txService.listTransactions(query);
    ApiResponse.success(
      res,
      "Transactions fetched",
      result.transactions,
      result.meta as unknown as Record<string, unknown>
    );
  }
);

export const getTransactionById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const tx = await txService.getTransactionById(id);
    ApiResponse.success(res, "Transaction fetched", tx);
  }
);

export const createTransaction = asyncHandler(
  async (req: Request, res: Response) => {
    const input = req.body as CreateTransactionInput;
    const tx = await txService.createTransaction(input, req.user!.id);
    ApiResponse.created(res, "Transaction created", tx);
  }
);

export const updateTransaction = asyncHandler(
  async (req: Request, res: Response) => {
    const input = req.body as UpdateTransactionInput;
    const id = String(req.params.id);
    const tx = await txService.updateTransaction(id, input, req.user!.id);
    ApiResponse.success(res, "Transaction updated", tx);
  }
);

export const deleteTransaction = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    await txService.deleteTransaction(id, req.user!.id);
    ApiResponse.success(res, "Transaction deleted (soft)");
  }
);