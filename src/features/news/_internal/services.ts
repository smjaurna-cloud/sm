import { prisma } from "@/shared/lib/infra/prisma";
import type { Prisma } from "@/generated/prisma";
import { writeAudit } from "@/features/identity/server";

import type {
  CreateNewsArticleInput,
  UpdateNewsArticleInput,
  CreateNewsCategoryInput,
} from "./validations";

export interface NewsCategoryDto {
  id: string;
  tenantId: string;
  nameTh: string;
  nameEn: string;
  slug: string;
  orderSeq: number;
  createdAt: string;
}

export interface NewsArticleDto {
  id: string;
  tenantId: string;
  categoryId: string;
  categoryNameTh: string;
  categoryNameEn: string;
  categorySlug: string;
  authorId: string | null;
  authorName: string | null;
  titleTh: string;
  titleEn: string;
  slug: string;
  summaryTh: string | null;
  summaryEn: string | null;
  contentTh: string;
  contentEn: string;
  coverImageUrl: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  targetAudience: "ALL" | "PUBLIC" | "INTERNAL";
  isPinned: boolean;
  viewsCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

function mapArticle(item: {
  id: string;
  tenantId: string;
  categoryId: string;
  authorId: string | null;
  titleTh: string;
  titleEn: string;
  slug: string;
  summaryTh: string | null;
  summaryEn: string | null;
  contentTh: string;
  contentEn: string;
  coverImageUrl: string | null;
  status: string;
  targetAudience: string;
  isPinned: boolean;
  viewsCount: number;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  category: { nameTh: string; nameEn: string; slug: string };
  author?: { name: string } | null;
}): NewsArticleDto {
  return {
    id: item.id,
    tenantId: item.tenantId,
    categoryId: item.categoryId,
    categoryNameTh: item.category.nameTh,
    categoryNameEn: item.category.nameEn,
    categorySlug: item.category.slug,
    authorId: item.authorId,
    authorName: item.author?.name ?? null,
    titleTh: item.titleTh,
    titleEn: item.titleEn,
    slug: item.slug,
    summaryTh: item.summaryTh,
    summaryEn: item.summaryEn,
    contentTh: item.contentTh,
    contentEn: item.contentEn,
    coverImageUrl: item.coverImageUrl,
    status: item.status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
    targetAudience: item.targetAudience as "ALL" | "PUBLIC" | "INTERNAL",
    isPinned: item.isPinned,
    viewsCount: item.viewsCount,
    publishedAt: item.publishedAt ? item.publishedAt.toISOString() : null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

// -------------------------------------------------------------
// PUBLIC PORTAL QUERIES
// -------------------------------------------------------------

export async function getPublicNewsCategories(tenantId: string): Promise<NewsCategoryDto[]> {
  const cats = await prisma.newsCategory.findMany({
    where: { tenantId },
    orderBy: { orderSeq: "asc" },
  });
  return cats.map((c) => ({
    id: c.id,
    tenantId: c.tenantId,
    nameTh: c.nameTh,
    nameEn: c.nameEn,
    slug: c.slug,
    orderSeq: c.orderSeq,
    createdAt: c.createdAt.toISOString(),
  }));
}

export async function getPublicFeaturedArticles(
  tenantId: string,
  limit = 5
): Promise<NewsArticleDto[]> {
  const now = new Date();
  const items = await prisma.newsArticle.findMany({
    where: {
      tenantId,
      status: "PUBLISHED",
      isPinned: true,
      publishedAt: { lte: now },
      targetAudience: { in: ["ALL", "PUBLIC"] },
    },
    include: {
      category: { select: { nameTh: true, nameEn: true, slug: true } },
      author: { select: { name: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
  return items.map(mapArticle);
}

export async function getPublicArticles(
  tenantId: string,
  options: {
    categorySlug?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<{ items: NewsArticleDto[]; total: number; page: number; totalPages: number }> {
  const now = new Date();
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.max(1, Math.min(50, options.limit ?? 9));
  const skip = (page - 1) * limit;

  const where: Prisma.NewsArticleWhereInput = {
    tenantId,
    status: "PUBLISHED",
    publishedAt: { lte: now },
    targetAudience: { in: ["ALL", "PUBLIC"] },
    ...(options.categorySlug ? { category: { slug: options.categorySlug } } : {}),
    ...(options.search
      ? {
          OR: [
            { titleTh: { contains: options.search, mode: "insensitive" } },
            { titleEn: { contains: options.search, mode: "insensitive" } },
            { summaryTh: { contains: options.search, mode: "insensitive" } },
            { summaryEn: { contains: options.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [total, items] = await Promise.all([
    prisma.newsArticle.count({ where }),
    prisma.newsArticle.findMany({
      where,
      include: {
        category: { select: { nameTh: true, nameEn: true, slug: true } },
        author: { select: { name: true } },
      },
      orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
      skip,
      take: limit,
    }),
  ]);

  return {
    items: items.map(mapArticle),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getPublicArticleBySlug(
  tenantId: string,
  slug: string
): Promise<NewsArticleDto | null> {
  const now = new Date();
  const article = await prisma.newsArticle.findFirst({
    where: {
      tenantId,
      slug,
      status: "PUBLISHED",
      publishedAt: { lte: now },
      targetAudience: { in: ["ALL", "PUBLIC"] },
    },
    include: {
      category: { select: { nameTh: true, nameEn: true, slug: true } },
      author: { select: { name: true } },
    },
  });

  if (!article) return null;

  // Increment view count asynchronously
  await prisma.newsArticle.update({
    where: { id: article.id },
    data: { viewsCount: { increment: 1 } },
  });

  return mapArticle({ ...article, viewsCount: article.viewsCount + 1 });
}

export async function getRelatedArticles(
  tenantId: string,
  categoryId: string,
  excludeId: string,
  limit = 3
): Promise<NewsArticleDto[]> {
  const now = new Date();
  const items = await prisma.newsArticle.findMany({
    where: {
      tenantId,
      categoryId,
      id: { not: excludeId },
      status: "PUBLISHED",
      publishedAt: { lte: now },
      targetAudience: { in: ["ALL", "PUBLIC"] },
    },
    include: {
      category: { select: { nameTh: true, nameEn: true, slug: true } },
      author: { select: { name: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
  return items.map(mapArticle);
}

// -------------------------------------------------------------
// ADMIN MANAGEMENT
// -------------------------------------------------------------

export async function listAdminArticles(
  tenantId: string,
  options?: { categoryId?: string; status?: string; search?: string }
): Promise<NewsArticleDto[]> {
  const where: Prisma.NewsArticleWhereInput = {
    tenantId,
    ...(options?.categoryId ? { categoryId: options.categoryId } : {}),
    ...(options?.status ? { status: options.status as "DRAFT" | "PUBLISHED" | "ARCHIVED" } : {}),
    ...(options?.search
      ? {
          OR: [
            { titleTh: { contains: options.search, mode: "insensitive" } },
            { titleEn: { contains: options.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const items = await prisma.newsArticle.findMany({
    where,
    include: {
      category: { select: { nameTh: true, nameEn: true, slug: true } },
      author: { select: { name: true } },
    },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
  });

  return items.map(mapArticle);
}

export async function createArticle(
  tenantId: string,
  authorId: string | null,
  input: CreateNewsArticleInput
): Promise<NewsArticleDto> {
  const existing = await prisma.newsArticle.findUnique({
    where: { tenantId_slug: { tenantId, slug: input.slug } },
  });
  if (existing) {
    throw new Error("slug_already_exists");
  }

  const publishedDate = input.publishedAt
    ? new Date(input.publishedAt)
    : input.status === "PUBLISHED"
      ? new Date()
      : null;

  const created = await prisma.newsArticle.create({
    data: {
      tenantId,
      categoryId: input.categoryId,
      authorId,
      titleTh: input.titleTh,
      titleEn: input.titleEn,
      slug: input.slug,
      summaryTh: input.summaryTh ?? null,
      summaryEn: input.summaryEn ?? null,
      contentTh: input.contentTh,
      contentEn: input.contentEn,
      coverImageUrl: input.coverImageUrl ?? null,
      status: input.status,
      targetAudience: input.targetAudience,
      isPinned: input.isPinned,
      publishedAt: publishedDate,
    },
    include: {
      category: { select: { nameTh: true, nameEn: true, slug: true } },
      author: { select: { name: true } },
    },
  });

  await writeAudit({
    tenantId,
    actorId: authorId,
    action: "news.create",
    entity: "news_article",
    entityId: created.id,
    after: { titleTh: created.titleTh, slug: created.slug, status: created.status },
  });

  return mapArticle(created);
}

export async function updateArticle(
  tenantId: string,
  actorId: string | null,
  input: UpdateNewsArticleInput
): Promise<NewsArticleDto> {
  const current = await prisma.newsArticle.findUnique({
    where: { id: input.id },
  });
  if (!current || current.tenantId !== tenantId) {
    throw new Error("article_not_found");
  }

  if (input.slug !== current.slug) {
    const slugConflict = await prisma.newsArticle.findUnique({
      where: { tenantId_slug: { tenantId, slug: input.slug } },
    });
    if (slugConflict) {
      throw new Error("slug_already_exists");
    }
  }

  const publishedDate = input.publishedAt
    ? new Date(input.publishedAt)
    : input.status === "PUBLISHED" && !current.publishedAt
      ? new Date()
      : current.publishedAt;

  const updated = await prisma.newsArticle.update({
    where: { id: input.id },
    data: {
      categoryId: input.categoryId,
      titleTh: input.titleTh,
      titleEn: input.titleEn,
      slug: input.slug,
      summaryTh: input.summaryTh ?? null,
      summaryEn: input.summaryEn ?? null,
      contentTh: input.contentTh,
      contentEn: input.contentEn,
      coverImageUrl: input.coverImageUrl ?? null,
      status: input.status,
      targetAudience: input.targetAudience,
      isPinned: input.isPinned,
      publishedAt: publishedDate,
    },
    include: {
      category: { select: { nameTh: true, nameEn: true, slug: true } },
      author: { select: { name: true } },
    },
  });

  await writeAudit({
    tenantId,
    actorId,
    action: "news.update",
    entity: "news_article",
    entityId: updated.id,
    before: { titleTh: current.titleTh, status: current.status, isPinned: current.isPinned },
    after: { titleTh: updated.titleTh, status: updated.status, isPinned: updated.isPinned },
  });

  return mapArticle(updated);
}

export async function deleteArticle(
  tenantId: string,
  actorId: string | null,
  id: string
): Promise<void> {
  const current = await prisma.newsArticle.findUnique({ where: { id } });
  if (!current || current.tenantId !== tenantId) {
    throw new Error("article_not_found");
  }

  await prisma.newsArticle.delete({ where: { id } });

  await writeAudit({
    tenantId,
    actorId,
    action: "news.delete",
    entity: "news_article",
    entityId: id,
    before: { titleTh: current.titleTh, slug: current.slug },
  });
}

export async function togglePinArticle(
  tenantId: string,
  actorId: string | null,
  id: string,
  isPinned: boolean
): Promise<void> {
  const current = await prisma.newsArticle.findUnique({ where: { id } });
  if (!current || current.tenantId !== tenantId) {
    throw new Error("article_not_found");
  }

  await prisma.newsArticle.update({
    where: { id },
    data: { isPinned },
  });

  await writeAudit({
    tenantId,
    actorId,
    action: "news.toggle_pin",
    entity: "news_article",
    entityId: id,
    after: { isPinned },
  });
}

export async function createCategory(
  tenantId: string,
  input: CreateNewsCategoryInput
): Promise<NewsCategoryDto> {
  const created = await prisma.newsCategory.create({
    data: {
      tenantId,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      slug: input.slug,
      orderSeq: input.orderSeq,
    },
  });
  return {
    id: created.id,
    tenantId: created.tenantId,
    nameTh: created.nameTh,
    nameEn: created.nameEn,
    slug: created.slug,
    orderSeq: created.orderSeq,
    createdAt: created.createdAt.toISOString(),
  };
}
