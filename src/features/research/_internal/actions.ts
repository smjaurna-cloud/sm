"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { RESEARCH_P } from "../permissions";
import {
  createProjectSchema,
  updateProjectSchema,
  createPublicationSchema,
} from "./validations";
import {
  createResearchProject,
  updateResearchProject,
  deleteResearchProject,
  createPublication,
  deletePublication,
  type ResearchProjectDto,
  type PublicationDto,
} from "./services";

export async function createProjectAction(
  input: unknown
): Promise<ActionResult<ResearchProjectDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(RESEARCH_P.researchManage);
    const parsed = createProjectSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });
    const result = await createResearchProject(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/research");
    revalidatePath("/admin/research");
    return result;
  });
}

export async function updateProjectAction(
  input: unknown
): Promise<ActionResult<ResearchProjectDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(RESEARCH_P.researchManage);
    const parsed = updateProjectSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });
    const result = await updateResearchProject(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/research");
    revalidatePath("/admin/research");
    return result;
  });
}

export async function deleteProjectAction(
  id: string
): Promise<ActionResult<{ success: boolean }>> {
  return runAction(async () => {
    const ctx = await requirePermission(RESEARCH_P.researchManage);
    const result = await deleteResearchProject(ctx.tenantId, ctx.userId, id);
    revalidatePath("/research");
    revalidatePath("/admin/research");
    return result;
  });
}

export async function createPublicationAction(
  input: unknown
): Promise<ActionResult<PublicationDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(RESEARCH_P.researchManage);
    const parsed = createPublicationSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });
    const result = await createPublication(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/research");
    revalidatePath("/admin/research");
    return result;
  });
}

export async function deletePublicationAction(
  id: string
): Promise<ActionResult<{ success: boolean }>> {
  return runAction(async () => {
    const ctx = await requirePermission(RESEARCH_P.researchManage);
    const result = await deletePublication(ctx.tenantId, ctx.userId, id);
    revalidatePath("/research");
    revalidatePath("/admin/research");
    return result;
  });
}
