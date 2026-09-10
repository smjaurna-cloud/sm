import "server-only";

export {
  getPublicNewsCategories,
  getPublicFeaturedArticles,
  getPublicArticles,
  getPublicArticleBySlug,
  getRelatedArticles,
  listAdminArticles,
  resolveCurrentTenantId,
  type NewsArticleDto,
  type NewsCategoryDto,
} from "./_internal/services";

export { NEWS_P, NEWS_PERMISSIONS } from "./permissions";
