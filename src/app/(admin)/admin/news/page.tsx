import { requirePermission, hasPermission } from "@/features/identity/server";
import {
  NEWS_P,
  listAdminArticles,
  getPublicNewsCategories,
} from "@/features/news/server";
import { NewsAdminClient } from "./_components/news-client";

export default async function AdminNewsPage() {
  const ctx = await requirePermission(NEWS_P.newsRead);

  const [articles, categories] = await Promise.all([
    listAdminArticles(ctx.tenantId),
    getPublicNewsCategories(ctx.tenantId),
  ]);

  return (
    <NewsAdminClient
      initialArticles={articles}
      categories={categories}
      canManage={hasPermission(ctx, NEWS_P.newsManage)}
      canPublish={hasPermission(ctx, NEWS_P.newsPublish)}
    />
  );
}
