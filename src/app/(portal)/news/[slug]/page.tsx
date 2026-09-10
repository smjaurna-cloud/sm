import Link from "next/link";
import { notFound } from "next/navigation";
import { getT } from "@/i18n/server";
import { getLocale } from "@/shared/lib/i18n/server";
import { formatDate } from "@/shared/lib/format";
import {
  getPublicArticleBySlug,
  getRelatedArticles,
  resolveCurrentTenantId,
} from "@/features/news/server";
import {
  Calendar,
  Eye,
  User,
  ArrowLeft,
  Share2,
  Newspaper,
  Tag,
} from "lucide-react";

export default async function ArticleDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const { slug } = await props.params;
  const tenantId = await resolveCurrentTenantId();

  const article = await getPublicArticleBySlug(tenantId, slug);
  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(tenantId, article.categoryId, article.id, 3);

  const title = locale === "en" ? article.titleEn : article.titleTh;
  const summary = locale === "en" ? article.summaryEn : article.summaryTh;
  const content = locale === "en" ? article.contentEn : article.contentTh;
  const categoryName = locale === "en" ? article.categoryNameEn : article.categoryNameTh;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Breadcrumb / Back button */}
      <div className="mb-6">
        <Link
          href="/news"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>{t("portal.backToNews")}</span>
        </Link>
      </div>

      {/* Article Header */}
      <article className="space-y-8">
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              <Tag className="h-3 w-3" />
              {categoryName}
            </span>
            {article.isPinned && (
              <span className="rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">
                PINNED
              </span>
            )}
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight sm:text-4xl sm:leading-tight">
            {title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 border-y py-3 text-xs text-muted-foreground sm:gap-6">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-primary" />
              <span>
                {t("portal.publishedOn")} {formatDate(article.publishedAt, locale)}
              </span>
            </span>

            {article.authorName && (
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                <span>{article.authorName}</span>
              </span>
            )}

            <span className="flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              <span>
                {article.viewsCount} {t("portal.viewsCount")}
              </span>
            </span>
          </div>
        </header>

        {/* Cover Image */}
        {article.coverImageUrl && (
          <div className="overflow-hidden rounded-2xl border bg-muted shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.coverImageUrl}
              alt={title}
              className="max-h-[480px] w-full object-cover"
            />
          </div>
        )}

        {/* Summary Callout */}
        {summary && (
          <div className="rounded-2xl border-l-4 border-primary bg-primary/5 p-5 text-sm font-medium leading-relaxed italic text-foreground/90">
            &ldquo;{summary}&rdquo;
          </div>
        )}

        {/* Article Body */}
        <div className="prose prose-neutral dark:prose-invert max-w-none text-sm leading-relaxed sm:text-base">
          {content.split("\n").map((para, index) => {
            const trimmed = para.trim();
            if (!trimmed) return null;
            return (
              <p key={index} className="my-4">
                {trimmed}
              </p>
            );
          })}
        </div>

        {/* Share Section */}
        <div className="flex items-center justify-between border-t pt-6">
          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t("portal.backToNews")}</span>
          </Link>

          <button
            type="button"
            onClick={undefined}
            className="inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-1.5 text-xs font-semibold shadow-xs hover:bg-muted"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>แชร์ข่าวนี้</span>
          </button>
        </div>
      </article>

      {/* Related News Section */}
      {relatedArticles.length > 0 && (
        <section className="mt-16 border-t pt-10">
          <h2 className="mb-6 text-xl font-bold tracking-tight">
            {t("portal.relatedNews")}
          </h2>

          <div className="grid gap-6 sm:grid-cols-3">
            {relatedArticles.map((rel) => {
              const relTitle = locale === "en" ? rel.titleEn : rel.titleTh;
              return (
                <Link
                  key={rel.id}
                  href={`/news/${rel.slug}`}
                  className="group flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs transition hover:shadow-md"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-muted">
                    {rel.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={rel.coverImageUrl}
                        alt={relTitle}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <Newspaper className="h-8 w-8 stroke-1" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <span className="text-[10px] text-muted-foreground">
                      {formatDate(rel.publishedAt, locale)}
                    </span>
                    <h4 className="mt-1 line-clamp-2 text-xs font-bold group-hover:text-primary transition">
                      {relTitle}
                    </h4>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
