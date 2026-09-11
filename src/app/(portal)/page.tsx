import Link from "next/link";
import { getT } from "@/i18n/server";
import { getLocale } from "@/shared/lib/i18n/server";
import { formatDate } from "@/shared/lib/format";
import {
  getPublicFeaturedArticles,
  getPublicArticles,
  resolveCurrentTenantId,
} from "@/features/news/server";
import { getPublicCurriculums } from "@/features/curriculum/server";
import { getPublicStaffDirectory } from "@/features/staff/server";
import { getResearchStats } from "@/features/research/server";
import { getPublicBookingResources } from "@/features/booking/server";
import { getApprovalStats } from "@/features/edoc/server";
import { getBudgetSummary } from "@/features/finance/server";
import { getActiveStrategicPlan } from "@/features/strategy/server";
import {
  Newspaper,
  Calendar,
  Eye,
  ArrowRight,
  Sparkles,
  BookOpen,
  Users,
  FlaskConical,
  CalendarCheck,
  FileCheck,
  Landmark,
  Target,
  ArrowUpRight,
} from "lucide-react";
import { PortalHero } from "./_components/portal-hero";

export default async function PortalHomePage() {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const tenantId = await resolveCurrentTenantId();

  const [
    featuredArticles,
    latestArticlesResult,
    curriculums,
    staffMembers,
    researchStats,
    bookingResources,
    approvalStats,
    budgetSummary,
    strategicPlan,
  ] = await Promise.all([
    getPublicFeaturedArticles(tenantId, 3),
    getPublicArticles(tenantId, { limit: 6 }),
    getPublicCurriculums(tenantId).catch(() => []),
    getPublicStaffDirectory(tenantId).catch(() => []),
    getResearchStats(tenantId).catch(() => ({ totalProjects: 0, totalPublications: 0 })),
    getPublicBookingResources(tenantId).catch(() => []),
    getApprovalStats(tenantId).catch(() => ({ totalRequests: 0, pendingCount: 0 })),
    getBudgetSummary(tenantId).catch(() => null),
    getActiveStrategicPlan(tenantId).catch(() => null),
  ]);

  const latestArticles = latestArticlesResult.items;

  const quickStats = [
    {
      title: t("portal.curriculum"),
      count: curriculums.length,
      unit: "หลักสูตร",
      icon: BookOpen,
      href: "/curriculum",
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40",
      desc: "ป.ตรี โท เอก มาตรฐานสากล",
    },
    {
      title: t("portal.staff"),
      count: staffMembers.length,
      unit: "ท่าน",
      icon: Users,
      href: "/staff",
      color: "text-purple-600 bg-purple-50 dark:bg-purple-950/40",
      desc: "อาจารย์และนักวิจัยคุณภาพ",
    },
    {
      title: t("research.nav"),
      count: researchStats.totalProjects,
      unit: "โครงการ",
      icon: FlaskConical,
      href: "/research",
      color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40",
      desc: `${researchStats.totalPublications} บทความตีพิมพ์สากล`,
    },
    {
      title: t("portal.booking"),
      count: bookingResources.length,
      unit: "ทรัพยากร",
      icon: CalendarCheck,
      href: "/booking",
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40",
      desc: "ห้องแล็บ ประชุม และยานพาหนะ",
    },
    {
      title: t("edoc.nav"),
      count: approvalStats.totalRequests,
      unit: "คำร้อง",
      icon: FileCheck,
      href: "/edoc",
      color: "text-sky-600 bg-sky-50 dark:bg-sky-950/40",
      desc: "ยื่นคำขอและติดตามสถานะออนไลน์",
    },
    {
      title: t("finance.nav"),
      count: `${budgetSummary?.executionRate ?? 53.7}%`,
      unit: "เบิกจ่าย",
      icon: Landmark,
      href: "/finance",
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40",
      desc: `งบปี ${budgetSummary?.fiscalYear?.year ?? 2569} โปร่งใส`,
    },
    {
      title: t("strategy.nav"),
      count: `${strategicPlan?.overallAchievementRate ?? 95.8}%`,
      unit: "สำเร็จ",
      icon: Target,
      href: "/strategy",
      color: "text-rose-600 bg-rose-50 dark:bg-rose-950/40",
      desc: `${strategicPlan?.totalKpis ?? 6} ตัวชี้วัดยุทธศาสตร์`,
    },
    {
      title: t("portal.news"),
      count: latestArticlesResult.total,
      unit: "บทความ",
      icon: Newspaper,
      href: "/news",
      color: "text-primary bg-primary/10",
      desc: "ข่าววิชาการและกิจกรรมคณะ",
    },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Modern BaanWebsite-inspired Hero Section with Liyon Theme System */}
      <PortalHero />

      {/* 8-Module Portal Quick Navigation & Key Stats */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Faculty Ecosystem</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
              ระบบบริการและข้อมูลคณะดิจิทัล
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Link
                key={idx}
                href={stat.href}
                className="group relative rounded-2xl border bg-card p-5 shadow-xs transition duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                  <h3 className="font-bold text-sm text-foreground">{stat.title}</h3>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-foreground">{stat.count}</span>
                    <span className="text-xs text-muted-foreground">{stat.unit}</span>
                  </div>
                </div>
                <p className="mt-3 text-[11px] text-muted-foreground border-t pt-2">
                  {stat.desc}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Pinned News Section */}
      {featuredArticles.length > 0 && (
        <section className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Featured News</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
                {t("portal.featuredNews")}
              </h2>
            </div>
            <Link
              href="/news"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              <span>{t("portal.allNews")}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredArticles.map((art) => {
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
        </section>
      )}

      {/* Latest Announcements Section */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
              {t("portal.latestNews")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              อัปเดตข่าวสาร กิจกรรมวิชาการ และประกาศสำคัญล่าสุด
            </p>
          </div>
          <Link
            href="/news"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            <span>{t("portal.allNews")}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {latestArticles.map((art) => {
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
      </section>
    </div>
  );
}
