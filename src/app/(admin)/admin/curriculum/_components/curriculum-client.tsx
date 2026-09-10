"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  AlertCircle,
  ExternalLink,
  Search,
  Building2,
  X,
  Layers,
} from "lucide-react";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { Button } from "@/components/ui/button";
import {
  DataTable,
  DataTableColumn,
  RowMenuItem,
  LiyonCard,
  StatusPill,
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonField,
  LiyonSwitchRow,
} from "@/shared/components/liyon";
import type { CurriculumDto, StudyPlanItem, DegreeLevel } from "@/features/curriculum";
import type { DepartmentDto } from "@/features/staff";
import {
  createCurriculumAction,
  updateCurriculumAction,
  deleteCurriculumAction,
} from "@/features/curriculum/actions";

export interface CurriculumAdminClientProps {
  initialCurriculums: CurriculumDto[];
  departments: DepartmentDto[];
  canManage: boolean;
}

export function CurriculumAdminClient({
  initialCurriculums,
  departments,
  canManage,
}: CurriculumAdminClientProps) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [curriculums, setCurriculums] = useState<CurriculumDto[]>(initialCurriculums);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [deptFilter, setDeptFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCurriculum, setEditingCurriculum] = useState<CurriculumDto | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<CurriculumDto | null>(null);

  // Form states
  const [formDeptId, setFormDeptId] = useState(departments[0]?.id ?? "");
  const [formCode, setFormCode] = useState("");
  const [formNameTh, setFormNameTh] = useState("");
  const [formNameEn, setFormNameEn] = useState("");
  const [formDegreeTh, setFormDegreeTh] = useState("");
  const [formDegreeEn, setFormDegreeEn] = useState("");
  const [formLevel, setFormLevel] = useState<DegreeLevel>("BACHELOR");
  const [formDurationYears, setFormDurationYears] = useState(4);
  const [formTotalCredits, setFormTotalCredits] = useState(128);
  const [formTuitionFee, setFormTuitionFee] = useState("");
  const [formLanguage, setFormLanguage] = useState("");
  const [formDescriptionTh, setFormDescriptionTh] = useState("");
  const [formDescriptionEn, setFormDescriptionEn] = useState("");
  const [formCareer, setFormCareer] = useState("");
  const [formCoverImageUrl, setFormCoverImageUrl] = useState("");
  const [formBrochureUrl, setFormBrochureUrl] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formOrderSeq, setFormOrderSeq] = useState(0);
  const [formStudyPlan, setFormStudyPlan] = useState<StudyPlanItem[]>([]);

  const openCreateDialog = () => {
    setEditingCurriculum(null);
    setFormDeptId(departments[0]?.id ?? "");
    setFormCode("");
    setFormNameTh("");
    setFormNameEn("");
    setFormDegreeTh("");
    setFormDegreeEn("");
    setFormLevel("BACHELOR");
    setFormDurationYears(4);
    setFormTotalCredits(128);
    setFormTuitionFee("");
    setFormLanguage("ภาษาไทย");
    setFormDescriptionTh("");
    setFormDescriptionEn("");
    setFormCareer("");
    setFormCoverImageUrl("");
    setFormBrochureUrl("");
    setFormIsActive(true);
    setFormOrderSeq(0);
    setFormStudyPlan([
      { groupName: "1. หมวดวิชาศึกษาทั่วไป", credits: 30, description: "การสื่อสารและทักษะดิจิทัล" },
      { groupName: "2. หมวดวิชาเฉพาะ", credits: 92, description: "วิชาแกนและวิชาเอกบังคับ" },
      { groupName: "3. หมวดวิชาเลือกเสรี", credits: 6, description: "วิชาเลือกเสรีตามความสนใจ" },
    ]);
    setDialogOpen(true);
  };

  const openEditDialog = (c: CurriculumDto) => {
    setEditingCurriculum(c);
    setFormDeptId(c.departmentId);
    setFormCode(c.code);
    setFormNameTh(c.nameTh);
    setFormNameEn(c.nameEn);
    setFormDegreeTh(c.degreeTh);
    setFormDegreeEn(c.degreeEn);
    setFormLevel(c.level);
    setFormDurationYears(c.durationYears);
    setFormTotalCredits(c.totalCredits);
    setFormTuitionFee(c.tuitionFeePerTerm ?? "");
    setFormLanguage(c.language ?? "");
    setFormDescriptionTh(c.descriptionTh ?? "");
    setFormDescriptionEn(c.descriptionEn ?? "");
    setFormCareer(c.careerOpportunities ? c.careerOpportunities.join(", ") : "");
    setFormCoverImageUrl(c.coverImageUrl ?? "");
    setFormBrochureUrl(c.brochureUrl ?? "");
    setFormIsActive(c.isActive);
    setFormOrderSeq(c.orderSeq);
    setFormStudyPlan(c.studyPlanStructure || []);
    setDialogOpen(true);
  };

  const addStudyPlanRow = () => {
    setFormStudyPlan((prev) => [
      ...prev,
      { groupName: "", credits: 0, description: "" },
    ]);
  };

  const removeStudyPlanRow = (index: number) => {
    setFormStudyPlan((prev) => prev.filter((_, i) => i !== index));
  };

  const updateStudyPlanRow = (
    index: number,
    field: keyof StudyPlanItem,
    value: string | number
  ) => {
    setFormStudyPlan((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSave = () => {
    if (!formCode.trim()) {
      toast.error("กรุณากรอกรหัสหลักสูตร");
      return;
    }
    if (!formNameTh.trim() || !formNameEn.trim()) {
      toast.error("กรุณากรอกชื่อหลักสูตรทั้งภาษาไทยและอังกฤษ");
      return;
    }
    if (!formDegreeTh.trim() || !formDegreeEn.trim()) {
      toast.error("กรุณากรอกชื่อปริญญาทั้งภาษาไทยและอังกฤษ");
      return;
    }

    const careerArray = formCareer
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const validStudyPlan = formStudyPlan.filter((p) => p.groupName.trim());

    startTransition(async () => {
      if (editingCurriculum) {
        const res = await updateCurriculumAction({
          id: editingCurriculum.id,
          departmentId: formDeptId,
          code: formCode,
          nameTh: formNameTh,
          nameEn: formNameEn,
          degreeTh: formDegreeTh,
          degreeEn: formDegreeEn,
          level: formLevel,
          durationYears: Number(formDurationYears) || 4,
          totalCredits: Number(formTotalCredits) || 120,
          tuitionFeePerTerm: formTuitionFee || null,
          language: formLanguage || null,
          descriptionTh: formDescriptionTh || null,
          descriptionEn: formDescriptionEn || null,
          careerOpportunities: careerArray,
          studyPlanStructure: validStudyPlan,
          coverImageUrl: formCoverImageUrl || null,
          brochureUrl: formBrochureUrl || null,
          isActive: formIsActive,
          orderSeq: Number(formOrderSeq) || 0,
        });

        if (!res.ok) {
          toast.error(res.error.message || "เกิดข้อผิดพลาดในการบันทึก");
          return;
        }

        toast.success(t("curriculum.updateSuccess"));
        setCurriculums((prev) =>
          prev.map((item) => (item.id === res.data.id ? res.data : item))
        );
      } else {
        const res = await createCurriculumAction({
          departmentId: formDeptId,
          code: formCode,
          nameTh: formNameTh,
          nameEn: formNameEn,
          degreeTh: formDegreeTh,
          degreeEn: formDegreeEn,
          level: formLevel,
          durationYears: Number(formDurationYears) || 4,
          totalCredits: Number(formTotalCredits) || 120,
          tuitionFeePerTerm: formTuitionFee || null,
          language: formLanguage || null,
          descriptionTh: formDescriptionTh || null,
          descriptionEn: formDescriptionEn || null,
          careerOpportunities: careerArray,
          studyPlanStructure: validStudyPlan,
          coverImageUrl: formCoverImageUrl || null,
          brochureUrl: formBrochureUrl || null,
          isActive: formIsActive,
          orderSeq: Number(formOrderSeq) || 0,
        });

        if (!res.ok) {
          toast.error(res.error.message || "เกิดข้อผิดพลาดในการสร้าง");
          return;
        }

        toast.success(t("curriculum.createSuccess"));
        setCurriculums((prev) => [res.data, ...prev]);
      }

      setDialogOpen(false);
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (!deleteConfirmItem) return;
    startTransition(async () => {
      const res = await deleteCurriculumAction(deleteConfirmItem.id);
      if (!res.ok) {
        toast.error(res.error.message || "เกิดข้อผิดพลาดในการลบ");
        return;
      }

      toast.success(t("curriculum.deleteSuccess"));
      setCurriculums((prev) => prev.filter((i) => i.id !== deleteConfirmItem.id));
      setDeleteConfirmItem(null);
      router.refresh();
    });
  };

  // Filtered rows
  const filteredCurriculums = curriculums.filter((item) => {
    if (levelFilter !== "ALL" && item.level !== levelFilter) return false;
    if (deptFilter !== "ALL" && item.departmentId !== deptFilter) return false;
    if (statusFilter === "ACTIVE" && !item.isActive) return false;
    if (statusFilter === "INACTIVE" && item.isActive) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchNameTh = item.nameTh.toLowerCase().includes(q);
      const matchNameEn = item.nameEn.toLowerCase().includes(q);
      const matchDegree = item.degreeTh.toLowerCase().includes(q);
      const matchCode = item.code.toLowerCase().includes(q);
      return matchNameTh || matchNameEn || matchDegree || matchCode;
    }
    return true;
  });

  const columns: DataTableColumn<CurriculumDto>[] = [
    {
      key: "code",
      header: t("curriculum.code"),
      render: (row) => (
        <div className="space-y-1">
          <span className="inline-block rounded bg-muted px-2 py-0.5 font-mono text-xs font-bold text-foreground">
            {row.code}
          </span>
          <div>
            <span className="inline-block rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              {t(`curriculum.level.${row.level}`)}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "name",
      header: t("curriculum.nameTh"),
      render: (row) => {
        const name = locale === "en" ? row.nameEn : row.nameTh;
        const degree = locale === "en" ? row.degreeEn : row.degreeTh;
        return (
          <div className="space-y-0.5">
            <div className="font-semibold text-xs line-clamp-1">{name}</div>
            <div className="text-[11px] text-primary font-medium line-clamp-1">{degree}</div>
          </div>
        );
      },
    },
    {
      key: "department",
      header: t("curriculum.department"),
      render: (row) => {
        const deptName = locale === "en" ? row.departmentNameEn : row.departmentNameTh;
        return (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Building2 className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{deptName}</span>
          </div>
        );
      },
    },
    {
      key: "specs",
      header: t("curriculum.totalCredits"),
      render: (row) => (
        <div className="text-xs space-y-0.5">
          <div className="font-semibold">{row.totalCredits} หน่วยกิต</div>
          <div className="text-[11px] text-muted-foreground">{row.durationYears} ปี</div>
        </div>
      ),
    },
    {
      key: "status",
      header: t("curriculum.isActive"),
      render: (row) => (
        <StatusPill tone={row.isActive ? "ok" : "warn"}>
          {row.isActive ? t("curriculum.status.active") : t("curriculum.status.inactive")}
        </StatusPill>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("curriculum.nav")}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("curriculum.subtitle")} ({filteredCurriculums.length} หลักสูตร)
          </p>
        </div>

        {canManage && (
          <Button onClick={openCreateDialog} className="gap-1.5 text-xs">
            <Plus className="h-4 w-4" />
            <span>{t("curriculum.create")}</span>
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder={t("portal.searchCurriculum")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border bg-background pl-8 pr-3 text-xs shadow-xs focus:outline-hidden"
          />
        </div>

        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="h-9 rounded-lg border bg-background px-3 text-xs shadow-xs focus:outline-hidden"
        >
          <option value="ALL">ระดับ: {t("curriculum.level.ALL")}</option>
          <option value="BACHELOR">{t("curriculum.level.BACHELOR")}</option>
          <option value="MASTER">{t("curriculum.level.MASTER")}</option>
          <option value="DOCTORAL">{t("curriculum.level.DOCTORAL")}</option>
          <option value="CERTIFICATE">{t("curriculum.level.CERTIFICATE")}</option>
        </select>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="h-9 rounded-lg border bg-background px-3 text-xs shadow-xs focus:outline-hidden"
        >
          <option value="ALL">ภาควิชา: ทั้งหมด</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {locale === "en" ? d.nameEn : d.nameTh}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-lg border bg-background px-3 text-xs shadow-xs focus:outline-hidden"
        >
          <option value="ALL">สถานะ: ทั้งหมด</option>
          <option value="ACTIVE">{t("curriculum.status.active")}</option>
          <option value="INACTIVE">{t("curriculum.status.inactive")}</option>
        </select>
      </div>

      {/* Main Table */}
      <LiyonCard>
        <DataTable<CurriculumDto>
          headHeading={<span>{t("curriculum.title")}</span>}
          state={filteredCurriculums.length === 0 ? "empty" : "data"}
          rows={filteredCurriculums}
          columns={columns}
          getRowId={(row) => row.id}
          renderRowMenu={
            canManage
              ? (row) => (
                  <>
                    <RowMenuItem
                      onSelect={() => window.open(`/curriculum/${row.id}`, "_blank")}
                      icon={<ExternalLink className="h-4 w-4" />}
                    >
                      ดูหน้าเว็บ
                    </RowMenuItem>
                    <RowMenuItem
                      onSelect={() => openEditDialog(row)}
                      icon={<Edit2 className="h-4 w-4" />}
                    >
                      {t("curriculum.edit")}
                    </RowMenuItem>
                    <RowMenuItem
                      onSelect={() => setDeleteConfirmItem(row)}
                      danger
                      icon={<Trash2 className="h-4 w-4" />}
                    >
                      {t("curriculum.delete")}
                    </RowMenuItem>
                  </>
                )
              : undefined
          }
          empty={{
            icon: <BookOpen className="h-10 w-10 text-muted-foreground/50" />,
            title: t("curriculum.empty"),
            description: t("curriculum.subtitle"),
          }}
          error={{
            icon: <AlertCircle className="h-10 w-10 text-destructive" />,
            title: t("common.error"),
          }}
        />
      </LiyonCard>

      {/* Create / Edit Dialog */}
      <LiyonDialog open={dialogOpen} onOpenChange={setDialogOpen} wide>
        <LiyonDialogHeader
          title={editingCurriculum ? t("curriculum.edit") : t("curriculum.create")}
          description={t("curriculum.subtitle")}
        />
        <LiyonDialogBody className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {/* Department, Level, Code */}
          <div className="grid gap-3 sm:grid-cols-3">
            <LiyonField label={t("curriculum.department")} htmlFor="formDeptId">
              <select
                id="formDeptId"
                value={formDeptId}
                onChange={(e) => setFormDeptId(e.target.value)}
                className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {locale === "en" ? d.nameEn : d.nameTh} ({d.code})
                  </option>
                ))}
              </select>
            </LiyonField>

            <LiyonField label={t("curriculum.level")} htmlFor="formLevel">
              <select
                id="formLevel"
                value={formLevel}
                onChange={(e) => setFormLevel(e.target.value as DegreeLevel)}
                className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
              >
                <option value="BACHELOR">{t("curriculum.level.BACHELOR")}</option>
                <option value="MASTER">{t("curriculum.level.MASTER")}</option>
                <option value="DOCTORAL">{t("curriculum.level.DOCTORAL")}</option>
                <option value="CERTIFICATE">{t("curriculum.level.CERTIFICATE")}</option>
              </select>
            </LiyonField>

            <LiyonField label={t("curriculum.code")} htmlFor="formCode" hint="เช่น CS-BSC-2565">
              <input
                id="formCode"
                type="text"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                placeholder="e.g. CS-BSC-2565"
                className="h-9 w-full rounded-lg border bg-background px-3 text-xs font-mono"
              />
            </LiyonField>
          </div>

          {/* Curriculum Name (Thai & English) */}
          <div className="grid gap-4 sm:grid-cols-2">
            <LiyonField label={t("curriculum.nameTh")} htmlFor="formNameTh">
              <input
                id="formNameTh"
                type="text"
                value={formNameTh}
                onChange={(e) => setFormNameTh(e.target.value)}
                placeholder="เช่น หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์"
                className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
              />
            </LiyonField>

            <LiyonField label={t("curriculum.nameEn")} htmlFor="formNameEn">
              <input
                id="formNameEn"
                type="text"
                value={formNameEn}
                onChange={(e) => setFormNameEn(e.target.value)}
                placeholder="e.g. Bachelor of Science Program in Computer Science"
                className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
              />
            </LiyonField>
          </div>

          {/* Degree Title (Thai & English) */}
          <div className="grid gap-4 sm:grid-cols-2">
            <LiyonField label={t("curriculum.degreeTh")} htmlFor="formDegreeTh">
              <input
                id="formDegreeTh"
                type="text"
                value={formDegreeTh}
                onChange={(e) => setFormDegreeTh(e.target.value)}
                placeholder="เช่น วิทยาศาสตรบัณฑิต (วิทยาการคอมพิวเตอร์) / วท.บ."
                className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
              />
            </LiyonField>

            <LiyonField label={t("curriculum.degreeEn")} htmlFor="formDegreeEn">
              <input
                id="formDegreeEn"
                type="text"
                value={formDegreeEn}
                onChange={(e) => setFormDegreeEn(e.target.value)}
                placeholder="e.g. Bachelor of Science (Computer Science) / B.S."
                className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
              />
            </LiyonField>
          </div>

          {/* Duration, Credits, Tuition Fee, Language */}
          <div className="grid gap-3 sm:grid-cols-4">
            <LiyonField label={t("curriculum.durationYears")} htmlFor="formDurationYears">
              <input
                id="formDurationYears"
                type="number"
                value={formDurationYears}
                onChange={(e) => setFormDurationYears(parseInt(e.target.value, 10) || 1)}
                className="h-9 w-full rounded-lg border bg-background px-3 text-xs font-mono"
              />
            </LiyonField>

            <LiyonField label={t("curriculum.totalCredits")} htmlFor="formTotalCredits">
              <input
                id="formTotalCredits"
                type="number"
                value={formTotalCredits}
                onChange={(e) => setFormTotalCredits(parseInt(e.target.value, 10) || 1)}
                className="h-9 w-full rounded-lg border bg-background px-3 text-xs font-mono"
              />
            </LiyonField>

            <LiyonField label={t("curriculum.tuitionFee")} htmlFor="formTuitionFee">
              <input
                id="formTuitionFee"
                type="text"
                value={formTuitionFee}
                onChange={(e) => setFormTuitionFee(e.target.value)}
                placeholder="เช่น 26,000 บาท/ภาคการศึกษา"
                className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
              />
            </LiyonField>

            <LiyonField label={t("curriculum.language")} htmlFor="formLanguage">
              <input
                id="formLanguage"
                type="text"
                value={formLanguage}
                onChange={(e) => setFormLanguage(e.target.value)}
                placeholder="เช่น ภาษาไทย / นานาชาติ"
                className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
              />
            </LiyonField>
          </div>

          {/* Description Thai & English */}
          <div className="grid gap-4 sm:grid-cols-2">
            <LiyonField label={t("curriculum.descriptionTh")} htmlFor="formDescriptionTh">
              <textarea
                id="formDescriptionTh"
                rows={3}
                value={formDescriptionTh}
                onChange={(e) => setFormDescriptionTh(e.target.value)}
                placeholder="รายละเอียดและจุดเด่นหลักสูตรภาษาไทย"
                className="w-full rounded-lg border bg-background p-2.5 text-xs"
              />
            </LiyonField>

            <LiyonField label={t("curriculum.descriptionEn")} htmlFor="formDescriptionEn">
              <textarea
                id="formDescriptionEn"
                rows={3}
                value={formDescriptionEn}
                onChange={(e) => setFormDescriptionEn(e.target.value)}
                placeholder="Program highlights and description in English"
                className="w-full rounded-lg border bg-background p-2.5 text-xs"
              />
            </LiyonField>
          </div>

          {/* Career Opportunities */}
          <LiyonField label={t("curriculum.careerOpportunities")} htmlFor="formCareer" hint="คั่นแต่ละอาชีพด้วยเครื่องหมายจุลภาค (,)">
            <input
              id="formCareer"
              type="text"
              value={formCareer}
              onChange={(e) => setFormCareer(e.target.value)}
              placeholder="เช่น Software Engineer, AI Engineer, Cloud Architect"
              className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
            />
          </LiyonField>

          {/* Study Plan Breakdown Section */}
          <div className="rounded-xl border p-4 bg-muted/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                <Layers className="h-4 w-4 text-primary" />
                <span>{t("curriculum.studyPlan")}</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addStudyPlanRow}
                className="h-7 gap-1 text-[11px]"
              >
                <Plus className="h-3 w-3" />
                <span>เพิ่มหมวดวิชา</span>
              </Button>
            </div>

            {formStudyPlan.length === 0 ? (
              <p className="text-[11px] text-muted-foreground italic">
                ยังไม่มีข้อมูลหมวดวิชา (คลิกเพิ่มหมวดวิชาเพื่อระบุ)
              </p>
            ) : (
              <div className="space-y-2">
                {formStudyPlan.map((plan, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-2 items-center rounded-lg border bg-background p-2 text-xs"
                  >
                    <div className="col-span-5">
                      <input
                        type="text"
                        placeholder="ชื่อหมวดวิชา เช่น หมวดวิชาเฉพาะ"
                        value={plan.groupName}
                        onChange={(e) => updateStudyPlanRow(idx, "groupName", e.target.value)}
                        className="h-7 w-full rounded border bg-background px-2 text-[11px]"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        placeholder="หน่วยกิต"
                        value={plan.credits}
                        onChange={(e) =>
                          updateStudyPlanRow(idx, "credits", parseInt(e.target.value, 10) || 0)
                        }
                        className="h-7 w-full rounded border bg-background px-2 text-[11px] font-mono"
                      />
                    </div>
                    <div className="col-span-4">
                      <input
                        type="text"
                        placeholder="คำอธิบายรายวิชาเด่นย่อ"
                        value={plan.description ?? ""}
                        onChange={(e) => updateStudyPlanRow(idx, "description", e.target.value)}
                        className="h-7 w-full rounded border bg-background px-2 text-[11px]"
                      />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button
                        type="button"
                        onClick={() => removeStudyPlanRow(idx)}
                        className="text-muted-foreground hover:text-destructive transition p-1"
                        title="ลบแถวนี้"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cover & Brochure URLs */}
          <div className="grid gap-4 sm:grid-cols-2">
            <LiyonField label={t("curriculum.coverImage")} htmlFor="formCoverImageUrl">
              <input
                id="formCoverImageUrl"
                type="url"
                value={formCoverImageUrl}
                onChange={(e) => setFormCoverImageUrl(e.target.value)}
                placeholder="https://..."
                className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
              />
            </LiyonField>

            <LiyonField label={t("curriculum.brochureUrl")} htmlFor="formBrochureUrl">
              <input
                id="formBrochureUrl"
                type="url"
                value={formBrochureUrl}
                onChange={(e) => setFormBrochureUrl(e.target.value)}
                placeholder="https://.../curriculum-spec.pdf"
                className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
              />
            </LiyonField>
          </div>

          {/* Active status & Display Order */}
          <div className="grid gap-4 sm:grid-cols-2 items-center">
            <LiyonSwitchRow
              id="formIsActive"
              checked={formIsActive}
              onCheckedChange={setFormIsActive}
              label={t("curriculum.isActive")}
              description="เปิดรับสมัครและแสดงในหน้ารวมหลักสูตร"
            />

            <LiyonField label={t("curriculum.orderSeq")} htmlFor="formOrderSeq">
              <input
                id="formOrderSeq"
                type="number"
                value={formOrderSeq}
                onChange={(e) => setFormOrderSeq(parseInt(e.target.value, 10) || 0)}
                className="h-9 w-full rounded-lg border bg-background px-3 text-xs font-mono"
              />
            </LiyonField>
          </div>
        </LiyonDialogBody>

        <LiyonDialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setDialogOpen(false)}
            disabled={isPending}
            className="text-xs"
          >
            {t("curriculum.cancel")}
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="text-xs"
          >
            {isPending ? "กำลังบันทึก..." : t("curriculum.save")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* Delete Confirmation Dialog */}
      <LiyonDialog
        open={!!deleteConfirmItem}
        onOpenChange={(open) => !open && setDeleteConfirmItem(null)}
        danger
      >
        <LiyonDialogHeader
          title={t("curriculum.delete")}
          description={t("curriculum.deleteConfirm")}
        />
        <LiyonDialogBody>
          <p className="text-xs text-muted-foreground">
            คุณกำลังจะลบหลักสูตร:{" "}
            <span className="font-bold text-foreground">
              {locale === "en"
                ? deleteConfirmItem?.nameEn
                : deleteConfirmItem?.nameTh}
            </span>{" "}
            ({deleteConfirmItem?.code}) การดำเนินการนี้ไม่สามารถย้อนกลับได้
          </p>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setDeleteConfirmItem(null)}
            disabled={isPending}
            className="text-xs"
          >
            {t("curriculum.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
            className="text-xs"
          >
            {isPending ? "กำลังลบ..." : t("curriculum.delete")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}
