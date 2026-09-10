"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  FlaskConical,
  Plus,
  BookOpen,
  Edit2,
  Trash2,
  ExternalLink,
  Search,
  AlertCircle,
} from "lucide-react";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { formatDate } from "@/shared/lib/format";
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
} from "@/shared/components/liyon";
import {
  createProjectAction,
  updateProjectAction,
  deleteProjectAction,
  createPublicationAction,
  deletePublicationAction,
} from "@/features/research/actions";
import type {
  ResearchProjectDto,
  PublicationDto,
  ResearchStatus,
  PublicationType,
} from "@/features/research";

interface AdminResearchClientProps {
  projects: ResearchProjectDto[];
  publications: PublicationDto[];
  canManage: boolean;
}

export function AdminResearchClient({
  projects,
  publications,
  canManage,
}: AdminResearchClientProps) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<"projects" | "publications">("projects");
  const [projectSearch, setProjectSearch] = useState("");
  const [pubSearch, setPubSearch] = useState("");

  // Dialog states
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ResearchProjectDto | null>(null);

  const [pubDialogOpen, setPubDialogOpen] = useState(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<{
    type: "project" | "pub";
    id: string;
    title: string;
  } | null>(null);

  // Project Form fields
  const [pCode, setPCode] = useState("");
  const [pTitleTh, setPTitleTh] = useState("");
  const [pTitleEn, setPTitleEn] = useState("");
  const [pAbstractTh, setPAbstractTh] = useState("");
  const [pAbstractEn, setPAbstractEn] = useState("");
  const [pLeaderName, setPLeaderName] = useState("");
  const [pMembersStr, setPMembersStr] = useState("");
  const [pBudget, setPBudget] = useState<number>(0);
  const [pFundingSource, setPFundingSource] = useState("");
  const [pStartDate, setPStartDate] = useState("");
  const [pEndDate, setPEndDate] = useState("");
  const [pStatus, setPStatus] = useState<ResearchStatus>("IN_PROGRESS");
  const [pCoverUrl, setPCoverUrl] = useState("");
  const [pOutputUrl, setPOutputUrl] = useState("");

  // Publication Form fields
  const [pubProjectId, setPubProjectId] = useState<string>("");
  const [pubTitle, setPubTitle] = useState("");
  const [pubAuthors, setPubAuthors] = useState("");
  const [pubJournal, setPubJournal] = useState("");
  const [pubType, setPubType] = useState<PublicationType>("JOURNAL_INTERNATIONAL");
  const [pubTier, setPubTier] = useState("");
  const [pubYear, setPubYear] = useState<number>(new Date().getFullYear());
  const [pubDoi, setPubDoi] = useState("");
  const [pubUrl, setPubUrl] = useState("");

  const getStatusTone = (status: ResearchStatus) => {
    switch (status) {
      case "IN_PROGRESS":
        return "ok";
      case "COMPLETED":
        return "info";
      case "PROPOSED":
        return "warn";
      case "CANCELLED":
        return "bad";
      default:
        return "off";
    }
  };

  const getPubTypeTone = (type: PublicationType) => {
    switch (type) {
      case "JOURNAL_INTERNATIONAL":
        return "ok";
      case "PATENT":
        return "warn";
      case "CONFERENCE_INTERNATIONAL":
        return "info";
      default:
        return "off";
    }
  };

  const openCreateProjectDialog = () => {
    setEditingProject(null);
    setPCode("");
    setPTitleTh("");
    setPTitleEn("");
    setPAbstractTh("");
    setPAbstractEn("");
    setPLeaderName("");
    setPMembersStr("");
    setPBudget(0);
    setPFundingSource("");
    setPStartDate(new Date().toISOString().slice(0, 10));
    setPEndDate("");
    setPStatus("IN_PROGRESS");
    setPCoverUrl("");
    setPOutputUrl("");
    setProjectDialogOpen(true);
  };

  const openEditProjectDialog = (p: ResearchProjectDto) => {
    setEditingProject(p);
    setPCode(p.code);
    setPTitleTh(p.titleTh);
    setPTitleEn(p.titleEn);
    setPAbstractTh(p.abstractTh || "");
    setPAbstractEn(p.abstractEn || "");
    setPLeaderName(p.leaderName);
    setPMembersStr(p.members.join(", "));
    setPBudget(p.budget || 0);
    setPFundingSource(p.fundingSource || "");
    setPStartDate(p.startDate.slice(0, 10));
    setPEndDate(p.endDate ? p.endDate.slice(0, 10) : "");
    setPStatus(p.status);
    setPCoverUrl(p.coverImageUrl || "");
    setPOutputUrl(p.outputFileUrl || "");
    setProjectDialogOpen(true);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    const members = pMembersStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    startTransition(async () => {
      const payload = {
        code: pCode.trim(),
        titleTh: pTitleTh.trim(),
        titleEn: pTitleEn.trim(),
        abstractTh: pAbstractTh.trim() || null,
        abstractEn: pAbstractEn.trim() || null,
        leaderName: pLeaderName.trim(),
        members,
        budget: pBudget > 0 ? pBudget : null,
        fundingSource: pFundingSource.trim() || null,
        startDate: new Date(pStartDate).toISOString(),
        endDate: pEndDate ? new Date(pEndDate).toISOString() : null,
        status: pStatus,
        coverImageUrl: pCoverUrl.trim() || null,
        outputFileUrl: pOutputUrl.trim() || null,
      };

      if (editingProject) {
        const res = await updateProjectAction({ id: editingProject.id, ...payload });
        if (!res.ok) {
          toast.error(res.error.message || "เกิดข้อผิดพลาดในการแก้ไข");
          return;
        }
        toast.success("บันทึกการแก้ไขโครงการวิจัยเรียบร้อยแล้ว");
      } else {
        const res = await createProjectAction(payload);
        if (!res.ok) {
          toast.error(res.error.message || "เกิดข้อผิดพลาดในการสร้าง");
          return;
        }
        toast.success("เพิ่มโครงการวิจัยเรียบร้อยแล้ว");
      }

      setProjectDialogOpen(false);
      router.refresh();
    });
  };

  const handleSavePublication = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await createPublicationAction({
        projectId: pubProjectId || null,
        title: pubTitle.trim(),
        authors: pubAuthors.trim(),
        journalOrConference: pubJournal.trim(),
        publicationType: pubType,
        tier: pubTier.trim() || null,
        doi: pubDoi.trim() || null,
        year: pubYear,
        url: pubUrl.trim() || null,
      });

      if (!res.ok) {
        toast.error(res.error.message || "เกิดข้อผิดพลาดในการเพิ่มบทความ");
        return;
      }

      toast.success("เพิ่มผลงานตีพิมพ์ทางวิชาการเรียบร้อยแล้ว");
      setPubDialogOpen(false);
      router.refresh();
    });
  };

  const handleDeleteConfirm = () => {
    if (!deleteConfirmItem) return;
    startTransition(async () => {
      if (deleteConfirmItem.type === "project") {
        const res = await deleteProjectAction(deleteConfirmItem.id);
        if (!res.ok) {
          toast.error(res.error.message || "เกิดข้อผิดพลาดในการลบ");
          return;
        }
        toast.success("ลบโครงการวิจัยเรียบร้อยแล้ว");
      } else {
        const res = await deletePublicationAction(deleteConfirmItem.id);
        if (!res.ok) {
          toast.error(res.error.message || "เกิดข้อผิดพลาดในการลบ");
          return;
        }
        toast.success("ลบผลงานตีพิมพ์เรียบร้อยแล้ว");
      }
      setDeleteConfirmItem(null);
      router.refresh();
    });
  };

  // Filtered projects
  const filteredProjects = projects.filter((p) => {
    if (projectSearch.trim()) {
      const q = projectSearch.toLowerCase();
      return (
        p.code.toLowerCase().includes(q) ||
        p.titleTh.toLowerCase().includes(q) ||
        p.titleEn.toLowerCase().includes(q) ||
        p.leaderName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered publications
  const filteredPubs = publications.filter((pub) => {
    if (pubSearch.trim()) {
      const q = pubSearch.toLowerCase();
      return (
        pub.title.toLowerCase().includes(q) ||
        pub.authors.toLowerCase().includes(q) ||
        pub.journalOrConference.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Project Columns
  const projectColumns: DataTableColumn<ResearchProjectDto>[] = [
    {
      key: "code",
      header: "รหัส / สถานะ",
      render: (row) => (
        <div className="space-y-1">
          <span className="font-mono text-xs font-bold text-foreground">{row.code}</span>
          <div>
            <StatusPill tone={getStatusTone(row.status)}>
              {row.status === "IN_PROGRESS"
                ? t("research.status.in_progress")
                : row.status === "COMPLETED"
                ? t("research.status.completed")
                : t("research.status.proposed")}
            </StatusPill>
          </div>
        </div>
      ),
    },
    {
      key: "title",
      header: "ชื่อโครงการวิจัย",
      render: (row) => (
        <div className="space-y-0.5 max-w-md">
          <p className="font-semibold text-xs text-foreground line-clamp-1">{row.titleTh}</p>
          <p className="text-[11px] text-muted-foreground line-clamp-1 italic">{row.titleEn}</p>
        </div>
      ),
    },
    {
      key: "leader",
      header: "หัวหน้าโครงการ / คณะวิจัย",
      render: (row) => (
        <div className="space-y-0.5 text-xs">
          <span className="font-semibold text-foreground">{row.leaderName}</span>
          {row.members.length > 0 && (
            <p className="text-[11px] text-muted-foreground">+{row.members.length} ผู้ร่วมวิจัย</p>
          )}
        </div>
      ),
    },
    {
      key: "funding",
      header: "แหล่งทุน / งบประมาณ",
      render: (row) => (
        <div className="space-y-0.5 text-xs">
          <span className="font-medium text-foreground">{row.fundingSource || "-"}</span>
          {row.budget && (
            <p className="font-mono font-bold text-emerald-600">
              {row.budget.toLocaleString()} บาท
            </p>
          )}
        </div>
      ),
    },
    {
      key: "duration",
      header: "ระยะเวลา",
      render: (row) => (
        <div className="text-xs text-muted-foreground">
          <span>{formatDate(row.startDate, locale)}</span>
          {row.endDate && <p>ถึง {formatDate(row.endDate, locale)}</p>}
        </div>
      ),
    },
  ];

  // Publication Columns
  const pubColumns: DataTableColumn<PublicationDto>[] = [
    {
      key: "type",
      header: "ประเภท / ระดับ",
      render: (row) => (
        <div className="space-y-1">
          <StatusPill tone={getPubTypeTone(row.publicationType)}>
            {row.publicationType === "JOURNAL_INTERNATIONAL"
              ? "วารสารนานาชาติ"
              : row.publicationType === "JOURNAL_NATIONAL"
              ? "วารสารระดับชาติ"
              : row.publicationType === "CONFERENCE_INTERNATIONAL"
              ? "ประชุมนานาชาติ"
              : "สิทธิบัตร"}
          </StatusPill>
          {row.tier && (
            <div>
              <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                {row.tier}
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "title",
      header: "ชื่อบทความ / คณะผู้ประพันธ์",
      render: (row) => (
        <div className="space-y-0.5 max-w-lg">
          <p className="font-semibold text-xs text-foreground line-clamp-2">{row.title}</p>
          <p className="text-[11px] text-muted-foreground line-clamp-1">{row.authors}</p>
        </div>
      ),
    },
    {
      key: "journal",
      header: "วารสาร / แหล่งเผยแพร่",
      render: (row) => (
        <div className="space-y-0.5 text-xs">
          <span className="font-medium text-primary line-clamp-1">{row.journalOrConference}</span>
          <p className="font-mono text-[11px] text-muted-foreground">ปี {row.year}</p>
        </div>
      ),
    },
    {
      key: "link",
      header: "ลิงก์",
      render: (row) =>
        row.url ? (
          <a
            href={row.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <span>ต้นฉบับ</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("roles.module.research")}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            บริหารจัดการโครงการวิจัย ทุนสนับสนุน และผลงานตีพิมพ์ทางวิชาการ
          </p>
        </div>

        {canManage && (
          <div className="flex items-center gap-2">
            <Button onClick={openCreateProjectDialog} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>{t("research.addProject")}</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setPubProjectId("");
                setPubTitle("");
                setPubAuthors("");
                setPubJournal("");
                setPubType("JOURNAL_INTERNATIONAL");
                setPubTier("");
                setPubYear(new Date().getFullYear());
                setPubDoi("");
                setPubUrl("");
                setPubDialogOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              <span>{t("research.addPublication")}</span>
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-px">
        <button
          type="button"
          onClick={() => setActiveTab("projects")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
            activeTab === "projects"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <FlaskConical className="h-4 w-4" />
          <span>{t("research.projects")} ({filteredProjects.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("publications")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
            activeTab === "publications"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>{t("research.publications")} ({filteredPubs.length})</span>
        </button>
      </div>

      {/* Projects Table */}
      {activeTab === "projects" && (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("research.search")}
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
              className="h-9 w-full rounded-lg border bg-background pl-9 pr-3 text-xs"
            />
          </div>

          <LiyonCard>
            <DataTable<ResearchProjectDto>
              headHeading={<span>{t("research.projects")}</span>}
              state={filteredProjects.length === 0 ? "empty" : "data"}
              rows={filteredProjects}
              columns={projectColumns}
              getRowId={(row) => row.id}
              renderRowMenu={
                canManage
                  ? (row) => (
                      <>
                        <RowMenuItem
                          onSelect={() => openEditProjectDialog(row)}
                          icon={<Edit2 className="h-4 w-4" />}
                        >
                          {t("research.editProject")}
                        </RowMenuItem>
                        <RowMenuItem
                          onSelect={() =>
                            setDeleteConfirmItem({
                              type: "project",
                              id: row.id,
                              title: row.titleTh,
                            })
                          }
                          danger
                          icon={<Trash2 className="h-4 w-4 text-destructive" />}
                        >
                          {t("research.deleteProject")}
                        </RowMenuItem>
                      </>
                    )
                  : undefined
              }
              empty={{
                icon: <FlaskConical className="h-10 w-10 text-muted-foreground/50" />,
                title: t("research.empty"),
                description: "ยังไม่มีโครงการวิจัยในระบบ",
              }}
              error={{
                icon: <AlertCircle className="h-10 w-10 text-destructive" />,
                title: t("common.error"),
              }}
            />
          </LiyonCard>
        </div>
      )}

      {/* Publications Table */}
      {activeTab === "publications" && (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("research.search")}
              value={pubSearch}
              onChange={(e) => setPubSearch(e.target.value)}
              className="h-9 w-full rounded-lg border bg-background pl-9 pr-3 text-xs"
            />
          </div>

          <LiyonCard>
            <DataTable<PublicationDto>
              headHeading={<span>{t("research.publications")}</span>}
              state={filteredPubs.length === 0 ? "empty" : "data"}
              rows={filteredPubs}
              columns={pubColumns}
              getRowId={(row) => row.id}
              renderRowMenu={
                canManage
                  ? (row) => (
                      <RowMenuItem
                        onSelect={() =>
                          setDeleteConfirmItem({
                            type: "pub",
                            id: row.id,
                            title: row.title,
                          })
                        }
                        danger
                        icon={<Trash2 className="h-4 w-4 text-destructive" />}
                      >
                        ลบผลงานตีพิมพ์
                      </RowMenuItem>
                    )
                  : undefined
              }
              empty={{
                icon: <BookOpen className="h-10 w-10 text-muted-foreground/50" />,
                title: t("research.pubEmpty"),
                description: "ยังไม่มีข้อมูลผลงานตีพิมพ์ในระบบ",
              }}
              error={{
                icon: <AlertCircle className="h-10 w-10 text-destructive" />,
                title: t("common.error"),
              }}
            />
          </LiyonCard>
        </div>
      )}

      {/* Project Form Dialog */}
      <LiyonDialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
        <LiyonDialogHeader
          title={editingProject ? t("research.editProject") : t("research.addProject")}
          description="กรอกรายละเอียดข้อมูลโครงการวิจัย แหล่งทุน และสถานะการดำเนินงาน"
        />
        <form onSubmit={handleSaveProject}>
          <LiyonDialogBody className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid gap-4 sm:grid-cols-2">
              <LiyonField label="รหัสโครงการวิจัย" htmlFor="pCode">
                <input
                  id="pCode"
                  type="text"
                  required
                  value={pCode}
                  onChange={(e) => setPCode(e.target.value.toUpperCase())}
                  placeholder="e.g. RES-2026-004"
                  className="h-9 w-full rounded-lg border bg-background px-3 font-mono text-xs"
                />
              </LiyonField>

              <LiyonField label={t("research.status")} htmlFor="pStatus">
                <select
                  id="pStatus"
                  value={pStatus}
                  onChange={(e) => setPStatus(e.target.value as ResearchStatus)}
                  className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
                >
                  <option value="IN_PROGRESS">{t("research.status.in_progress")}</option>
                  <option value="COMPLETED">{t("research.status.completed")}</option>
                  <option value="PROPOSED">{t("research.status.proposed")}</option>
                  <option value="CANCELLED">{t("research.status.cancelled")}</option>
                </select>
              </LiyonField>
            </div>

            <LiyonField label="ชื่อโครงการวิจัย (ภาษาไทย)" htmlFor="pTitleTh">
              <input
                id="pTitleTh"
                type="text"
                required
                value={pTitleTh}
                onChange={(e) => setPTitleTh(e.target.value)}
                className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
              />
            </LiyonField>

            <LiyonField label="ชื่อโครงการวิจัย (ภาษาอังกฤษ)" htmlFor="pTitleEn">
              <input
                id="pTitleEn"
                type="text"
                required
                value={pTitleEn}
                onChange={(e) => setPTitleEn(e.target.value)}
                className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
              />
            </LiyonField>

            <div className="grid gap-4 sm:grid-cols-2">
              <LiyonField label={t("research.leader")} htmlFor="pLeader">
                <input
                  id="pLeader"
                  type="text"
                  required
                  value={pLeaderName}
                  onChange={(e) => setPLeaderName(e.target.value)}
                  placeholder="เช่น รศ.ดร.สมชาย ใจดี"
                  className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
                />
              </LiyonField>

              <LiyonField label="คณะผู้วิจัย (คั่นด้วยจุลภาค)" htmlFor="pMembers">
                <input
                  id="pMembers"
                  type="text"
                  value={pMembersStr}
                  onChange={(e) => setPMembersStr(e.target.value)}
                  placeholder="เช่น ดร.กานดา สุขใจ, อ.วิชัย นวัตกรรม"
                  className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
                />
              </LiyonField>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <LiyonField label={t("research.fundingSource")} htmlFor="pFunding">
                <input
                  id="pFunding"
                  type="text"
                  value={pFundingSource}
                  onChange={(e) => setPFundingSource(e.target.value)}
                  placeholder="เช่น สำนักงานการวิจัยแห่งชาติ (วช.)"
                  className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
                />
              </LiyonField>

              <LiyonField label="งบประมาณโครงการ (บาท)" htmlFor="pBudget">
                <input
                  id="pBudget"
                  type="number"
                  value={pBudget}
                  onChange={(e) => setPBudget(parseFloat(e.target.value) || 0)}
                  className="h-9 w-full rounded-lg border bg-background px-3 font-mono text-xs"
                />
              </LiyonField>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <LiyonField label={t("research.startDate")} htmlFor="pStartDate">
                <input
                  id="pStartDate"
                  type="date"
                  required
                  value={pStartDate}
                  onChange={(e) => setPStartDate(e.target.value)}
                  className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
                />
              </LiyonField>

              <LiyonField label={t("research.endDate")} htmlFor="pEndDate">
                <input
                  id="pEndDate"
                  type="date"
                  value={pEndDate}
                  onChange={(e) => setPEndDate(e.target.value)}
                  className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
                />
              </LiyonField>
            </div>

            <LiyonField label="บทคัดย่อ (ภาษาไทย)" htmlFor="pAbstractTh">
              <textarea
                id="pAbstractTh"
                rows={3}
                value={pAbstractTh}
                onChange={(e) => setPAbstractTh(e.target.value)}
                className="w-full rounded-lg border bg-background p-2.5 text-xs"
              />
            </LiyonField>

            <LiyonField label="ภาพปกโครงการ URL" htmlFor="pCoverUrl">
              <input
                id="pCoverUrl"
                type="url"
                value={pCoverUrl}
                onChange={(e) => setPCoverUrl(e.target.value)}
                placeholder="https://..."
                className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
              />
            </LiyonField>
          </LiyonDialogBody>
          <LiyonDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setProjectDialogOpen(false)}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isPending}>
              บันทึกข้อมูล
            </Button>
          </LiyonDialogFooter>
        </form>
      </LiyonDialog>

      {/* Publication Form Dialog */}
      <LiyonDialog open={pubDialogOpen} onOpenChange={setPubDialogOpen}>
        <LiyonDialogHeader
          title={t("research.addPublication")}
          description="เพิ่มผลงานตีพิมพ์ทางวิชาการ วารสาร หรือการประชุมวิชาการ"
        />
        <form onSubmit={handleSavePublication}>
          <LiyonDialogBody className="space-y-4">
            <LiyonField label="โครงการวิจัยที่เกี่ยวข้อง (ถ้ามี)" htmlFor="pubProject">
              <select
                id="pubProject"
                value={pubProjectId}
                onChange={(e) => setPubProjectId(e.target.value)}
                className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
              >
                <option value="">-- ไม่ระบุโครงการ --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.code}] {p.titleTh}
                  </option>
                ))}
              </select>
            </LiyonField>

            <LiyonField label="ชื่อผลงานตีพิมพ์" htmlFor="pubTitle">
              <input
                id="pubTitle"
                type="text"
                required
                value={pubTitle}
                onChange={(e) => setPubTitle(e.target.value)}
                placeholder="e.g. Deep Learning in Healthcare"
                className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
              />
            </LiyonField>

            <LiyonField label={t("research.authors")} htmlFor="pubAuthors">
              <input
                id="pubAuthors"
                type="text"
                required
                value={pubAuthors}
                onChange={(e) => setPubAuthors(e.target.value)}
                placeholder="เช่น Somchai J., Kanda S."
                className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
              />
            </LiyonField>

            <div className="grid gap-4 sm:grid-cols-2">
              <LiyonField label="ประเภทผลงาน" htmlFor="pubType">
                <select
                  id="pubType"
                  value={pubType}
                  onChange={(e) => setPubType(e.target.value as PublicationType)}
                  className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
                >
                  <option value="JOURNAL_INTERNATIONAL">วารสารนานาชาติ (Scopus/WoS)</option>
                  <option value="JOURNAL_NATIONAL">วารสารระดับชาติ (TCI)</option>
                  <option value="CONFERENCE_INTERNATIONAL">การประชุมนานาชาติ</option>
                  <option value="CONFERENCE_NATIONAL">การประชุมระดับชาติ</option>
                  <option value="PATENT">สิทธิบัตร/ทรัพย์สินทางปัญญา</option>
                </select>
              </LiyonField>

              <LiyonField label="ระดับ / Tier (เช่น Q1, Q2, TCI 1)" htmlFor="pubTier">
                <input
                  id="pubTier"
                  type="text"
                  value={pubTier}
                  onChange={(e) => setPubTier(e.target.value)}
                  placeholder="e.g. Q1, Scopus"
                  className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
                />
              </LiyonField>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <LiyonField label={t("research.journal")} htmlFor="pubJournal">
                <input
                  id="pubJournal"
                  type="text"
                  required
                  value={pubJournal}
                  onChange={(e) => setPubJournal(e.target.value)}
                  placeholder="เช่น IEEE Access"
                  className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
                />
              </LiyonField>

              <LiyonField label={t("research.year")} htmlFor="pubYear">
                <input
                  id="pubYear"
                  type="number"
                  required
                  value={pubYear}
                  onChange={(e) => setPubYear(parseInt(e.target.value, 10) || 2026)}
                  className="h-9 w-full rounded-lg border bg-background px-3 font-mono text-xs"
                />
              </LiyonField>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <LiyonField label={t("research.doi")} htmlFor="pubDoi">
                <input
                  id="pubDoi"
                  type="text"
                  value={pubDoi}
                  onChange={(e) => setPubDoi(e.target.value)}
                  placeholder="10.1109/ACCESS..."
                  className="h-9 w-full rounded-lg border bg-background px-3 font-mono text-xs"
                />
              </LiyonField>

              <LiyonField label={t("research.url")} htmlFor="pubUrl">
                <input
                  id="pubUrl"
                  type="url"
                  value={pubUrl}
                  onChange={(e) => setPubUrl(e.target.value)}
                  placeholder="https://..."
                  className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
                />
              </LiyonField>
            </div>
          </LiyonDialogBody>
          <LiyonDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPubDialogOpen(false)}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isPending}>
              บันทึกผลงาน
            </Button>
          </LiyonDialogFooter>
        </form>
      </LiyonDialog>

      {/* Delete Confirmation Modal */}
      <LiyonDialog
        open={!!deleteConfirmItem}
        onOpenChange={(open) => !open && setDeleteConfirmItem(null)}
        danger
      >
        <LiyonDialogHeader
          title="ยืนยันการลบรายการ"
          description={`คุณแน่ใจหรือไม่ว่าต้องการลบ: "${deleteConfirmItem?.title}"? การดำเนินการนี้ไม่สามารถเรียกคืนได้`}
        />
        <LiyonDialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setDeleteConfirmItem(null)}
          >
            ยกเลิก
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={handleDeleteConfirm}
          >
            ยืนยันการลบ
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}
