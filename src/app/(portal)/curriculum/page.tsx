import Link from "next/link";
import { getT } from "@/i18n/server";
import { getLocale } from "@/shared/lib/i18n/server";
import {
  getPublicCurriculums,
  resolveCurrentTenantId,
} from "@/features/curriculum/server";
import { getPublicDepartments } from "@/features/staff/server";
import {
  BookOpen,
  Search,
  Clock,
  Award,
  Building2,
  ArrowRight,
  Banknote,
  Globe2,
} from "lucide-react";

export default async function CurriculumsCatalogPage(props: {
  searchParams: Promise<{ level?: string; dept?: string; q?: string }>;
}) {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const searchParams = await props.searchParams;
  const levelParam = searchParams.level || "ALL";
  const deptParam = searchParams.dept;
  const search = searchParams.q;

  const tenantId = await resolveCurrentTenantId();

  const [departments, curriculums] = await Promise.all([
    getPublicDepartments(tenantId),
    getPublicCurriculums(tenantId, {
      level: levelParam,
      departmentId: deptParam,
      search,
    }),
  ]);

  const levelTabs = [
    { key: "ALL", label: t("curriculum.level.ALL") },
    { key: "BACHELOR", label: t("curriculum.level.BACHELOR") },
    { key: "MASTER", label: t("curriculum.level.MASTER") },
    { key: "DOCTORAL", label: t("curriculum.level.DOCTORAL") },
    { key: "CERTIFICATE", label: t("curriculum.level.CERTIFICATE") },
  ];

  const getLevelBadgeClass = (lvl: string) => {
    switch (lvl) {
      case "BACHELOR":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900";
      case "MASTER":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900";
      case "DOCTORAL":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900";
      case "CERTIFICATE":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-10 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
          <BookOpen className="h-4 w-4" />
          <span>{t("curriculum.title")}</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          {t("curriculum.title")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          {t("curriculum.subtitle")} ({curriculums.length} หลักสูตร)
        </p>
      </div>

      {/* Degree Level Filter Tabs */}
      <div className="mb-6 flex flex-wrap items-center gap-2 border-b pb-4">
        {levelTabs.map((tab) => {
          const active = levelParam === tab.key;
          const queryParams = new URLSearchParams();
          if (tab.key !== "ALL") queryParams.set("level", tab.key);
          if (deptParam) queryParams.set("dept", deptParam);
          if (search) queryParams.set("q", search);
          const queryString = queryParams.toString();
          const href = `/curriculum${queryString ? `?${queryString}` : ""}`;

          return (
            <Link
              key={tab.key}
              href={href}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                active
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Sub Filter: Department & Search */}
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Department select filter */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/curriculum?${new URLSearchParams({
              ...(levelParam !== "ALL" ? { level: levelParam } : {}),
              ...(search ? { q: search } : {}),
            }).toString()}`}
            className={`rounded-full px-3.5 py-1 text-xs font-medium transition ${
              !deptParam
                ? "bg-secondary text-secondary-foreground font-semibold"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {t("portal.allDepartments")}
          </Link>
          {departments.map((dept) => {
            const deptName = locale === "en" ? dept.nameEn : dept.nameTh;
            const active = deptParam === dept.id;
            const q = new URLSearchParams();
            if (levelParam !== "ALL") q.set("level", levelParam);
            q.set("dept", dept.id);
            if (search) q.set("q", search);

            return (
              <Link
                key={dept.id}
                href={`/curriculum?${q.toString()}`}
                className={`rounded-full px-3.5 py-1 text-xs font-medium transition ${
                  active
                    ? "bg-secondary text-secondary-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {deptName}
              </Link>
            );
          })}
        </div>

        {/* Search Input Form */}
        <form method="GET" action="/curriculum" className="relative w-full sm:w-80">
          {levelParam !== "ALL" && <input type="hidden" name="level" value={levelParam} />}
          {deptParam && <input type="hidden" name="dept" value={deptParam} />}
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            name="q"
            defaultValue={search ?? ""}
            placeholder={t("portal.searchCurriculum")}
            className="h-9 w-full rounded-xl border bg-background pl-9 pr-4 text-xs shadow-xs focus:outline-hidden focus:ring-2 focus:ring-primary"
          />
        </form>
      </div>

      {/* Curriculums Grid */}
      {curriculums.length === 0 ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-4 text-base font-semibold">{t("curriculum.empty")}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            ลองปรับระดับการศึกษา หรือคำค้นหาใหม่อีกครั้ง
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {curriculums.map((c) => {
            const name = locale === "en" ? c.nameEn : c.nameTh;
            const degree = locale === "en" ? c.degreeEn : c.degreeTh;
            const deptName =
              locale === "en" ? c.departmentNameEn : c.departmentNameTh;
            const desc = locale === "en" ? c.descriptionEn : c.descriptionTh;

            return (
              <div
                key={c.id}
                className="group flex flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-xs transition hover:border-primary/40 hover:shadow-md"
              >
                {/* Cover Image */}
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                  {c.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.coverImageUrl}
                      alt={name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                      <BookOpen className="h-10 w-10 stroke-1" />
                    </div>
                  )}

                  {/* Level Badge Overlay */}
                  <div className="absolute left-3 top-3">
                    <span
                      className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[11px] font-bold shadow-xs backdrop-blur-md ${getLevelBadgeClass(
                        c.level
                      )}`}
                    >
                      {t(`curriculum.level.${c.level}`)}
                    </span>
                  </div>

                  <div className="absolute right-3 top-3">
                    <span className="rounded-md bg-background/80 px-2 py-0.5 text-[10px] font-mono font-bold text-foreground backdrop-blur-xs">
                      {c.code}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                    <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                    <span className="truncate">{deptName}</span>
                  </div>

                  <h3 className="line-clamp-2 text-base font-bold text-foreground group-hover:text-primary transition">
                    {name}
                  </h3>

                  <p className="mt-1 line-clamp-1 text-xs font-semibold text-primary">
                    {degree}
                  </p>

                  {desc && (
                    <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {desc}
                    </p>
                  )}

                  {/* Specs Pill Grid */}
                  <div className="mt-5 grid grid-cols-2 gap-2 border-y py-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5 truncate">
                      <Clock className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span>{c.durationYears} {t("portal.yearsFormat")}</span>
                    </div>

                    <div className="flex items-center gap-1.5 truncate">
                      <Award className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span>{c.totalCredits} {t("portal.creditsFormat")}</span>
                    </div>

                    {c.tuitionFeePerTerm && (
                      <div className="col-span-2 flex items-center gap-1.5 truncate text-[11px]">
                        <Banknote className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <span className="truncate">{c.tuitionFeePerTerm}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer link */}
                  <div className="mt-5 pt-1 flex items-center justify-between">
                    {c.language ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground truncate max-w-[150px]">
                        <Globe2 className="h-3 w-3 shrink-0" />
                        <span className="truncate">{c.language}</span>
                      </span>
                    ) : (
                      <span />
                    )}

                    <Link
                      href={`/curriculum/${c.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:underline ml-auto shrink-0"
                    >
                      <span>{t("portal.viewCurriculum")}</span>
                      <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
