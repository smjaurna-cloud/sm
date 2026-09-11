import "server-only";

export {
  getPublicNewsCategories,
  getPublicFeaturedArticles,
  getPublicArticles,
  getPublicArticleBySlug,
  getRelatedArticles,
  listAdminArticles,
  type NewsArticleDto,
  type NewsCategoryDto,
} from "./_internal/services";

export { resolveCurrentTenantId } from "@/features/identity/server";

export { NEWS_P, NEWS_PERMISSIONS } from "./permissions";
