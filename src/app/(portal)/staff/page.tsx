import Link from "next/link";
import { getT } from "@/i18n/server";
import { getLocale } from "@/shared/lib/i18n/server";
import {
  getPublicDepartments,
  getPublicExecutiveBoard,
  getPublicStaffDirectory,
  resolveCurrentTenantId,
} from "@/features/staff/server";
import {
  Users,
  Search,
  Mail,
  Phone,
  Building2,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default async function StaffDirectoryPage(props: {
  searchParams: Promise<{ dept?: string; q?: string }>;
}) {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const searchParams = await props.searchParams;
  const deptId = searchParams.dept;
  const search = searchParams.q;

  const tenantId = await resolveCurrentTenantId();

  const [departments, executives, staffMembers] = await Promise.all([
    getPublicDepartments(tenantId),
    !deptId && !search ? getPublicExecutiveBoard(tenantId) : Promise.resolve([]),
    getPublicStaffDirectory(tenantId, {
      departmentId: deptId,
      search,
    }),
  ]);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-10 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
          <GraduationCap className="h-4 w-4" />
          <span>{t("staff.title")}</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          {t("staff.title")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          {t("staff.subtitle")}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Department Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/staff"
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              !deptId
                ? "bg-primary text-primary-foreground shadow-xs"
                : "border bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            {t("portal.allDepartments")}
          </Link>
          {departments.map((dept) => {
            const deptName = locale === "en" ? dept.nameEn : dept.nameTh;
            const active = deptId === dept.id;
            return (
              <Link
                key={dept.id}
                href={`/staff?dept=${dept.id}${search ? `&q=${encodeURIComponent(search)}` : ""}`}
                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "border bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                <span>{deptName}</span>
                {dept.staffCount !== undefined && dept.staffCount > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                      active
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {dept.staffCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Search Input Form */}
        <form method="GET" action="/staff" className="relative w-full sm:w-80">
          {deptId && <input type="hidden" name="dept" value={deptId} />}
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            name="q"
            defaultValue={search ?? ""}
            placeholder={t("portal.searchStaff")}
            className="h-9 w-full rounded-xl border bg-background pl-9 pr-4 text-xs shadow-xs focus:outline-hidden focus:ring-2 focus:ring-primary"
          />
        </form>
      </div>

      {/* Executive Board Section (Displayed only on initial all-view) */}
      {executives.length > 0 && (
        <section className="mb-14">
          <div className="mb-6 flex items-center gap-2 border-b pb-3">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold tracking-tight">
              {t("staff.executiveBoard")}
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {executives.map((exec) => {
              const fullName = locale === "en" ? exec.fullNameEn : exec.fullNameTh;
              const mgmtPos =
                locale === "en"
                  ? exec.managementPositionEn ?? exec.managementPositionTh
                  : exec.managementPositionTh ?? exec.managementPositionEn;
              const deptName =
                locale === "en" ? exec.departmentNameEn : exec.departmentNameTh;

              return (
                <div
                  key={exec.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border bg-gradient-to-b from-card to-card/50 p-6 shadow-xs transition hover:border-primary/40 hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border bg-muted shadow-xs">
                      {exec.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={exec.avatarUrl}
                          alt={fullName}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                          <Users className="h-8 w-8" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="inline-flex rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary mb-1">
                        {t(`staff.pos.${exec.academicPosition}`)}
                      </div>
                      <h3 className="truncate text-base font-bold text-foreground">
                        {fullName}
                      </h3>
                      {mgmtPos && (
                        <p className="mt-1 line-clamp-2 text-xs font-semibold text-primary">
                          {mgmtPos}
                        </p>
                      )}
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                        {deptName}
                      </p>
                    </div>
                  </div>

                  {/* Contact Snippet */}
                  <div className="mt-4 space-y-1 border-t pt-3 text-xs text-muted-foreground">
                    {exec.email && (
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                        <span className="truncate">{exec.email}</span>
                      </div>
                    )}
                    {exec.phoneExt && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                        <span>ต่อ {exec.phoneExt}</span>
                      </div>
                    )}
                  </div>

                  {/* View Details Link */}
                  <div className="mt-4 pt-2">
                    <Link
                      href={`/staff/${exec.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:underline"
                    >
                      <span>{t("portal.viewProfile")}</span>
                      <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Main Staff Directory Section */}
      <section>
        <div className="mb-6 flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold tracking-tight">
              {deptId
                ? departments.find((d) => d.id === deptId)
                  ? locale === "en"
                    ? departments.find((d) => d.id === deptId)?.nameEn
                    : departments.find((d) => d.id === deptId)?.nameTh
                  : t("staff.academicStaff")
                : t("staff.academicStaff")}
            </h2>
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {staffMembers.length} ท่าน
          </span>
        </div>

        {staffMembers.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-4 text-base font-semibold">{t("staff.empty")}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              ลองปรับเปลี่ยนคำค้นหา หรือเลือกสังกัดอื่น
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {staffMembers.map((staff) => {
              const fullName = locale === "en" ? staff.fullNameEn : staff.fullNameTh;
              const mgmtPos =
                locale === "en"
                  ? staff.managementPositionEn ?? staff.managementPositionTh
                  : staff.managementPositionTh ?? staff.managementPositionEn;
              const deptName =
                locale === "en" ? staff.departmentNameEn : staff.departmentNameTh;

              return (
                <div
                  key={staff.id}
                  className="group flex flex-col rounded-xl border bg-card text-card-foreground shadow-xs transition hover:border-primary/40 hover:shadow-md"
                >
                  <div className="p-5 flex flex-col flex-1">
                    {/* Top row: Avatar & Position Badge */}
                    <div className="flex items-start gap-3.5 mb-3">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border bg-muted shadow-2xs">
                        {staff.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={staff.avatarUrl}
                            alt={fullName}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                            <Users className="h-7 w-7" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <span className="inline-block rounded-md bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground mb-1">
                          {t(`staff.pos.${staff.academicPosition}`)}
                        </span>
                        <h4 className="line-clamp-1 text-sm font-bold text-foreground">
                          {fullName}
                        </h4>
                        {mgmtPos && (
                          <p className="line-clamp-1 text-xs font-semibold text-primary mt-0.5">
                            {mgmtPos}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Department */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                      <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                      <span className="truncate">{deptName}</span>
                    </div>

                    {/* Expertise badges */}
                    {staff.expertise && staff.expertise.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-1">
                        {staff.expertise.slice(0, 3).map((exp, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 rounded-md bg-muted/70 px-2 py-0.5 text-[10px] text-muted-foreground"
                          >
                            <Sparkles className="h-2.5 w-2.5 text-primary" />
                            <span>{exp}</span>
                          </span>
                        ))}
                        {staff.expertise.length > 3 && (
                          <span className="rounded-md bg-muted/40 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                            +{staff.expertise.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Spacer */}
                    <div className="mt-auto pt-3 border-t flex items-center justify-between">
                      {staff.email ? (
                        <a
                          href={`mailto:${staff.email}`}
                          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition truncate max-w-[140px]"
                          title={staff.email}
                        >
                          <Mail className="h-3 w-3 shrink-0" />
                          <span className="truncate">{staff.email}</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-muted-foreground/50">
                          -
                        </span>
                      )}

                      <Link
                        href={`/staff/${staff.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline ml-2 shrink-0"
                      >
                        <span>{t("portal.viewProfile")}</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
