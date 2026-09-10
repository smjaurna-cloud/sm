import Link from "next/link";
import { notFound } from "next/navigation";
import { getT } from "@/i18n/server";
import { getLocale } from "@/shared/lib/i18n/server";
import {
  getPublicCurriculumById,
  resolveCurrentTenantId,
} from "@/features/curriculum/server";
import {
  BookOpen,
  ArrowLeft,
  Clock,
  Award,
  Building2,
  Download,
  CheckCircle2,
  Sparkles,
  Banknote,
  Globe2,
  Briefcase,
  Layers,
} from "lucide-react";

export default async function CurriculumDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const { id } = await props.params;
  const tenantId = await resolveCurrentTenantId();

  const curriculum = await getPublicCurriculumById(tenantId, id);
  if (!curriculum) {
    notFound();
  }

  const name = locale === "en" ? curriculum.nameEn : curriculum.nameTh;
  const secondaryName = locale === "en" ? curriculum.nameTh : curriculum.nameEn;
  const degree = locale === "en" ? curriculum.degreeEn : curriculum.degreeTh;
  const secondaryDegree = locale === "en" ? curriculum.degreeTh : curriculum.degreeEn;
  const deptName =
    locale === "en" ? curriculum.departmentNameEn : curriculum.departmentNameTh;
  const description =
    locale === "en"
      ? curriculum.descriptionEn ?? curriculum.descriptionTh
      : curriculum.descriptionTh ?? curriculum.descriptionEn;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 sm:px-6">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/curriculum"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>{t("portal.backToCurriculums")}</span>
        </Link>
      </div>

      {/* Main Header / Banner Card */}
      <div className="overflow-hidden rounded-3xl border bg-card text-card-foreground shadow-sm">
        {curriculum.coverImageUrl ? (
          <div className="relative h-64 w-full sm:h-80">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={curriculum.coverImageUrl}
              alt={name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          </div>
        ) : (
          <div className="h-40 bg-gradient-to-r from-primary/20 via-primary/10 to-muted" />
        )}

        <div className="relative px-6 pb-8 pt-4 sm:px-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              <BookOpen className="h-3.5 w-3.5" />
              {t(`curriculum.level.${curriculum.level}`)}
            </span>
            <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-mono font-bold text-muted-foreground">
              {curriculum.code}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground ml-auto">
              <Building2 className="h-3.5 w-3.5" />
              <span>{deptName}</span>
            </span>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight sm:text-4xl text-foreground sm:leading-tight">
            {name}
          </h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            {secondaryName}
          </p>

          <div className="mt-4 rounded-xl bg-muted/30 p-4 border border-border/50">
            <span className="text-[11px] font-medium text-muted-foreground block mb-0.5">
              {t("curriculum.degreeTh")}
            </span>
            <p className="text-sm font-bold text-primary">
              {degree}
            </p>
            {secondaryDegree && secondaryDegree !== degree && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {secondaryDegree}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Key Highlights Grid */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border bg-card p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 text-primary text-xs font-semibold mb-2">
            <Clock className="h-4 w-4" />
            <span>{t("curriculum.durationYears")}</span>
          </div>
          <span className="text-xl font-bold text-foreground">
            {curriculum.durationYears} {t("portal.yearsFormat")}
          </span>
          <span className="text-[11px] text-muted-foreground mt-1">ตามแผนการศึกษา</span>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 text-primary text-xs font-semibold mb-2">
            <Award className="h-4 w-4" />
            <span>{t("curriculum.totalCredits")}</span>
          </div>
          <span className="text-xl font-bold text-foreground">
            {curriculum.totalCredits} {t("portal.creditsFormat")}
          </span>
          <span className="text-[11px] text-muted-foreground mt-1">ตลอดหลักสูตร</span>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 text-primary text-xs font-semibold mb-2">
            <Globe2 className="h-4 w-4" />
            <span>{t("curriculum.language")}</span>
          </div>
          <span className="text-sm font-bold text-foreground truncate">
            {curriculum.language ?? "ภาษาไทย"}
          </span>
          <span className="text-[11px] text-muted-foreground mt-1">การจัดการเรียนการสอน</span>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 text-primary text-xs font-semibold mb-2">
            <Banknote className="h-4 w-4" />
            <span>{t("curriculum.tuitionFee")}</span>
          </div>
          <span className="text-sm font-bold text-foreground truncate">
            {curriculum.tuitionFeePerTerm ?? "-"}
          </span>
          <span className="text-[11px] text-muted-foreground mt-1">ค่าธรรมเนียมการศึกษา</span>
        </div>
      </div>

      {/* Main Content & Sidebar */}
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Left 2 Cols: Description, Study Plan, Career */}
        <div className="space-y-8 lg:col-span-2">
          {/* Description Section */}
          {description && (
            <section className="rounded-2xl border bg-card p-6 shadow-xs">
              <div className="mb-4 flex items-center gap-2 border-b pb-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold tracking-tight">
                  จุดเด่นและสาระสำคัญของหลักสูตร
                </h2>
              </div>
              <div className="prose prose-neutral dark:prose-invert max-w-none text-sm leading-relaxed text-foreground/90">
                {description.split("\n").map((para, idx) => (
                  <p key={idx} className="my-2">
                    {para}
                  </p>
                ))}
              </div>
            </section>
          )}

          {/* Study Plan Structure Section */}
          {curriculum.studyPlanStructure && curriculum.studyPlanStructure.length > 0 && (
            <section className="rounded-2xl border bg-card p-6 shadow-xs">
              <div className="mb-6 flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold tracking-tight">
                    {t("portal.curriculumStructureTitle")}
                  </h2>
                </div>
                <span className="text-xs font-semibold text-primary">
                  รวม {curriculum.totalCredits} {t("portal.creditsFormat")}
                </span>
              </div>

              <div className="space-y-4">
                {curriculum.studyPlanStructure.map((group, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border bg-muted/20 p-4 transition hover:bg-muted/40"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-foreground">
                          {group.groupName}
                        </h4>
                        {group.description && (
                          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                            {group.description}
                          </p>
                        )}
                      </div>
                      <span className="inline-flex shrink-0 items-center rounded-lg bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                        {group.credits} {t("portal.creditsFormat")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Career Opportunities Section */}
          {curriculum.careerOpportunities && curriculum.careerOpportunities.length > 0 && (
            <section className="rounded-2xl border bg-card p-6 shadow-xs">
              <div className="mb-4 flex items-center gap-2 border-b pb-3">
                <Briefcase className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold tracking-tight">
                  {t("portal.careerOpportunitiesTitle")}
                </h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {curriculum.careerOpportunities.map((career, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 rounded-xl border bg-background p-3 text-xs font-medium text-foreground shadow-2xs"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                    <span>{career}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Col: Sidebar & Action */}
        <div className="space-y-6">
          {/* Download Brochure CTA Card */}
          {curriculum.brochureUrl && (
            <div className="rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-card p-6 shadow-xs">
              <div className="mb-3 flex items-center gap-2 text-primary font-bold text-sm">
                <Download className="h-5 w-5" />
                <span>{t("portal.downloadBrochure")}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                ดาวน์โหลดเอกสารหลักสูตรฉบับเต็ม (มคอ.2) แผนการเรียนรายภาค และโครงสร้างวิชา
              </p>
              <a
                href={curriculum.brochureUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-xs transition hover:bg-primary/90"
              >
                <Download className="h-4 w-4" />
                <span>ดาวน์โหลดเอกสาร (PDF)</span>
              </a>
            </div>
          )}

          {/* Department Contact Card */}
          <div className="rounded-2xl border bg-card p-6 shadow-xs text-xs space-y-4">
            <div className="flex items-center gap-2 border-b pb-3">
              <Building2 className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-bold">{deptName}</h3>
            </div>

            <div>
              <span className="text-muted-foreground block mb-1">สังกัดภาควิชา</span>
              <p className="font-semibold text-foreground">{deptName}</p>
              <span className="inline-block mt-1 font-mono text-[10px] bg-secondary px-2 py-0.5 rounded text-secondary-foreground">
                {curriculum.departmentCode}
              </span>
            </div>

            <div className="border-t pt-3">
              <span className="text-muted-foreground block mb-1">สอบถามข้อมูลเพิ่มเติม</span>
              <p className="text-muted-foreground leading-relaxed">
                สำนักงานคณบดี คณะเทคโนโลยีสารสนเทศฯ
                <br />
                โทร: 0-2000-0000 ต่อ 101-105
                <br />
                อีเมล: academic@faculty.ac.th
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
