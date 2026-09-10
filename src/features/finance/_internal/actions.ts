"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { FINANCE_P } from "../permissions";
import {
  createBudgetPlanSchema,
  updateBudgetPlanSchema,
  deleteBudgetPlanSchema,
  recordTransactionSchema,
} from "./validations";
import {
  createBudgetPlan,
  updateBudgetPlan,
  deleteBudgetPlan,
  recordBudgetTransaction,
  type BudgetPlanDto,
  type BudgetTransactionDto,
} from "./services";

export async function createBudgetPlanAction(
  input: unknown
): Promise<ActionResult<BudgetPlanDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(FINANCE_P.financeManage);
    const parsed = createBudgetPlanSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });
    const result = await createBudgetPlan(ctx.tenantId, parsed);
    revalidatePath("/finance");
    revalidatePath("/admin/finance");
    return result;
  });
}

export async function updateBudgetPlanAction(
  input: unknown
): Promise<ActionResult<BudgetPlanDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(FINANCE_P.financeManage);
    const parsed = updateBudgetPlanSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });
    const result = await updateBudgetPlan(ctx.tenantId, parsed);
    revalidatePath("/finance");
    revalidatePath("/admin/finance");
    return result;
  });
}

export async function deleteBudgetPlanAction(
  input: unknown
): Promise<ActionResult<{ success: boolean }>> {
  return runAction(async () => {
    const ctx = await requirePermission(FINANCE_P.financeManage);
    const parsed = deleteBudgetPlanSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });
    await deleteBudgetPlan(ctx.tenantId, parsed.id);
    revalidatePath("/finance");
    revalidatePath("/admin/finance");
    return { success: true };
  });
}

export async function recordTransactionAction(
  input: unknown
): Promise<ActionResult<BudgetTransactionDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(FINANCE_P.financeCreate);
    const parsed = recordTransactionSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });
    const result = await recordBudgetTransaction(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/finance");
    revalidatePath("/admin/finance");
    return result;
  });
}
