"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { CURRICULUM_P } from "../permissions";
import {
  createCurriculumSchema,
  updateCurriculumSchema,
} from "./validations";
import {
  createCurriculum,
  updateCurriculum,
  deleteCurriculum,
  type CurriculumDto,
} from "./services";

export async function createCurriculumAction(
  input: unknown
): Promise<ActionResult<CurriculumDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumManage);
    const parsed = createCurriculumSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });
    const result = await createCurriculum(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/curriculum");
    revalidatePath("/admin/curriculum");
    return result;
  });
}

export async function updateCurriculumAction(
  input: unknown
): Promise<ActionResult<CurriculumDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumManage);
    const parsed = updateCurriculumSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });
    const result = await updateCurriculum(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/curriculum");
    revalidatePath("/admin/curriculum");
    return result;
  });
}

export async function deleteCurriculumAction(
  id: string
): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumManage);
    await deleteCurriculum(ctx.tenantId, ctx.userId, id);
    revalidatePath("/curriculum");
    revalidatePath("/admin/curriculum");
  });
}
