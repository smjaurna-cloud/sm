import Link from "next/link";
import { getT } from "@/i18n/server";
import { getLocale } from "@/shared/lib/i18n/server";
import { formatDate } from "@/shared/lib/format";
import {
  getPublicNewsCategories,
  getPublicArticles,
  resolveCurrentTenantId,
} from "@/features/news/server";
import { Newspaper, Calendar, Eye, ArrowRight, Search, Layers } from "lucide-react";

export default async function NewsCatalogPage(props: {
  searchParams: Promise<{ category?: string; q?: string; page?: string }>;
}) {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const searchParams = await props.searchParams;
  const categorySlug = searchParams.category;
  const search = searchParams.q;
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;

  const tenantId = await resolveCurrentTenantId();

  const [categories, articlesResult] = await Promise.all([
    getPublicNewsCategories(tenantId),
    getPublicArticles(tenantId, {
      categorySlug,
      search,
      page,
      limit: 9,
    }),
  ]);

  const { items: articles, total, totalPages } = articlesResult;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          {t("portal.news")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("news.subtitle")} ({total} รายการ)
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/news"
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              !categorySlug
                ? "bg-primary text-primary-foreground shadow-xs"
                : "border bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            {t("news.allCategories")}
          </Link>
          {categories.map((c) => {
            const catName = locale === "en" ? c.nameEn : c.nameTh;
            const active = categorySlug === c.slug;
            return (
              <Link
                key={c.id}
                href={`/news?category=${c.slug}${search ? `&q=${encodeURIComponent(search)}` : ""}`}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "border bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                {catName}
              </Link>
            );
          })}
        </div>

        {/* Search Input Form */}
        <form method="GET" action="/news" className="relative w-full sm:w-72">
          {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            name="q"
            defaultValue={search ?? ""}
            placeholder={t("portal.searchPlaceholder")}
            className="h-9 w-full rounded-xl border bg-background pl-9 pr-4 text-xs shadow-xs focus:outline-hidden focus:ring-2 focus:ring-primary"
          />
        </form>
      </div>

      {/* Articles Grid */}
      {articles.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center">
          <Layers className="h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-4 text-base font-semibold">{t("news.empty")}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            ลองปรับเปลี่ยนคำค้นหา หรือเลือกดูหมวดหมู่อื่น
          </p>
          <Link
            href="/news"
            className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
          >
            ล้างตัวกรองทั้งหมด
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((art) => {
            const title = locale === "en" ? art.titleEn : art.titleTh;
            const summary = locale === "en" ? art.summaryEn : art.summaryTh;
            const categoryName = locale === "en" ? art.categoryNameEn : art.categoryNameTh;

            return (
              <Link
                key={art.id}
                href={`/news/${art.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-xs transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                  {art.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={art.coverImageUrl}
                      alt={title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <Newspaper className="h-12 w-12 stroke-1" />
                    </div>
                  )}
                  <span className="absolute top-3 left-3 rounded-md bg-background/90 px-2.5 py-1 text-xs font-semibold text-foreground backdrop-blur">
                    {categoryName}
                  </span>
                  {art.isPinned && (
                    <span className="absolute top-3 right-3 rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold uppercase text-primary-foreground shadow-xs">
                      PINNED
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-2 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(art.publishedAt, locale)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      {art.viewsCount}
                    </span>
                  </div>

                  <h3 className="line-clamp-2 text-base font-bold leading-snug group-hover:text-primary transition">
                    {title}
                  </h3>

                  {summary && (
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {summary}
                    </p>
                  )}

                  <div className="mt-auto pt-4 flex items-center gap-1 text-xs font-semibold text-primary">
                    <span>{t("portal.readMore")}</span>
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/news?page=${page - 1}${categorySlug ? `&category=${categorySlug}` : ""}${
                search ? `&q=${encodeURIComponent(search)}` : ""
              }`}
              className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted"
            >
              ก่อนหน้า
            </Link>
          )}
          <span className="px-3 py-1.5 text-xs text-muted-foreground">
            หน้า {page} จาก {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/news?page=${page + 1}${categorySlug ? `&category=${categorySlug}` : ""}${
                search ? `&q=${encodeURIComponent(search)}` : ""
              }`}
              className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted"
            >
              ถัดไป
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
