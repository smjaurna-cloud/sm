"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Search,
  Plus,
  AlertCircle,
  Ban,
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
  LiyonSwitchRow,
} from "@/shared/components/liyon";
import type { ResourceBookingDto, BookingResourceDto, ResourceType } from "@/features/booking";
import {
  approveBookingAction,
  rejectBookingAction,
  cancelBookingAction,
  createResourceAction,
  deleteResourceAction,
} from "@/features/booking/actions";

export interface BookingAdminClientProps {
  initialBookings: ResourceBookingDto[];
  resources: BookingResourceDto[];
  canManage: boolean;
}

export function BookingAdminClient({
  initialBookings,
  resources,
  canManage,
}: BookingAdminClientProps) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [bookings, setBookings] = useState<ResourceBookingDto[]>(initialBookings);
  const [resourceList, setResourceList] = useState<BookingResourceDto[]>(resources);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [resourceFilter, setResourceFilter] = useState<string>("ALL");

  // Reject dialog
  const [rejectItem, setRejectItem] = useState<ResourceBookingDto | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Resource creation dialog
  const [resourceDialogOpen, setResourceDialogOpen] = useState(false);
  const [resCode, setResCode] = useState("");
  const [resNameTh, setResNameTh] = useState("");
  const [resNameEn, setResNameEn] = useState("");
  const [resType, setResType] = useState<ResourceType>("ROOM");
  const [resCapacity, setResCapacity] = useState(30);
  const [resLocation, setResLocation] = useState("");
  const [resFacilities, setResFacilities] = useState("");
  const [resImageUrl, setResImageUrl] = useState("");
  const [resRequiresApproval, setResRequiresApproval] = useState(true);
  const [resIsActive, setResIsActive] = useState(true);
  const [resOrderSeq, setResOrderSeq] = useState(0);

  const handleApprove = (item: ResourceBookingDto) => {
    startTransition(async () => {
      const res = await approveBookingAction(item.id);
      if (!res.ok) {
        toast.error(res.error.message || "เกิดข้อผิดพลาดในการอนุมัติ");
        return;
      }
      toast.success(t("booking.approveSuccess"));
      setBookings((prev) =>
        prev.map((b) => (b.id === item.id ? res.data : b))
      );
      router.refresh();
    });
  };

  const handleConfirmReject = () => {
    if (!rejectItem) return;
    startTransition(async () => {
      const res = await rejectBookingAction(rejectItem.id, rejectReason || null);
      if (!res.ok) {
        toast.error(res.error.message || "เกิดข้อผิดพลาดในการปฏิเสธ");
        return;
      }
      toast.success(t("booking.rejectSuccess"));
      setBookings((prev) =>
        prev.map((b) => (b.id === rejectItem.id ? res.data : b))
      );
      setRejectItem(null);
      setRejectReason("");
      router.refresh();
    });
  };

  const handleCancel = (item: ResourceBookingDto) => {
    startTransition(async () => {
      const res = await cancelBookingAction(item.id);
      if (!res.ok) {
        toast.error(res.error.message || "เกิดข้อผิดพลาดในการยกเลิก");
        return;
      }
      toast.success(t("booking.cancelSuccess"));
      setBookings((prev) =>
        prev.map((b) => (b.id === item.id ? res.data : b))
      );
      router.refresh();
    });
  };

  const handleCreateResource = () => {
    if (!resCode.trim() || !resNameTh.trim() || !resNameEn.trim()) {
      toast.error("กรุณากรอกรหัสและชื่อห้อง/ยานพาหนะให้ครบถ้วน");
      return;
    }

    const facArray = resFacilities
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    startTransition(async () => {
      const res = await createResourceAction({
        code: resCode,
        nameTh: resNameTh,
        nameEn: resNameEn,
        type: resType,
        capacity: Number(resCapacity) || 0,
        location: resLocation || null,
        facilities: facArray,
        imageUrl: resImageUrl || null,
        requiresApproval: resRequiresApproval,
        isActive: resIsActive,
        orderSeq: Number(resOrderSeq) || 0,
      });

      if (!res.ok) {
        toast.error(res.error.message || "เกิดข้อผิดพลาดในการสร้างทรัพยากร");
        return;
      }

      toast.success("เพิ่มทรัพยากรเรียบร้อยแล้ว");
      setResourceList((prev) => [...prev, res.data]);
      setResourceDialogOpen(false);
      router.refresh();
    });
  };

  const _handleDeleteResource = (resourceId: string) => {
    startTransition(async () => {
      const res = await deleteResourceAction(resourceId);
      if (!res.ok) {
        toast.error(res.error.message || "เกิดข้อผิดพลาดในการลบ");
        return;
      }
      toast.success("ลบทรัพยากรเรียบร้อยแล้ว");
      setResourceList((prev) => prev.filter((r) => r.id !== resourceId));
      router.refresh();
    });
  };

  // Filtered bookings
  const filteredBookings = bookings.filter((b) => {
    if (statusFilter !== "ALL" && b.status !== statusFilter) return false;
    if (resourceFilter !== "ALL" && b.resourceId !== resourceFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchNo = b.bookingNumber.toLowerCase().includes(q);
      const matchTitle = b.title.toLowerCase().includes(q);
      const matchUser = b.userName.toLowerCase().includes(q);
      return matchNo || matchTitle || matchUser;
    }
    return true;
  });

  const getStatusTone = (status: string): "ok" | "warn" | "bad" | "off" => {
    switch (status) {
      case "APPROVED":
        return "ok";
      case "PENDING":
        return "warn";
      case "REJECTED":
        return "bad";
      case "CANCELLED":
        return "off";
      default:
        return "ok";
    }
  };

  const columns: DataTableColumn<ResourceBookingDto>[] = [
    {
      key: "bookingNumber",
      header: t("booking.bookingNumber"),
      render: (row) => (
        <div className="space-y-1">
          <span className="font-mono text-xs font-bold text-foreground">
            {row.bookingNumber}
          </span>
          <div>
            <StatusPill tone={getStatusTone(row.status)}>
              {t(`booking.status.${row.status}`)}
            </StatusPill>
          </div>
        </div>
      ),
    },
    {
      key: "title",
      header: t("booking.purpose"),
      render: (row) => (
        <div className="space-y-0.5 max-w-xs">
          <p className="font-semibold text-xs line-clamp-2 text-foreground">
            {row.title}
          </p>
          {row.notes && (
            <p className="text-[11px] text-muted-foreground line-clamp-1 italic">
              โน้ต: {row.notes}
            </p>
          )}
          {row.rejectionReason && (
            <p className="text-[11px] text-destructive line-clamp-1">
              เหตุผลปฏิเสธ: {row.rejectionReason}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "resource",
      header: t("booking.resource"),
      render: (row) => {
        const rName = locale === "en" ? row.resourceNameEn : row.resourceNameTh;
        return (
          <div className="space-y-0.5">
            <span className="font-mono text-[10px] rounded bg-muted px-1.5 py-0.5 font-semibold">
              {row.resourceCode}
            </span>
            <p className="font-medium text-xs text-foreground line-clamp-1">{rName}</p>
          </div>
        );
      },
    },
    {
      key: "requester",
      header: t("booking.requester"),
      render: (row) => (
        <div className="space-y-0.5 text-xs">
          <span className="font-semibold text-foreground">{row.userName}</span>
          <p className="text-[11px] text-muted-foreground">{row.userEmail}</p>
          {row.contactPhone && (
            <p className="text-[11px] text-primary font-mono">{row.contactPhone}</p>
          )}
        </div>
      ),
    },
    {
      key: "timeRange",
      header: t("booking.startAt"),
      render: (row) => (
        <div className="space-y-0.5 text-xs">
          <div className="font-semibold text-foreground">
            {formatDate(row.startAt, locale)}
          </div>
          <div className="text-[11px] text-muted-foreground font-mono">
            {row.startAt.slice(11, 16)} - {row.endAt.slice(11, 16)} น.
          </div>
        </div>
      ),
    },
    {
      key: "attendees",
      header: t("booking.attendeesCount"),
      render: (row) => (
        <span className="text-xs font-semibold">{row.attendeesCount} คน</span>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("booking.nav")}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("booking.subtitle")} ({filteredBookings.length} รายการ)
          </p>
        </div>

        {canManage && (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setResCode("");
                setResNameTh("");
                setResNameEn("");
                setResType("ROOM");
                setResCapacity(30);
                setResLocation("");
                setResFacilities("");
                setResImageUrl("");
                setResRequiresApproval(true);
                setResIsActive(true);
                setResOrderSeq(0);
                setResourceDialogOpen(true);
              }}
              variant="outline"
              className="gap-1.5 text-xs"
            >
              <Plus className="h-4 w-4" />
              <span>เพิ่มห้อง/ยานพาหนะ</span>
            </Button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="ค้นหาเลขที่จอง, หัวข้อ, หรือผู้จอง..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border bg-background pl-8 pr-3 text-xs shadow-xs focus:outline-hidden"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-lg border bg-background px-3 text-xs shadow-xs focus:outline-hidden"
        >
          <option value="ALL">สถานะ: ทั้งหมด</option>
          <option value="PENDING">{t("booking.status.PENDING")}</option>
          <option value="APPROVED">{t("booking.status.APPROVED")}</option>
          <option value="REJECTED">{t("booking.status.REJECTED")}</option>
          <option value="CANCELLED">{t("booking.status.CANCELLED")}</option>
        </select>

        <select
          value={resourceFilter}
          onChange={(e) => setResourceFilter(e.target.value)}
          className="h-9 rounded-lg border bg-background px-3 text-xs shadow-xs focus:outline-hidden"
        >
          <option value="ALL">ห้อง/ยานพาหนะ: ทั้งหมด</option>
          {resourceList.map((r) => (
            <option key={r.id} value={r.id}>
              {locale === "en" ? r.nameEn : r.nameTh} ({r.code})
            </option>
          ))}
        </select>
      </div>

      {/* Main Table */}
      <LiyonCard>
        <DataTable<ResourceBookingDto>
          headHeading={<span>{t("booking.title")}</span>}
          state={filteredBookings.length === 0 ? "empty" : "data"}
          rows={filteredBookings}
          columns={columns}
          getRowId={(row) => row.id}
          renderRowMenu={
            canManage
              ? (row) => (
                  <>
                    {row.status === "PENDING" && (
                      <RowMenuItem
                        onSelect={() => handleApprove(row)}
                        icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                      >
                        {t("booking.approve")}
                      </RowMenuItem>
                    )}

                    {row.status === "PENDING" && (
                      <RowMenuItem
                        onSelect={() => {
                          setRejectItem(row);
                          setRejectReason("");
                        }}
                        danger
                        icon={<XCircle className="h-4 w-4 text-destructive" />}
                      >
                        {t("booking.reject")}
                      </RowMenuItem>
                    )}

                    {row.status === "APPROVED" && (
                      <RowMenuItem
                        onSelect={() => handleCancel(row)}
                        danger
                        icon={<Ban className="h-4 w-4" />}
                      >
                        {t("booking.cancel")}
                      </RowMenuItem>
                    )}
                  </>
                )
              : undefined
          }
          empty={{
            icon: <CalendarCheck className="h-10 w-10 text-muted-foreground/50" />,
            title: t("booking.empty"),
            description: t("booking.subtitle"),
          }}
          error={{
            icon: <AlertCircle className="h-10 w-10 text-destructive" />,
            title: t("common.error"),
          }}
        />
      </LiyonCard>

      {/* Rejection Modal */}
      <LiyonDialog open={!!rejectItem} onOpenChange={(open) => !open && setRejectItem(null)} danger>
        <LiyonDialogHeader
          title={t("booking.reject")}
          description={`คำขอจอง: ${rejectItem?.bookingNumber} (${rejectItem?.title})`}
        />
        <LiyonDialogBody className="space-y-4">
          <LiyonField label={t("booking.rejectionReason")} htmlFor="rejectReason">
            <textarea
              id="rejectReason"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="ระบุเหตุผลในการไม่อนุมัติ เช่น ห้องปิดปรับปรุงระบบไฟฟ้า หรือติดภารกิจด่วน"
              className="w-full rounded-lg border bg-background p-2.5 text-xs"
            />
          </LiyonField>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setRejectItem(null)}
            disabled={isPending}
            className="text-xs"
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirmReject}
            disabled={isPending}
            className="text-xs"
          >
            {isPending ? "กำลังปฏิเสธ..." : "ยืนยันไม่อนุมัติ"}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* Resource Creation Modal */}
      <LiyonDialog open={resourceDialogOpen} onOpenChange={setResourceDialogOpen} wide>
        <LiyonDialogHeader
          title="เพิ่มห้องประชุม หรือยานพาหนะใหม่"
          description="กำหนดรหัส ความจุ สถานที่ตั้ง และสิ่งอำนวยความสะดวก"
        />
        <LiyonDialogBody className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid gap-3 sm:grid-cols-3">
            <LiyonField label="ประเภท" htmlFor="resType">
              <select
                id="resType"
                value={resType}
                onChange={(e) => setResType(e.target.value as ResourceType)}
                className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
              >
                <option value="ROOM">ห้องประชุม / ห้องเรียน</option>
                <option value="VEHICLE">ยานพาหนะส่วนกลาง</option>
                <option value="EQUIPMENT">อุปกรณ์โสตทัศน์</option>
              </select>
            </LiyonField>

            <LiyonField label="รหัสทรัพยากร" htmlFor="resCode" hint="เช่น ROOM-802, VAN-02">
              <input
                id="resCode"
                type="text"
                value={resCode}
                onChange={(e) => setResCode(e.target.value.toUpperCase())}
                placeholder="e.g. ROOM-802"
                className="h-9 w-full rounded-lg border bg-background px-3 text-xs font-mono"
              />
            </LiyonField>

            <LiyonField label="ความจุ (ที่นั่ง)" htmlFor="resCapacity">
              <input
                id="resCapacity"
                type="number"
                value={resCapacity}
                onChange={(e) => setResCapacity(parseInt(e.target.value, 10) || 0)}
                className="h-9 w-full rounded-lg border bg-background px-3 text-xs font-mono"
              />
            </LiyonField>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <LiyonField label="ชื่อภาษาไทย" htmlFor="resNameTh">
              <input
                id="resNameTh"
                type="text"
                value={resNameTh}
                onChange={(e) => setResNameTh(e.target.value)}
                placeholder="เช่น ห้องประชุมวิชาการ IT-802"
                className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
              />
            </LiyonField>

            <LiyonField label="ชื่อภาษาอังกฤษ" htmlFor="resNameEn">
              <input
                id="resNameEn"
                type="text"
                value={resNameEn}
                onChange={(e) => setResNameEn(e.target.value)}
                placeholder="e.g. Academic Meeting Room IT-802"
                className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
              />
            </LiyonField>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <LiyonField label="สถานที่ตั้ง" htmlFor="resLocation">
              <input
                id="resLocation"
                type="text"
                value={resLocation}
                onChange={(e) => setResLocation(e.target.value)}
                placeholder="เช่น อาคาร 1 ชั้น 8"
                className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
              />
            </LiyonField>

            <LiyonField label="รูปถ่าย URL" htmlFor="resImageUrl">
              <input
                id="resImageUrl"
                type="url"
                value={resImageUrl}
                onChange={(e) => setResImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
              />
            </LiyonField>
          </div>

          <LiyonField label="สิ่งอำนวยความสะดวก" htmlFor="resFacilities" hint="คั่นด้วยเครื่องหมายจุลภาค (,)">
            <input
              id="resFacilities"
              type="text"
              value={resFacilities}
              onChange={(e) => setResFacilities(e.target.value)}
              placeholder="โปรเจกเตอร์ 4K, ไมโครโฟนไร้สาย, Video Conference, Wi-Fi"
              className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
            />
          </LiyonField>

          <div className="grid gap-4 sm:grid-cols-2">
            <LiyonSwitchRow
              id="resRequiresApproval"
              checked={resRequiresApproval}
              onCheckedChange={setResRequiresApproval}
              label="ต้องผ่านการอนุมัติก่อน"
              description="หากเปิดไว้ คำขอจองจะอยู่ในสถานะรออนุมัติ"
            />

            <LiyonSwitchRow
              id="resIsActive"
              checked={resIsActive}
              onCheckedChange={setResIsActive}
              label="เปิดพร้อมให้บริการ"
              description="แสดงในหน้าระบบจองและอนุญาตให้ยื่นคำขอ"
            />
          </div>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setResourceDialogOpen(false)}
            disabled={isPending}
            className="text-xs"
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            onClick={handleCreateResource}
            disabled={isPending}
            className="text-xs"
          >
            {isPending ? "กำลังบันทึก..." : "บันทึกทรัพยากร"}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}
