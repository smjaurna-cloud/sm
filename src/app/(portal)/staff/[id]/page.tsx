import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getT } from "@/i18n/server";
import { getLocale } from "@/shared/lib/i18n/server";
import {
  getPublicStaffProfileById,
  resolveCurrentTenantId,
} from "@/features/staff/server";
import {
  Users,
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  GraduationCap,
  Sparkles,
  MapPin,
  Award,
  ShieldCheck,
} from "lucide-react";

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await props.params;
  const locale = await getLocale();
  const tenantId = await resolveCurrentTenantId();
  const profile = await getPublicStaffProfileById(tenantId, id);

  if (!profile) {
    return { title: "Staff Not Found | Faculty Directory" };
  }

  const fullName = locale === "en" ? profile.fullNameEn : profile.fullNameTh;
  const titlePrefix = locale === "en" ? profile.titleEn : profile.titleTh;
  const title = `${titlePrefix ? `${titlePrefix} ` : ""}${fullName}`;
  const deptName =
    locale === "en" ? profile.departmentNameEn : profile.departmentNameTh;

  return {
    title: `${title} | Faculty Directory`,
    description: `${title} - ${deptName || "Faculty of Science & Technology"}`,
    openGraph: {
      title,
      description: `${title} - ${deptName || "Faculty"}`,
      images: profile.avatarUrl ? [profile.avatarUrl] : [],
    },
  };
}

export default async function StaffProfileDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const { id } = await props.params;
  const tenantId = await resolveCurrentTenantId();

  const profile = await getPublicStaffProfileById(tenantId, id);
  if (!profile) {
    notFound();
  }

  const fullName = locale === "en" ? profile.fullNameEn : profile.fullNameTh;
  const secondaryName = locale === "en" ? profile.fullNameTh : profile.fullNameEn;
  const mgmtPos =
    locale === "en"
      ? profile.managementPositionEn ?? profile.managementPositionTh
      : profile.managementPositionTh ?? profile.managementPositionEn;
  const deptName =
    locale === "en" ? profile.departmentNameEn : profile.departmentNameTh;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 sm:px-6">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/staff"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>{t("portal.backToStaff")}</span>
        </Link>
      </div>

      {/* Main Profile Header Card */}
      <div className="overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm">
        <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-muted" />

        <div className="relative px-6 pb-8 pt-0 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:gap-6">
            {/* Avatar */}
            <div className="-mt-16 relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl border-4 border-background bg-muted shadow-md">
              {profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatarUrl}
                  alt={fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                  <Users className="h-14 w-14" />
                </div>
              )}
            </div>

            {/* Main Identity */}
            <div className="mt-4 flex-1 sm:mt-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  <Award className="h-3.5 w-3.5" />
                  {t(`staff.pos.${profile.academicPosition}`)}
                </span>
                {profile.isExecutive && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {t("staff.executiveBoard")}
                  </span>
                )}
              </div>

              <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl text-foreground">
                {fullName}
              </h1>
              <p className="text-sm text-muted-foreground font-medium">
                {secondaryName}
              </p>

              {mgmtPos && (
                <p className="mt-2 text-sm font-semibold text-primary">
                  {mgmtPos}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Left 2 Cols: Education & Expertise */}
        <div className="space-y-8 lg:col-span-2">
          {/* Education Section */}
          <div className="rounded-2xl border bg-card p-6 shadow-xs">
            <div className="mb-6 flex items-center gap-2 border-b pb-3">
              <GraduationCap className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold tracking-tight">
                {t("portal.educationHistory")}
              </h2>
            </div>

            {profile.educationHistory && profile.educationHistory.length > 0 ? (
              <div className="relative space-y-6 pl-4 border-l-2 border-primary/20">
                {profile.educationHistory.map((edu, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full border-2 border-primary bg-background" />
                    <h3 className="text-sm font-bold text-foreground">
                      {edu.degree}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      สาขาวิชา: <span className="text-foreground/80">{edu.field}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      สถาบัน: <span className="text-foreground/80">{edu.institution}</span>
                      {edu.year && <span> ({edu.year})</span>}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                - ยังไม่มีข้อมูลประวัติการศึกษา -
              </p>
            )}
          </div>

          {/* Expertise Section */}
          <div className="rounded-2xl border bg-card p-6 shadow-xs">
            <div className="mb-6 flex items-center gap-2 border-b pb-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold tracking-tight">
                {t("portal.expertiseAreas")}
              </h2>
            </div>

            {profile.expertise && profile.expertise.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.expertise.map((exp, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 rounded-lg border bg-muted/40 px-3 py-1.5 text-xs font-medium text-foreground"
                  >
                    <Sparkles className="h-3 w-3 text-primary" />
                    <span>{exp}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                - ยังไม่มีข้อมูลความเชี่ยวชาญ -
              </p>
            )}
          </div>
        </div>

        {/* Right Col: Contact & Department Info */}
        <div className="space-y-6">
          <div className="rounded-2xl border bg-card p-6 shadow-xs">
            <div className="mb-4 flex items-center gap-2 border-b pb-3">
              <Building2 className="h-5 w-5 text-primary" />
              <h3 className="text-base font-bold tracking-tight">
                {t("portal.contactInfo")}
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="block text-muted-foreground font-medium mb-1">
                  {t("staff.department")}
                </span>
                <p className="font-semibold text-foreground">{deptName}</p>
                <span className="inline-block mt-1 rounded bg-secondary px-2 py-0.5 text-[10px] text-secondary-foreground font-mono">
                  {profile.departmentCode}
                </span>
              </div>

              {profile.email && (
                <div className="border-t pt-3">
                  <span className="block text-muted-foreground font-medium mb-1">
                    {t("staff.email")}
                  </span>
                  <a
                    href={`mailto:${profile.email}`}
                    className="flex items-center gap-2 text-primary font-medium hover:underline"
                  >
                    <Mail className="h-4 w-4 shrink-0" />
                    <span className="break-all">{profile.email}</span>
                  </a>
                </div>
              )}

              {profile.phoneExt && (
                <div className="border-t pt-3">
                  <span className="block text-muted-foreground font-medium mb-1">
                    {t("staff.phoneExt")}
                  </span>
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span>ต่อ {profile.phoneExt}</span>
                  </div>
                </div>
              )}

              {profile.roomNumber && (
                <div className="border-t pt-3">
                  <span className="block text-muted-foreground font-medium mb-1">
                    {t("staff.roomNumber")}
                  </span>
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span>ห้อง {profile.roomNumber}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
