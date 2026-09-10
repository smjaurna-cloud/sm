"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Search,
  Eye,
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
  approveRequestAction,
  rejectRequestAction,
  requestChangesAction,
} from "@/features/edoc/actions";
import type {
  ApprovalRequestDto,
  ApprovalStatus,
  DocumentPriority,
} from "@/features/edoc";

interface AdminEdocClientProps {
  requests: ApprovalRequestDto[];
  canApprove: boolean;
}

export function AdminEdocClient({ requests, canApprove }: AdminEdocClientProps) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Dialog states
  const [viewRequest, setViewRequest] = useState<ApprovalRequestDto | null>(null);
  const [actionItem, setActionItem] = useState<{
    type: "approve" | "reject" | "changes";
    request: ApprovalRequestDto;
  } | null>(null);
  const [remarks, setRemarks] = useState("");

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

  const handleExecuteAction = () => {
    if (!actionItem) return;
    const { type, request } = actionItem;

    if ((type === "reject" || type === "changes") && !remarks.trim()) {
      toast.error("กรุณาระบุเหตุผลหรือข้อสั่งการ");
      return;
    }

    startTransition(async () => {
      let res;
      if (type === "approve") {
        res = await approveRequestAction({
          id: request.id,
          comments: remarks.trim() || null,
        });
      } else if (type === "reject") {
        res = await rejectRequestAction({
          id: request.id,
          comments: remarks.trim(),
        });
      } else {
        res = await requestChangesAction({
          id: request.id,
          comments: remarks.trim(),
        });
      }

      if (!res.ok) {
        toast.error(res.error.message || "เกิดข้อผิดพลาดในการดำเนินการ");
        return;
      }

      toast.success(
        type === "approve"
          ? "อนุมัติคำร้องเรียบร้อยแล้ว"
          : type === "reject"
          ? "ปฏิเสธคำร้องเรียบร้อยแล้ว"
          : "ส่งกลับคำร้องให้แก้ไขเรียบร้อยแล้ว"
      );
      setActionItem(null);
      setRemarks("");
      router.refresh();
    });
  };

  const filteredRequests = requests.filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.requestNumber.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.requesterName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const columns: DataTableColumn<ApprovalRequestDto>[] = [
    {
      key: "requestNumber",
      header: "เลขที่ / ความสำคัญ",
      render: (row) => (
        <div className="space-y-1">
          <span className="font-mono text-xs font-bold text-primary">
            {row.requestNumber}
          </span>
          <div>
            <StatusPill tone={getPriorityTone(row.priority)}>
              {row.priority === "URGENT"
                ? t("edoc.priority.urgent")
                : row.priority === "HIGH"
                ? t("edoc.priority.high")
                : t("edoc.priority.normal")}
            </StatusPill>
          </div>
        </div>
      ),
    },
    {
      key: "title",
      header: "หัวข้อคำร้อง / ประเภท",
      render: (row) => (
        <div className="space-y-0.5 max-w-md">
          <p className="font-semibold text-xs text-foreground line-clamp-2">{row.title}</p>
          <p className="text-[11px] text-muted-foreground line-clamp-1">
            {row.templateNameTh || "คำร้องทั่วไป"}
          </p>
        </div>
      ),
    },
    {
      key: "requester",
      header: t("edoc.requester"),
      render: (row) => (
        <div className="space-y-0.5 text-xs">
          <span className="font-semibold text-foreground">{row.requesterName}</span>
          <p className="text-[11px] text-muted-foreground">{row.departmentNameTh || row.requesterEmail}</p>
        </div>
      ),
    },
    {
      key: "submittedAt",
      header: t("edoc.submittedAt"),
      render: (row) => (
        <span className="text-xs text-muted-foreground">{formatDate(row.createdAt, locale)}</span>
      ),
    },
    {
      key: "status",
      header: t("edoc.status"),
      render: (row) => (
        <StatusPill tone={getStatusTone(row.status)}>
          {row.status === "SUBMITTED"
            ? t("edoc.status.submitted")
            : row.status === "IN_REVIEW"
            ? t("edoc.status.in_review")
            : row.status === "APPROVED"
            ? t("edoc.status.approved")
            : t("edoc.status.rejected")}
        </StatusPill>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("roles.module.edoc")}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            พิจารณาตรวจสอบและอนุมัติคำร้องเอกสารอิเล็กทรอนิกส์ของคณะ
          </p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("edoc.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border bg-background pl-9 pr-3 text-xs"
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

      {/* DataTable */}
      <LiyonCard>
        <DataTable<ApprovalRequestDto>
          headHeading={<span>{t("edoc.requests")}</span>}
          state={filteredRequests.length === 0 ? "empty" : "data"}
          rows={filteredRequests}
          columns={columns}
          getRowId={(row) => row.id}
          renderRowMenu={(row) => (
            <>
              <RowMenuItem
                onSelect={() => setViewRequest(row)}
                icon={<Eye className="h-4 w-4" />}
              >
                ดูรายละเอียด
              </RowMenuItem>

              {canApprove && (row.status === "SUBMITTED" || row.status === "IN_REVIEW") && (
                <>
                  <RowMenuItem
                    onSelect={() => {
                      setActionItem({ type: "approve", request: row });
                      setRemarks("");
                    }}
                    icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                  >
                    {t("edoc.approve")}
                  </RowMenuItem>

                  <RowMenuItem
                    onSelect={() => {
                      setActionItem({ type: "changes", request: row });
                      setRemarks("");
                    }}
                    icon={<RotateCcw className="h-4 w-4 text-amber-600" />}
                  >
                    {t("edoc.requestChange")}
                  </RowMenuItem>

                  <RowMenuItem
                    onSelect={() => {
                      setActionItem({ type: "reject", request: row });
                      setRemarks("");
                    }}
                    danger
                    icon={<XCircle className="h-4 w-4 text-destructive" />}
                  >
                    {t("edoc.reject")}
                  </RowMenuItem>
                </>
              )}
            </>
          )}
          empty={{
            icon: <FileCheck className="h-10 w-10 text-muted-foreground/50" />,
            title: t("edoc.empty"),
            description: "ยังไม่มีคำร้องในระบบ",
          }}
          error={{
            icon: <AlertCircle className="h-10 w-10 text-destructive" />,
            title: t("common.error"),
          }}
        />
      </LiyonCard>

      {/* Action Dialog (Approve / Reject / Changes) */}
      <LiyonDialog
        open={!!actionItem}
        onOpenChange={(open) => !open && setActionItem(null)}
        danger={actionItem?.type === "reject"}
      >
        <LiyonDialogHeader
          title={
            actionItem?.type === "approve"
              ? "อนุมัติคำร้อง"
              : actionItem?.type === "reject"
              ? "ไม่อนุมัติคำร้อง"
              : "ส่งกลับคำร้องเพื่อแก้ไข"
          }
          description={`คำร้องเลขที่: ${actionItem?.request.requestNumber} (${actionItem?.request.title})`}
        />
        <LiyonDialogBody className="space-y-4">
          <LiyonField
            label={actionItem?.type === "approve" ? "ข้อสั่งการ / ความเห็นเพิ่มเติม (ถ้ามี)" : "เหตุผลหรือข้อเสนอแนะที่ต้องแก้ไข *"}
            htmlFor="actionRemarks"
          >
            <textarea
              id="actionRemarks"
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder={
                actionItem?.type === "approve"
                  ? "ระบุข้อสั่งการ เช่น มอบหมายงานการเงินดำเนินการเบิกจ่ายตามระเบียบ"
                  : "ระบุเหตุผลความจำเป็นที่ไม่อนุมัติ หรือสิ่งที่ต้องปรับปรุงแก้ไข"
              }
              className="w-full rounded-lg border bg-background p-2.5 text-xs"
            />
          </LiyonField>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button type="button" variant="outline" onClick={() => setActionItem(null)}>
            ยกเลิก
          </Button>
          <Button
            type="button"
            disabled={isPending}
            variant={actionItem?.type === "reject" ? "destructive" : "default"}
            onClick={handleExecuteAction}
          >
            {actionItem?.type === "approve"
              ? "ยืนยันอนุมัติ"
              : actionItem?.type === "reject"
              ? "ยืนยันไม่อนุมัติ"
              : "ส่งกลับแก้ไข"}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* View Request Details Dialog */}
      <LiyonDialog open={!!viewRequest} onOpenChange={(open) => !open && setViewRequest(null)}>
        <LiyonDialogHeader
          title={viewRequest?.title ?? ""}
          description={`เลขที่คำร้อง: ${viewRequest?.requestNumber ?? ""} • วันที่ยื่น: ${
            viewRequest ? formatDate(viewRequest.createdAt, locale) : ""
          }`}
        />
        <LiyonDialogBody className="space-y-5 max-h-[70vh] overflow-y-auto">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-muted-foreground">สถานะคำร้อง:</span>
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

          {/* Form Data */}
          {viewRequest && Object.keys(viewRequest.formData).length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                รายละเอียดข้อมูลคำร้อง
              </h4>
              <div className="space-y-1.5 rounded-xl border p-3 text-xs bg-card">
                {Object.entries(viewRequest.formData).map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b pb-1 text-xs last:border-0 last:pb-0">
                    <span className="font-medium text-muted-foreground">{k}:</span>
                    <span className="font-semibold text-foreground">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Histories */}
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
