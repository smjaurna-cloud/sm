"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { NEWS_P } from "../permissions";
import {
  createNewsArticleSchema,
  updateNewsArticleSchema,
  createNewsCategorySchema,
} from "./validations";
import {
  createArticle,
  updateArticle,
  deleteArticle,
  togglePinArticle,
  createCategory,
  type NewsArticleDto,
  type NewsCategoryDto,
} from "./services";

export async function createNewsArticleAction(
  input: unknown
): Promise<ActionResult<NewsArticleDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsManage);
    const parsed = createNewsArticleSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });
    const result = await createArticle(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/news");
    revalidatePath("/");
    return result;
  });
}

export async function updateNewsArticleAction(
  input: unknown
): Promise<ActionResult<NewsArticleDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsManage);
    const parsed = updateNewsArticleSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });
    const result = await updateArticle(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/news");
    revalidatePath("/");
    return result;
  });
}

export async function deleteNewsArticleAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsManage);
    await deleteArticle(ctx.tenantId, ctx.userId, id);
    revalidatePath("/news");
    revalidatePath("/");
  });
}

export async function togglePinNewsArticleAction(
  id: string,
  isPinned: boolean
): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsPublish);
    await togglePinArticle(ctx.tenantId, ctx.userId, id, isPinned);
    revalidatePath("/news");
    revalidatePath("/");
  });
}

export async function createNewsCategoryAction(
  input: unknown
): Promise<ActionResult<NewsCategoryDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsManage);
    const parsed = createNewsCategorySchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });
    const result = await createCategory(ctx.tenantId, parsed);
    revalidatePath("/news");
    return result;
  });
}
