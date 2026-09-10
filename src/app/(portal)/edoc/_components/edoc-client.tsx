"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  FileCheck,
  Search,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  Calendar,
} from "lucide-react";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { formatDate } from "@/shared/lib/format";
import { StatusPill } from "@/shared/components/liyon/status-pill";
import { LiyonDialog, LiyonDialogHeader, LiyonDialogBody } from "@/shared/components/liyon/liyon-dialog";
import { Button } from "@/components/ui/button";
import { createRequestAction } from "@/features/edoc/actions";
import type {
  ApprovalRequestDto,
  DocumentTemplateDto,
  ApprovalStatsDto,
  ApprovalStatus,
  DocumentPriority,
} from "@/features/edoc";

interface EdocClientProps {
  requests: ApprovalRequestDto[];
  templates: DocumentTemplateDto[];
  stats: ApprovalStatsDto;
  isLoggedIn: boolean;
}

export function EdocClient({ requests, templates, stats, isLoggedIn }: EdocClientProps) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<"list" | "new" | "track">("list");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Track state
  const [trackQuery, setTrackQuery] = useState("");
  const [trackedRequest, setTrackedRequest] = useState<ApprovalRequestDto | null>(null);
  const [trackSearched, setTrackSearched] = useState(false);

  // New Request Form state
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id ?? "");
  const [formTitle, setFormTitle] = useState("");
  const [formPriority, setFormPriority] = useState<DocumentPriority>("NORMAL");
  const [formFieldValues, setFormFieldValues] = useState<Record<string, string>>({});

  // View modal
  const [viewRequest, setViewRequest] = useState<ApprovalRequestDto | null>(null);

  const getStatusTone = (status: ApprovalStatus) => {
    switch (status) {
      case "APPROVED":
        return "ok";
      case "SUBMITTED":
        return "warn";
      case "IN_REVIEW":
        return "info";
      case "REJECTED":
        return "bad";
      default:
        return "off";
    }
  };

  const getPriorityTone = (p: DocumentPriority) => {
    switch (p) {
      case "URGENT":
        return "bad";
      case "HIGH":
        return "warn";
      default:
        return "off";
    }
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackQuery.trim()) return;
    const found = requests.find(
      (r) => r.requestNumber.toLowerCase() === trackQuery.trim().toLowerCase()
    );
    setTrackedRequest(found || null);
    setTrackSearched(true);
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.error("กรุณาเข้าสู่ระบบก่อนยื่นคำร้อง");
      router.push("/login?callbackUrl=/edoc");
      return;
    }
    if (!formTitle.trim()) {
      toast.error("กรุณาระบุหัวข้อคำร้อง");
      return;
    }

    startTransition(async () => {
      const res = await createRequestAction({
        templateId: selectedTemplateId || null,
        title: formTitle.trim(),
        priority: formPriority,
        formData: formFieldValues,
      });

      if (!res.ok) {
        toast.error(res.error.message || "เกิดข้อผิดพลาดในการยื่นคำร้อง");
        return;
      }

      toast.success(`ยื่นคำร้องเรียบร้อยแล้ว เลขที่: ${res.data.requestNumber}`);
      setFormTitle("");
      setFormFieldValues({});
      setActiveTab("list");
      router.refresh();
    });
  };

  const filteredRequests = requests.filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        r.requestNumber.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.requesterName.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const currentTemplate = templates.find((tpl) => tpl.id === selectedTemplateId);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Header Banner */}
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <FileCheck className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          {t("edoc.title")}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          {t("edoc.subtitle")}
        </p>
      </div>

      {/* KPI Stats */}
      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border bg-card p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">คำร้องทั้งหมด</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalRequests}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">รอการพิจารณา</p>
              <p className="text-2xl font-bold text-foreground">
                {stats.submittedCount + stats.inReviewCount}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">{t("edoc.status.approved")}</p>
              <p className="text-2xl font-bold text-foreground">{stats.approvedCount}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">{t("edoc.status.rejected")}</p>
              <p className="text-2xl font-bold text-foreground">{stats.rejectedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex items-center justify-center border-b pb-px">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("list")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
              activeTab === "list"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileCheck className="h-4 w-4" />
            <span>{t("edoc.requests")} ({requests.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("new")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
              activeTab === "new"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <PlusCircle className="h-4 w-4" />
            <span>{t("edoc.newRequest")}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("track")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
              activeTab === "track"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Search className="h-4 w-4" />
            <span>{t("edoc.track")}</span>
          </button>
        </div>
      </div>

      {/* Tab 1: List Requests */}
      {activeTab === "list" && (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("edoc.search")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full rounded-xl border bg-background pl-10 pr-4 text-xs shadow-xs focus:border-primary focus:outline-hidden"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {["ALL", "SUBMITTED", "IN_REVIEW", "APPROVED", "REJECTED"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    statusFilter === st
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  {st === "ALL"
                    ? "ทั้งหมด"
                    : st === "SUBMITTED"
                    ? t("edoc.status.submitted")
                    : st === "IN_REVIEW"
                    ? t("edoc.status.in_review")
                    : st === "APPROVED"
                    ? t("edoc.status.approved")
                    : t("edoc.status.rejected")}
                </button>
              ))}
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="rounded-2xl border border-dashed py-16 text-center">
              <FileCheck className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <p className="mt-3 text-sm font-medium text-muted-foreground">{t("edoc.empty")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map((req) => (
                <div
                  key={req.id}
                  onClick={() => setViewRequest(req)}
                  className="cursor-pointer rounded-2xl border bg-card p-5 shadow-xs transition hover:border-primary/50 hover:shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-primary">
                          {req.requestNumber}
                        </span>
                        <StatusPill tone={getStatusTone(req.status)}>
                          {req.status === "SUBMITTED"
                            ? t("edoc.status.submitted")
                            : req.status === "IN_REVIEW"
                            ? t("edoc.status.in_review")
                            : req.status === "APPROVED"
                            ? t("edoc.status.approved")
                            : t("edoc.status.rejected")}
                        </StatusPill>
                        <StatusPill tone={getPriorityTone(req.priority)}>
                          {req.priority === "URGENT"
                            ? t("edoc.priority.urgent")
                            : req.priority === "HIGH"
                            ? t("edoc.priority.high")
                            : t("edoc.priority.normal")}
                        </StatusPill>
                      </div>

                      <h4 className="text-sm font-bold text-foreground sm:text-base">
                        {req.title}
                      </h4>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          <strong className="text-foreground">{req.requesterName}</strong>
                          {req.departmentNameTh && ` (${req.departmentNameTh})`}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(req.createdAt, locale)}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="inline-flex items-center rounded-xl bg-muted/50 px-3 py-1.5 text-xs font-semibold text-foreground transition group-hover:bg-primary">
                        ดูประวัติและไทม์ไลน์ &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: New Request Form */}
      {activeTab === "new" && (
        <div className="mx-auto max-w-2xl rounded-2xl border bg-card p-6 shadow-xs sm:p-8">
          <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
            {t("edoc.newRequest")}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            กรอกข้อมูลรายละเอียดคำร้องเพื่อส่งต่อผู้มีอำนาจพิจารณาอนุมัติ
          </p>

          <form onSubmit={handleCreateRequest} className="mt-6 space-y-5">
            <div>
              <label className="text-xs font-semibold text-foreground">
                {t("edoc.template")}
              </label>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="mt-1.5 h-10 w-full rounded-xl border bg-background px-3 text-xs"
              >
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {locale === "en" ? tpl.nameEn : tpl.nameTh} ({tpl.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">
                หัวข้อคำร้อง <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="เช่น ขออนุมัติเดินทางไปราชการ หรือขอจัดซื้ออุปกรณ์"
                required
                className="mt-1.5 h-10 w-full rounded-xl border bg-background px-3 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">
                {t("edoc.priority")}
              </label>
              <select
                value={formPriority}
                onChange={(e) => setFormPriority(e.target.value as DocumentPriority)}
                className="mt-1.5 h-10 w-full rounded-xl border bg-background px-3 text-xs"
              >
                <option value="NORMAL">{t("edoc.priority.normal")}</option>
                <option value="HIGH">{t("edoc.priority.high")}</option>
                <option value="URGENT">{t("edoc.priority.urgent")}</option>
              </select>
            </div>

            {/* Dynamic Template Fields */}
            {currentTemplate &&
              Array.isArray(currentTemplate.formFields) &&
              (currentTemplate.formFields as Array<{ name: string; label: string; type?: string; required?: boolean }>).map((fld) => (
                <div key={fld.name}>
                  <label className="text-xs font-semibold text-foreground">
                    {fld.label} {fld.required && <span className="text-destructive">*</span>}
                  </label>
                  {fld.type === "textarea" ? (
                    <textarea
                      rows={3}
                      value={formFieldValues[fld.name] || ""}
                      onChange={(e) =>
                        setFormFieldValues((prev) => ({ ...prev, [fld.name]: e.target.value }))
                      }
                      className="mt-1.5 w-full rounded-xl border bg-background p-3 text-xs"
                    />
                  ) : (
                    <input
                      type={fld.type === "number" ? "number" : "text"}
                      value={formFieldValues[fld.name] || ""}
                      onChange={(e) =>
                        setFormFieldValues((prev) => ({ ...prev, [fld.name]: e.target.value }))
                      }
                      className="mt-1.5 h-10 w-full rounded-xl border bg-background px-3 text-xs"
                    />
                  )}
                </div>
              ))}

            <div className="pt-3">
              <Button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold"
              >
                <Send className="h-4 w-4" />
                <span>ส่งคำร้องขออนุมัติ</span>
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Track by Request Number */}
      {activeTab === "track" && (
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="rounded-2xl border bg-card p-6 shadow-xs sm:p-8">
            <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
              {t("edoc.track")}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              กรอกรหัสเลขที่คำร้อง (เช่น REQ-2026-0001) เพื่อตรวจสอบสถานะและเส้นทางการอนุมัติ
            </p>

            <form onSubmit={handleTrackSubmit} className="mt-6 flex gap-2">
              <input
                type="text"
                placeholder="ระบุเลขที่คำร้อง e.g. REQ-2026-0001"
                value={trackQuery}
                onChange={(e) => setTrackQuery(e.target.value)}
                className="h-11 flex-1 rounded-xl border bg-background px-4 font-mono text-xs uppercase"
              />
              <Button type="submit" className="rounded-xl px-5 text-xs font-bold">
                <Search className="mr-1.5 h-4 w-4" />
                ค้นหา
              </Button>
            </form>
          </div>

          {trackSearched && (
            <div>
              {trackedRequest ? (
                <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-5">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <span className="font-mono text-sm font-bold text-primary">
                        {trackedRequest.requestNumber}
                      </span>
                      <h3 className="mt-1 text-base font-bold text-foreground">
                        {trackedRequest.title}
                      </h3>
                    </div>
                    <StatusPill tone={getStatusTone(trackedRequest.status)}>
                      {trackedRequest.status === "SUBMITTED"
                        ? t("edoc.status.submitted")
                        : trackedRequest.status === "IN_REVIEW"
                        ? t("edoc.status.in_review")
                        : trackedRequest.status === "APPROVED"
                        ? t("edoc.status.approved")
                        : t("edoc.status.rejected")}
                    </StatusPill>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">
                      {t("edoc.history")}
                    </h4>
                    <div className="space-y-4 border-l-2 border-primary/30 pl-4">
                      {trackedRequest.histories.map((hist) => (
                        <div key={hist.id} className="relative space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-foreground">
                              {hist.actorName}
                            </span>
                            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono font-bold">
                              {hist.action}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {formatDate(hist.createdAt, locale)}
                            </span>
                          </div>
                          {hist.comments && (
                            <p className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg">
                              &ldquo;{hist.comments}&rdquo;
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed py-12 text-center">
                  <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground/40" />
                  <p className="mt-2 text-xs font-medium text-muted-foreground">
                    ไม่พบข้อมูลคำร้องตามเลขที่ระบุ กรุณาตรวจสอบความถูกต้องอีกครั้ง
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Request Details Dialog */}
      <LiyonDialog
        open={!!viewRequest}
        onOpenChange={(open) => !open && setViewRequest(null)}
      >
        <LiyonDialogHeader
          title={viewRequest?.title ?? ""}
          description={`เลขที่คำร้อง: ${viewRequest?.requestNumber ?? ""} • ยื่นเมื่อ: ${
            viewRequest ? formatDate(viewRequest.createdAt, locale) : ""
          }`}
        />
        <LiyonDialogBody className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-muted-foreground">สถานะปัจจุบัน:</span>
            {viewRequest && (
              <StatusPill tone={getStatusTone(viewRequest.status)}>
                {viewRequest.status === "SUBMITTED"
                  ? t("edoc.status.submitted")
                  : viewRequest.status === "IN_REVIEW"
                  ? t("edoc.status.in_review")
                  : viewRequest.status === "APPROVED"
                  ? t("edoc.status.approved")
                  : t("edoc.status.rejected")}
              </StatusPill>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 rounded-xl border bg-muted/30 p-4 text-xs">
            <div>
              <span className="font-medium text-muted-foreground">{t("edoc.requester")}:</span>
              <p className="font-bold text-foreground mt-0.5">{viewRequest?.requesterName}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">{t("edoc.department")}:</span>
              <p className="font-bold text-foreground mt-0.5">{viewRequest?.departmentNameTh ?? "-"}</p>
            </div>
          </div>

          {/* Form Data Values */}
          {viewRequest && Object.keys(viewRequest.formData).length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                รายละเอียดข้อมูลที่กรอกในคำร้อง
              </h4>
              <div className="space-y-1.5 rounded-xl border p-3 text-xs bg-card">
                {Object.entries(viewRequest.formData).map(([key, val]) => (
                  <div key={key} className="flex justify-between border-b pb-1 text-xs last:border-0 last:pb-0">
                    <span className="font-medium text-muted-foreground">{key}:</span>
                    <span className="font-semibold text-foreground">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Approval History Trail */}
          {viewRequest && viewRequest.histories.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">
                {t("edoc.history")}
              </h4>
              <div className="space-y-3 border-l-2 border-primary/30 pl-4">
                {viewRequest.histories.map((hist) => (
                  <div key={hist.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-foreground">{hist.actorName}</span>
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono font-bold">
                        {hist.action}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {formatDate(hist.createdAt, locale)}
                      </span>
                    </div>
                    {hist.comments && (
                      <p className="text-xs text-muted-foreground bg-muted/40 p-2 rounded-lg">
                        &ldquo;{hist.comments}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </LiyonDialogBody>
      </LiyonDialog>
    </div>
  );
}
