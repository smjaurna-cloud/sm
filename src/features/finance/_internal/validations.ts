import { z } from "zod";

export const budgetCategoryEnum = z.enum([
  "PERSONNEL",
  "OPERATING",
  "INVESTMENT",
  "SUBSIDY",
  "OTHER",
]);
export type BudgetCategory = z.infer<typeof budgetCategoryEnum>;

export const budgetTxTypeEnum = z.enum(["ALLOCATION", "EXPENSE", "TRANSFER"]);
export type BudgetTxType = z.infer<typeof budgetTxTypeEnum>;

export const createFiscalYearSchema = z.object({
  year: z.number().int().min(2500).max(2700),
  totalBudget: z.number().positive(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  isActive: z.boolean().default(true),
});
export type CreateFiscalYearInput = z.infer<typeof createFiscalYearSchema>;

export const createBudgetPlanSchema = z.object({
  fiscalYearId: z.string().uuid(),
  code: z.string().min(1).max(50),
  nameTh: z.string().min(1).max(255),
  nameEn: z.string().min(1).max(255),
  category: budgetCategoryEnum.default("OPERATING"),
  departmentId: z.string().uuid().optional().nullable(),
  allocatedAmount: z.number().nonnegative(),
  orderSeq: z.number().int().default(0),
});
export type CreateBudgetPlanInput = z.infer<typeof createBudgetPlanSchema>;

export const updateBudgetPlanSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(1).max(50),
  nameTh: z.string().min(1).max(255),
  nameEn: z.string().min(1).max(255),
  category: budgetCategoryEnum.default("OPERATING"),
  departmentId: z.string().uuid().optional().nullable(),
  allocatedAmount: z.number().nonnegative(),
  orderSeq: z.number().int().default(0),
});
export type UpdateBudgetPlanInput = z.infer<typeof updateBudgetPlanSchema>;

export const recordTransactionSchema = z.object({
  planId: z.string().uuid(),
  description: z.string().min(1).max(500),
  amount: z.number().positive(),
  type: budgetTxTypeEnum.default("EXPENSE"),
  txDate: z.string().optional(),
  referenceDoc: z.string().max(100).optional().nullable(),
});
export type RecordTransactionInput = z.infer<typeof recordTransactionSchema>;

export const deleteBudgetPlanSchema = z.object({
  id: z.string().uuid(),
});
export type DeleteBudgetPlanInput = z.infer<typeof deleteBudgetPlanSchema>;
