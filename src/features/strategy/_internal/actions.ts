"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { STRATEGY_P } from "../permissions";
import {
  createStrategicKpiSchema,
  updateStrategicKpiSchema,
  updateKpiActualSchema,
  deleteStrategicKpiSchema,
} from "./validations";
import {
  createStrategicKpi,
  updateStrategicKpi,
  updateKpiActual,
  deleteStrategicKpi,
  type StrategicKpiDto,
} from "./services";

export async function createStrategicKpiAction(
  input: unknown
): Promise<ActionResult<StrategicKpiDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(STRATEGY_P.strategyManage);
    const parsed = createStrategicKpiSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });
    const result = await createStrategicKpi(ctx.tenantId, parsed);
    revalidatePath("/strategy");
    revalidatePath("/admin/strategy");
    return result;
  });
}

export async function updateKpiActualAction(
  input: unknown
): Promise<ActionResult<StrategicKpiDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(STRATEGY_P.strategyManage);
    const parsed = updateKpiActualSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });
    const result = await updateKpiActual(ctx.tenantId, parsed);
    revalidatePath("/strategy");
    revalidatePath("/admin/strategy");
    return result;
  });
}

export async function updateStrategicKpiAction(
  input: unknown
): Promise<ActionResult<StrategicKpiDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(STRATEGY_P.strategyManage);
    const parsed = updateStrategicKpiSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });
    const result = await updateStrategicKpi(ctx.tenantId, parsed);
    revalidatePath("/strategy");
    revalidatePath("/admin/strategy");
    return result;
  });
}

export async function deleteStrategicKpiAction(
  input: unknown
): Promise<ActionResult<{ success: boolean }>> {
  return runAction(async () => {
    const ctx = await requirePermission(STRATEGY_P.strategyManage);
    const parsed = deleteStrategicKpiSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });
    await deleteStrategicKpi(ctx.tenantId, parsed.id);
    revalidatePath("/strategy");
    revalidatePath("/admin/strategy");
    return { success: true };
  });
}
