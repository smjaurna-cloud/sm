"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  Edit2,
  Trash2,
  Users,
  AlertCircle,
  ExternalLink,
  Search,
  Building2,
  GraduationCap,
  X,
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
import type { StaffProfileDto, DepartmentDto } from "@/features/staff";
import {
  createStaffAction,
  updateStaffAction,
  deleteStaffAction,
} from "@/features/staff/actions";

export interface StaffAdminClientProps {
  initialStaff: StaffProfileDto[];
  departments: DepartmentDto[];
  canManage: boolean;
}

interface EducationFormItem {
  degree: string;
  field: string;
  institution: string;
  year?: string;
}

export function StaffAdminClient({
  initialStaff,
  departments,
  canManage,
}: StaffAdminClientProps) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [staffList, setStaffList] = useState<StaffProfileDto[]>(initialStaff);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [executiveFilter, setExecutiveFilter] = useState<string>("ALL");

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffProfileDto | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<StaffProfileDto | null>(null);

  // Form states
  const [formDeptId, setFormDeptId] = useState(departments[0]?.id ?? "");
  const [formTitleTh, setFormTitleTh] = useState("");
  const [formTitleEn, setFormTitleEn] = useState("");
  const [formFirstNameTh, setFormFirstNameTh] = useState("");
  const [formLastNameTh, setFormLastNameTh] = useState("");
  const [formFirstNameEn, setFormFirstNameEn] = useState("");
  const [formLastNameEn, setFormLastNameEn] = useState("");
  const [formAcademicPosition, setFormAcademicPosition] = useState<string>("LECTURER");
  const [formManagementPositionTh, setFormManagementPositionTh] = useState("");
  const [formManagementPositionEn, setFormManagementPositionEn] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhoneExt, setFormPhoneExt] = useState("");
  const [formRoomNumber, setFormRoomNumber] = useState("");
  const [formAvatarUrl, setFormAvatarUrl] = useState("");
  const [formExpertise, setFormExpertise] = useState("");
  const [formIsExecutive, setFormIsExecutive] = useState(false);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formOrderSeq, setFormOrderSeq] = useState(0);
  const [formEducation, setFormEducation] = useState<EducationFormItem[]>([]);

  const openCreateDialog = () => {
    setEditingStaff(null);
    setFormDeptId(departments[0]?.id ?? "");
    setFormTitleTh("");
    setFormTitleEn("");
    setFormFirstNameTh("");
    setFormLastNameTh("");
    setFormFirstNameEn("");
    setFormLastNameEn("");
    setFormAcademicPosition("LECTURER");
    setFormManagementPositionTh("");
    setFormManagementPositionEn("");
    setFormEmail("");
    setFormPhoneExt("");
    setFormRoomNumber("");
    setFormAvatarUrl("");
    setFormExpertise("");
    setFormIsExecutive(false);
    setFormIsActive(true);
    setFormOrderSeq(0);
    setFormEducation([]);
    setDialogOpen(true);
  };

  const openEditDialog = (staff: StaffProfileDto) => {
    setEditingStaff(staff);
    setFormDeptId(staff.departmentId);
    setFormTitleTh(staff.titleTh);
    setFormTitleEn(staff.titleEn);
    setFormFirstNameTh(staff.firstNameTh);
    setFormLastNameTh(staff.lastNameTh);
    setFormFirstNameEn(staff.firstNameEn);
    setFormLastNameEn(staff.lastNameEn);
    setFormAcademicPosition(staff.academicPosition);
    setFormManagementPositionTh(staff.managementPositionTh ?? "");
    setFormManagementPositionEn(staff.managementPositionEn ?? "");
    setFormEmail(staff.email ?? "");
    setFormPhoneExt(staff.phoneExt ?? "");
    setFormRoomNumber(staff.roomNumber ?? "");
    setFormAvatarUrl(staff.avatarUrl ?? "");
    setFormExpertise(staff.expertise ? staff.expertise.join(", ") : "");
    setFormIsExecutive(staff.isExecutive);
    setFormIsActive(staff.isActive);
    setFormOrderSeq(staff.orderSeq);
    setFormEducation(staff.educationHistory || []);
    setDialogOpen(true);
  };

  const addEducationRow = () => {
    setFormEducation((prev) => [
      ...prev,
      { degree: "", field: "", institution: "", year: "" },
    ]);
  };

  const removeEducationRow = (index: number) => {
    setFormEducation((prev) => prev.filter((_, i) => i !== index));
  };

  const updateEducationRow = (
    index: number,
    field: keyof EducationFormItem,
    value: string
  ) => {
    setFormEducation((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSave = () => {
    if (!formTitleTh || !formFirstNameTh || !formLastNameTh) {
      toast.error("กรุณากรอกคำนำหน้า ชื่อ และนามสกุล (ภาษาไทย)");
      return;
    }
    if (!formTitleEn || !formFirstNameEn || !formLastNameEn) {
      toast.error("กรุณากรอกคำนำหน้า ชื่อ และนามสกุล (ภาษาอังกฤษ)");
      return;
    }

    const expertiseArray = formExpertise
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const validEducation = formEducation.filter(
      (e) => e.degree && e.field && e.institution
    );

    startTransition(async () => {
      if (editingStaff) {
        const res = await updateStaffAction({
          id: editingStaff.id,
          departmentId: formDeptId,
          titleTh: formTitleTh,
          titleEn: formTitleEn,
          firstNameTh: formFirstNameTh,
          lastNameTh: formLastNameTh,
          firstNameEn: formFirstNameEn,
          lastNameEn: formLastNameEn,
          academicPosition: formAcademicPosition,
          managementPositionTh: formManagementPositionTh || null,
          managementPositionEn: formManagementPositionEn || null,
          email: formEmail || null,
          phoneExt: formPhoneExt || null,
          roomNumber: formRoomNumber || null,
          avatarUrl: formAvatarUrl || null,
          expertise: expertiseArray,
          educationHistory: validEducation,
          isExecutive: formIsExecutive,
          isActive: formIsActive,
          orderSeq: Number(formOrderSeq) || 0,
        });

        if (!res.ok) {
          toast.error(res.error.message || "เกิดข้อผิดพลาดในการบันทึก");
          return;
        }

        toast.success(t("staff.updateSuccess"));
        setStaffList((prev) =>
          prev.map((item) => (item.id === res.data.id ? res.data : item))
        );
      } else {
        const res = await createStaffAction({
          departmentId: formDeptId,
          titleTh: formTitleTh,
          titleEn: formTitleEn,
          firstNameTh: formFirstNameTh,
          lastNameTh: formLastNameTh,
          firstNameEn: formFirstNameEn,
          lastNameEn: formLastNameEn,
          academicPosition: formAcademicPosition,
          managementPositionTh: formManagementPositionTh || null,
          managementPositionEn: formManagementPositionEn || null,
          email: formEmail || null,
          phoneExt: formPhoneExt || null,
          roomNumber: formRoomNumber || null,
          avatarUrl: formAvatarUrl || null,
          expertise: expertiseArray,
          educationHistory: validEducation,
          isExecutive: formIsExecutive,
          isActive: formIsActive,
          orderSeq: Number(formOrderSeq) || 0,
        });

        if (!res.ok) {
          toast.error(res.error.message || "เกิดข้อผิดพลาดในการสร้าง");
          return;
        }

        toast.success(t("staff.createSuccess"));
        setStaffList((prev) => [res.data, ...prev]);
      }

      setDialogOpen(false);
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (!deleteConfirmItem) return;
    startTransition(async () => {
      const res = await deleteStaffAction(deleteConfirmItem.id);
      if (!res.ok) {
        toast.error(res.error.message || "เกิดข้อผิดพลาดในการลบ");
        return;
      }

      toast.success(t("staff.deleteSuccess"));
      setStaffList((prev) => prev.filter((i) => i.id !== deleteConfirmItem.id));
      setDeleteConfirmItem(null);
      router.refresh();
    });
  };

  // Filter staff list
  const filteredStaff = staffList.filter((item) => {
    if (deptFilter !== "ALL" && item.departmentId !== deptFilter) return false;
    if (statusFilter === "ACTIVE" && !item.isActive) return false;
    if (statusFilter === "INACTIVE" && item.isActive) return false;
    if (executiveFilter === "EXECUTIVE" && !item.isExecutive) return false;
    if (executiveFilter === "NON_EXECUTIVE" && item.isExecutive) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTh = item.fullNameTh.toLowerCase().includes(q);
      const matchEn = item.fullNameEn.toLowerCase().includes(q);
      const matchEmail = item.email?.toLowerCase().includes(q);
      return matchTh || matchEn || matchEmail;
    }
    return true;
  });

  // Table columns definition
  const columns: DataTableColumn<StaffProfileDto>[] = [
    {
      key: "name",
      header: t("staff.nameTh"),
      render: (row) => {
        const name = locale === "en" ? row.fullNameEn : row.fullNameTh;
        return (
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border bg-muted">
              {row.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={row.avatarUrl}
                  alt={name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                  <Users className="h-5 w-5" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <span className="block truncate font-semibold text-foreground text-xs">
                {name}
              </span>
              <span className="block truncate text-[11px] text-muted-foreground">
                {row.email ?? "-"}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "department",
      header: t("staff.department"),
      render: (row) => {
        const deptName = locale === "en" ? row.departmentNameEn : row.departmentNameTh;
        return (
          <div className="flex items-center gap-1.5 text-xs">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="truncate">{deptName}</span>
          </div>
        );
      },
    },
    {
      key: "academicPosition",
      header: t("staff.academicPosition"),
      render: (row) => (
        <span className="inline-block rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
          {t(`staff.pos.${row.academicPosition}`)}
        </span>
      ),
    },
    {
      key: "managementPosition",
      header: t("staff.managementPositionTh"),
      render: (row) => {
        const pos = locale === "en" ? row.managementPositionEn : row.managementPositionTh;
        return pos ? (
          <span className="text-xs font-medium text-primary line-clamp-1">{pos}</span>
        ) : (
          <span className="text-xs text-muted-foreground/40">-</span>
        );
      },
    },
    {
      key: "isExecutive",
      header: t("staff.executiveBoard"),
      render: (row) => (
        <StatusPill tone={row.isExecutive ? "ok" : "off"}>
          {row.isExecutive ? "ใช่" : "ไม่ใช่"}
        </StatusPill>
      ),
    },
    {
      key: "status",
      header: t("staff.isActive"),
      render: (row) => (
        <StatusPill tone={row.isActive ? "ok" : "warn"}>
          {row.isActive ? t("staff.status.active") : t("staff.status.inactive")}
        </StatusPill>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("staff.nav")}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("staff.subtitle")} ({filteredStaff.length} ท่าน)
          </p>
        </div>

        {canManage && (
          <Button onClick={openCreateDialog} className="gap-1.5 text-xs">
            <Plus className="h-4 w-4" />
            <span>{t("staff.create")}</span>
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder={t("portal.searchStaff")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border bg-background pl-8 pr-3 text-xs shadow-xs focus:outline-hidden"
          />
        </div>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="h-9 rounded-lg border bg-background px-3 text-xs shadow-xs focus:outline-hidden"
        >
          <option value="ALL">สังกัด: ทั้งหมด</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {locale === "en" ? d.nameEn : d.nameTh}
            </option>
          ))}
        </select>

        <select
          value={executiveFilter}
          onChange={(e) => setExecutiveFilter(e.target.value)}
          className="h-9 rounded-lg border bg-background px-3 text-xs shadow-xs focus:outline-hidden"
        >
          <option value="ALL">คณะผู้บริหาร: ทั้งหมด</option>
          <option value="EXECUTIVE">เฉพาะผู้บริหาร</option>
          <option value="NON_EXECUTIVE">ไม่ใช่ผู้บริหาร</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-lg border bg-background px-3 text-xs shadow-xs focus:outline-hidden"
        >
          <option value="ALL">สถานะ: ทั้งหมด</option>
          <option value="ACTIVE">{t("staff.status.active")}</option>
          <option value="INACTIVE">{t("staff.status.inactive")}</option>
        </select>
      </div>

      {/* Main Table */}
      <LiyonCard>
        <DataTable<StaffProfileDto>
          headHeading={<span>{t("staff.title")}</span>}
          state={filteredStaff.length === 0 ? "empty" : "data"}
          rows={filteredStaff}
          columns={columns}
          getRowId={(row) => row.id}
          renderRowMenu={
            canManage
              ? (row) => (
                  <>
                    <RowMenuItem
                      onSelect={() => window.open(`/staff/${row.id}`, "_blank")}
                      icon={<ExternalLink className="h-4 w-4" />}
                    >
                      ดูหน้าเว็บ
                    </RowMenuItem>
                    <RowMenuItem
                      onSelect={() => openEditDialog(row)}
                      icon={<Edit2 className="h-4 w-4" />}
                    >
                      {t("staff.edit")}
                    </RowMenuItem>
                    <RowMenuItem
                      onSelect={() => setDeleteConfirmItem(row)}
                      danger
                      icon={<Trash2 className="h-4 w-4" />}
                    >
                      {t("staff.delete")}
                    </RowMenuItem>
                  </>
                )
              : undefined
          }
          empty={{
            icon: <Users className="h-10 w-10 text-muted-foreground/50" />,
            title: t("staff.empty"),
            description: t("staff.subtitle"),
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
          title={editingStaff ? t("staff.edit") : t("staff.create")}
          description={t("staff.subtitle")}
        />
        <LiyonDialogBody className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {/* Department & Academic Position */}
          <div className="grid gap-4 sm:grid-cols-2">
            <LiyonField label={t("staff.department")} htmlFor="formDeptId">
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

            <LiyonField label={t("staff.academicPosition")} htmlFor="formAcademicPosition">
              <select
                id="formAcademicPosition"
                value={formAcademicPosition}
                onChange={(e) => setFormAcademicPosition(e.target.value)}
                className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
              >
                <option value="PROFESSOR">{t("staff.pos.PROFESSOR")}</option>
                <option value="ASSOCIATE_PROFESSOR">{t("staff.pos.ASSOCIATE_PROFESSOR")}</option>
                <option value="ASSISTANT_PROFESSOR">{t("staff.pos.ASSISTANT_PROFESSOR")}</option>
                <option value="LECTURER">{t("staff.pos.LECTURER")}</option>
                <option value="RESEARCHER">{t("staff.pos.RESEARCHER")}</option>
                <option value="OFFICER">{t("staff.pos.OFFICER")}</option>
                <option value="OTHER">{t("staff.pos.OTHER")}</option>
              </select>
            </LiyonField>
          </div>

          {/* Thai Name Fields */}
          <div className="grid gap-3 sm:grid-cols-3">
            <LiyonField label={t("staff.titleTh")} htmlFor="formTitleTh">
              <input
                id="formTitleTh"
                type="text"
                value={formTitleTh}
                onChange={(e) => setFormTitleTh(e.target.value)}
                placeholder="เช่น ศ.ดร. / ผศ. / นาย"
                className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
              />
            </LiyonField>

            <LiyonField label={t("staff.firstNameTh")} htmlFor="formFirstNameTh">
              <input
                id="formFirstNameTh"
                type="text"
                value={formFirstNameTh}
                onChange={(e) => setFormFirstNameTh(e.target.value)}
                placeholder="ชื่อจริง (ภาษาไทย)"
                className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
              />
            </LiyonField>

            <LiyonField label={t("staff.lastNameTh")} htmlFor="formLastNameTh">
              <input
                id="formLastNameTh"
                type="text"
                value={formLastNameTh}
                onChange={(e) => setFormLastNameTh(e.target.value)}
                placeholder="นามสกุล (ภาษาไทย)"
                className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
              />
            </LiyonField>
          </div>

          {/* English Name Fields */}
          <div className="grid gap-3 sm:grid-cols-3">
            <LiyonField label={t("staff.titleEn")} htmlFor="formTitleEn">
              <input
                id="formTitleEn"
                type="text"
                value={formTitleEn}
                onChange={(e) => setFormTitleEn(e.target.value)}
                placeholder="e.g. Prof. Dr. / Mr."
                className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
              />
            </LiyonField>

            <LiyonField label={t("staff.firstNameEn")} htmlFor="formFirstNameEn">
              <input
                id="formFirstNameEn"
                type="text"
                value={formFirstNameEn}
                onChange={(e) => setFormFirstNameEn(e.target.value)}
                placeholder="First name in English"
                className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
              />
            </LiyonField>

            <LiyonField label={t("staff.lastNameEn")} htmlFor="formLastNameEn">
              <input
                id="formLastNameEn"
                type="text"
                value={formLastNameEn}
                onChange={(e) => setFormLastNameEn(e.target.value)}
                placeholder="Last name in English"
                className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
              />
            </LiyonField>
          </div>

          {/* Management Positions */}
          <div className="grid gap-4 sm:grid-cols-2">
            <LiyonField label={t("staff.managementPositionTh")} htmlFor="formManagementPositionTh">
              <input
                id="formManagementPositionTh"
                type="text"
                value={formManagementPositionTh}
                onChange={(e) => setFormManagementPositionTh(e.target.value)}
                placeholder="เช่น คณบดี, รองคณบดีฝ่ายวิชาการ"
                className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
              />
            </LiyonField>

            <LiyonField label={t("staff.managementPositionEn")} htmlFor="formManagementPositionEn">
              <input
                id="formManagementPositionEn"
                type="text"
                value={formManagementPositionEn}
                onChange={(e) => setFormManagementPositionEn(e.target.value)}
                placeholder="e.g. Dean, Associate Dean"
                className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
              />
            </LiyonField>
          </div>

          {/* Contact Details */}
          <div className="grid gap-3 sm:grid-cols-3">
            <LiyonField label={t("staff.email")} htmlFor="formEmail">
              <input
                id="formEmail"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="somchai@faculty.ac.th"
                className="h-9 w-full rounded-lg border bg-background px-3 text-xs font-mono"
              />
            </LiyonField>

            <LiyonField label={t("staff.phoneExt")} htmlFor="formPhoneExt">
              <input
                id="formPhoneExt"
                type="text"
                value={formPhoneExt}
                onChange={(e) => setFormPhoneExt(e.target.value)}
                placeholder="เช่น 102, 105"
                className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
              />
            </LiyonField>

            <LiyonField label={t("staff.roomNumber")} htmlFor="formRoomNumber">
              <input
                id="formRoomNumber"
                type="text"
                value={formRoomNumber}
                onChange={(e) => setFormRoomNumber(e.target.value)}
                placeholder="เช่น IT-801"
                className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
              />
            </LiyonField>
          </div>

          {/* Avatar URL & Expertise */}
          <div className="grid gap-4 sm:grid-cols-2">
            <LiyonField label={t("staff.avatarUrl")} htmlFor="formAvatarUrl" hint="ลิงก์ URL รูปถ่าย">
              <input
                id="formAvatarUrl"
                type="url"
                value={formAvatarUrl}
                onChange={(e) => setFormAvatarUrl(e.target.value)}
                placeholder="https://..."
                className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
              />
            </LiyonField>

            <LiyonField label={t("staff.expertise")} htmlFor="formExpertise" hint="คั่นแต่ละสาขาด้วยเครื่องหมายจุลภาค (,)">
              <input
                id="formExpertise"
                type="text"
                value={formExpertise}
                onChange={(e) => setFormExpertise(e.target.value)}
                placeholder="AI, Cloud Computing, Cybersecurity"
                className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
              />
            </LiyonField>
          </div>

          {/* Education History Section */}
          <div className="rounded-xl border p-4 bg-muted/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                <GraduationCap className="h-4 w-4 text-primary" />
                <span>{t("staff.education")}</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addEducationRow}
                className="h-7 gap-1 text-[11px]"
              >
                <Plus className="h-3 w-3" />
                <span>เพิ่มวุฒิการศึกษา</span>
              </Button>
            </div>

            {formEducation.length === 0 ? (
              <p className="text-[11px] text-muted-foreground italic">
                ยังไม่มีข้อมูลประวัติการศึกษา (คลิกเพิ่มวุฒิการศึกษาเพื่อระบุ)
              </p>
            ) : (
              <div className="space-y-2">
                {formEducation.map((edu, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-2 items-center rounded-lg border bg-background p-2 text-xs"
                  >
                    <div className="col-span-3">
                      <input
                        type="text"
                        placeholder="วุฒิ เช่น วศ.บ., Ph.D."
                        value={edu.degree}
                        onChange={(e) => updateEducationRow(idx, "degree", e.target.value)}
                        className="h-7 w-full rounded border bg-background px-2 text-[11px]"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="text"
                        placeholder="สาขาวิชา"
                        value={edu.field}
                        onChange={(e) => updateEducationRow(idx, "field", e.target.value)}
                        className="h-7 w-full rounded border bg-background px-2 text-[11px]"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="text"
                        placeholder="สถาบันการศึกษา"
                        value={edu.institution}
                        onChange={(e) => updateEducationRow(idx, "institution", e.target.value)}
                        className="h-7 w-full rounded border bg-background px-2 text-[11px]"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="text"
                        placeholder="ปี พ.ศ./ค.ศ."
                        value={edu.year ?? ""}
                        onChange={(e) => updateEducationRow(idx, "year", e.target.value)}
                        className="h-7 w-full rounded border bg-background px-2 text-[11px]"
                      />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button
                        type="button"
                        onClick={() => removeEducationRow(idx)}
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

          {/* Options: Executive & Active */}
          <div className="grid gap-3 sm:grid-cols-2">
            <LiyonSwitchRow
              id="formIsExecutive"
              checked={formIsExecutive}
              onCheckedChange={setFormIsExecutive}
              label={t("staff.isExecutive")}
              description="แสดงในส่วนคณะผู้บริหารของหน้าเว็บ"
            />

            <LiyonSwitchRow
              id="formIsActive"
              checked={formIsActive}
              onCheckedChange={setFormIsActive}
              label={t("staff.isActive")}
              description="แสดงผลในทำเนียบบุคลากรสาธารณะ"
            />
          </div>

          {/* Order Sequence */}
          <div className="max-w-xs">
            <LiyonField label={t("staff.orderSeq")} htmlFor="formOrderSeq" hint="ตัวเลขน้อยจะแสดงก่อน">
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
            {t("staff.cancel")}
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="text-xs"
          >
            {isPending ? "กำลังบันทึก..." : t("staff.save")}
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
          title={t("staff.delete")}
          description={t("staff.deleteConfirm")}
        />
        <LiyonDialogBody>
          <p className="text-xs text-muted-foreground">
            คุณกำลังจะลบข้อมูลบุคลากร:{" "}
            <span className="font-bold text-foreground">
              {locale === "en"
                ? deleteConfirmItem?.fullNameEn
                : deleteConfirmItem?.fullNameTh}
            </span>{" "}
            การดำเนินการนี้ไม่สามารถย้อนกลับได้
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
            {t("staff.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
            className="text-xs"
          >
            {isPending ? "กำลังลบ..." : t("staff.delete")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}
