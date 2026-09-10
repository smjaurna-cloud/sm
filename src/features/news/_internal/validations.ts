import { z } from "zod";

export const createNewsArticleSchema = z.object({
  titleTh: z.string().min(1, "title_required").max(255),
  titleEn: z.string().min(1, "title_required").max(255),
  slug: z
    .string()
    .min(1, "slug_required")
    .max(255)
    .regex(/^[a-z0-9-]+$/, "slug_format"),
  categoryId: z.string().uuid("invalid_category"),
  summaryTh: z.string().max(2000).optional().nullable(),
  summaryEn: z.string().max(2000).optional().nullable(),
  contentTh: z.string().min(1, "content_required"),
  contentEn: z.string().min(1, "content_required"),
  coverImageUrl: z.string().max(500).optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  targetAudience: z.enum(["ALL", "PUBLIC", "INTERNAL"]).default("ALL"),
  isPinned: z.boolean().default(false),
  publishedAt: z.string().optional().nullable(),
});

export const updateNewsArticleSchema = createNewsArticleSchema.extend({
  id: z.string().uuid(),
});

export const createNewsCategorySchema = z.object({
  nameTh: z.string().min(1, "name_required").max(100),
  nameEn: z.string().min(1, "name_required").max(100),
  slug: z
    .string()
    .min(1, "slug_required")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "slug_format"),
  orderSeq: z.number().int().default(0),
});

export const updateNewsCategorySchema = createNewsCategorySchema.extend({
  id: z.string().uuid(),
});

export type CreateNewsArticleInput = z.infer<typeof createNewsArticleSchema>;
export type UpdateNewsArticleInput = z.infer<typeof updateNewsArticleSchema>;
export type CreateNewsCategoryInput = z.infer<typeof createNewsCategorySchema>;
export type UpdateNewsCategoryInput = z.infer<typeof updateNewsCategorySchema>;
