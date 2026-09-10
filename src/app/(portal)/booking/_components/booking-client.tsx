"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  CalendarCheck,
  Clock,
  Users,
  MapPin,
  Sparkles,
  Building2,
  Calendar,
  LogIn,
  Send,
} from "lucide-react";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { formatDate } from "@/shared/lib/format";
import { Button } from "@/components/ui/button";
import {
  StatusPill,
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonField,
} from "@/shared/components/liyon";
import type { BookingResourceDto, ResourceBookingDto } from "@/features/booking";
import { createBookingAction } from "@/features/booking/actions";

export interface BookingPortalClientProps {
  resources: BookingResourceDto[];
  initialSchedules: ResourceBookingDto[];
  isLoggedIn: boolean;
  currentUser?: { name?: string | null; email?: string | null } | null;
}

export function BookingPortalClient({
  resources,
  initialSchedules,
  isLoggedIn,
  currentUser,
}: BookingPortalClientProps) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [selectedResource, setSelectedResource] = useState<BookingResourceDto | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formStartTime, setFormStartTime] = useState("09:00");
  const [formEndDate, setFormEndDate] = useState("");
  const [formEndTime, setFormEndTime] = useState("12:00");
  const [formAttendees, setFormAttendees] = useState(10);
  const [formPhone, setFormPhone] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const handleOpenBooking = (res: BookingResourceDto) => {
    setSelectedResource(res);
    // default date = tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split("T")[0] || "";
    setFormStartDate(dateStr);
    setFormEndDate(dateStr);
    setFormStartTime("09:00");
    setFormEndTime("12:00");
    setFormTitle("");
    setFormAttendees(Math.min(res.capacity, 20) || 5);
    setFormPhone("");
    setFormNotes("");
    setBookingDialogOpen(true);
  };

  const handleBookingSubmit = () => {
    if (!selectedResource) return;
    if (!formTitle.trim()) {
      toast.error("กรุณาระบุวัตถุประสงค์การใช้งาน / หัวข้อกิจกรรม");
      return;
    }
    if (!formStartDate || !formEndDate) {
      toast.error("กรุณาระบุวันที่เริ่มต้นและสิ้นสุด");
      return;
    }

    const startAtIso = new Date(`${formStartDate}T${formStartTime}:00`).toISOString();
    const endAtIso = new Date(`${formEndDate}T${formEndTime}:00`).toISOString();

    if (new Date(startAtIso).getTime() >= new Date(endAtIso).getTime()) {
      toast.error(t("booking.invalidTimeError"));
      return;
    }

    startTransition(async () => {
      const res = await createBookingAction({
        resourceId: selectedResource.id,
        title: formTitle,
        startAt: startAtIso,
        endAt: endAtIso,
        attendeesCount: Number(formAttendees) || 1,
        contactPhone: formPhone || null,
        notes: formNotes || null,
      });

      if (!res.ok) {
        if (res.error.message?.includes("booking_overlap")) {
          toast.error(t("booking.overlapError"));
        } else {
          toast.error(res.error.message || "เกิดข้อผิดพลาดในการส่งคำขอ");
        }
        return;
      }

      toast.success(`${t("booking.createSuccess")} (รหัส: ${res.data.bookingNumber})`);
      setBookingDialogOpen(false);
      router.refresh();
    });
  };

  const filteredResources = resources.filter((r) => {
    if (typeFilter !== "ALL" && r.type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-12">
      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b pb-4">
        {[
          { key: "ALL", label: t("booking.type.ALL") },
          { key: "ROOM", label: t("booking.type.ROOM") },
          { key: "VEHICLE", label: t("booking.type.VEHICLE") },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setTypeFilter(tab.key)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              typeFilter === tab.key
                ? "bg-primary text-primary-foreground shadow-xs"
                : "border bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Resource Cards Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {filteredResources.map((res) => {
          const resName = locale === "en" ? res.nameEn : res.nameTh;
          // Bookings for this resource
          const resSchedules = initialSchedules.filter((s) => s.resourceId === res.id);

          return (
            <div
              key={res.id}
              className="group flex flex-col overflow-hidden rounded-3xl border bg-card text-card-foreground shadow-xs transition hover:border-primary/40 hover:shadow-md"
            >
              {/* Photo */}
              <div className="relative aspect-video w-full overflow-hidden bg-muted">
                {res.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={res.imageUrl}
                    alt={resName}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <Building2 className="h-12 w-12 stroke-1" />
                  </div>
                )}

                <div className="absolute left-4 top-4 flex items-center gap-2">
                  <span className="rounded-md bg-primary/90 px-2.5 py-1 text-xs font-bold text-primary-foreground shadow-xs backdrop-blur-xs">
                    {t(`booking.type.${res.type}`)}
                  </span>
                  <span className="rounded-md bg-background/80 px-2 py-0.5 font-mono text-xs font-bold backdrop-blur-xs">
                    {res.code}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition">
                      {resName}
                    </h3>
                    {res.location && (
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <span>{res.location}</span>
                      </p>
                    )}
                  </div>

                  <div className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    <span>
                      {res.capacity} {t("portal.capacityPersons")}
                    </span>
                  </div>
                </div>

                {/* Facilities Badges */}
                {res.facilities && res.facilities.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {res.facilities.map((fac, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 rounded-lg border bg-muted/30 px-2.5 py-1 text-[11px] text-muted-foreground"
                      >
                        <Sparkles className="h-2.5 w-2.5 text-primary" />
                        <span>{fac}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Schedule preview */}
                <div className="mt-6 rounded-2xl border bg-muted/20 p-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground mb-3">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{t("portal.scheduleToday")}</span>
                  </div>

                  {resSchedules.length === 0 ? (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      ✓ {t("portal.noBookingsToday")}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {resSchedules.slice(0, 3).map((sc) => (
                        <div
                          key={sc.id}
                          className="flex items-center justify-between rounded-lg border bg-background p-2.5 text-xs"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <p className="truncate font-semibold text-foreground">
                              {sc.title}
                            </p>
                            <span className="text-[11px] text-muted-foreground">
                              {formatDate(sc.startAt, locale)} | {sc.startAt.slice(11, 16)} - {sc.endAt.slice(11, 16)} น.
                            </span>
                          </div>
                          <StatusPill tone={sc.status === "APPROVED" ? "ok" : "warn"}>
                            {t(`booking.status.${sc.status}`)}
                          </StatusPill>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action button */}
                <div className="mt-6 pt-4 border-t flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {res.requiresApproval ? "* ต้องรอเจ้าหน้าที่อนุมัติ" : "✓ อนุมัติการจองทันที"}
                  </span>

                  {isLoggedIn ? (
                    <Button
                      onClick={() => handleOpenBooking(res)}
                      className="gap-2 text-xs font-semibold shadow-xs"
                    >
                      <CalendarCheck className="h-4 w-4" />
                      <span>{t("portal.bookNow")}</span>
                    </Button>
                  ) : (
                    <Link
                      href="/login?callbackUrl=/booking"
                      className="inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-xs font-semibold shadow-xs hover:bg-muted transition"
                    >
                      <LogIn className="h-3.5 w-3.5" />
                      <span>{t("portal.loginToBook")}</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Booking Form Modal */}
      <LiyonDialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen} wide>
        <LiyonDialogHeader
          title={`แบบฟอร์มขอใช้บริการ: ${
            selectedResource
              ? locale === "en"
                ? selectedResource.nameEn
                : selectedResource.nameTh
              : ""
          }`}
          description="กรุณาระบุวัตถุประสงค์และช่วงเวลาที่ต้องการใช้งาน ระบบจะตรวจสอบความว่างอัตโนมัติ"
        />
        <LiyonDialogBody className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {/* Resource quick summary */}
          {selectedResource && (
            <div className="rounded-xl border bg-muted/30 p-3 text-xs flex items-center justify-between">
              <div>
                <span className="font-mono font-bold text-primary mr-2">
                  [{selectedResource.code}]
                </span>
                <span>{selectedResource.location}</span>
              </div>
              <span className="text-muted-foreground">
                ความจุสูงสุด {selectedResource.capacity} ที่นั่ง
              </span>
            </div>
          )}

          {/* Title / Purpose */}
          <LiyonField label={t("booking.purpose")} htmlFor="formTitle">
            <input
              id="formTitle"
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="เช่น การประชุมโครงการวิจัย AI, เวิร์กช็อปฝึกอบรม, สัมมนาภาควิชา"
              className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
            />
          </LiyonField>

          {/* Date & Time Selectors */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border p-3 space-y-2 bg-muted/10">
              <span className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                <span>เวลาเริ่มต้น</span>
              </span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                  className="h-8 rounded border bg-background px-2 text-xs"
                />
                <input
                  type="time"
                  value={formStartTime}
                  onChange={(e) => setFormStartTime(e.target.value)}
                  className="h-8 rounded border bg-background px-2 text-xs"
                />
              </div>
            </div>

            <div className="rounded-xl border p-3 space-y-2 bg-muted/10">
              <span className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span>เวลาสิ้นสุด</span>
              </span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={formEndDate}
                  onChange={(e) => setFormEndDate(e.target.value)}
                  className="h-8 rounded border bg-background px-2 text-xs"
                />
                <input
                  type="time"
                  value={formEndTime}
                  onChange={(e) => setFormEndTime(e.target.value)}
                  className="h-8 rounded border bg-background px-2 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Attendees & Phone */}
          <div className="grid gap-3 sm:grid-cols-2">
            <LiyonField label={t("booking.attendeesCount")} htmlFor="formAttendees">
              <input
                id="formAttendees"
                type="number"
                min={1}
                max={selectedResource?.capacity || 200}
                value={formAttendees}
                onChange={(e) => setFormAttendees(parseInt(e.target.value, 10) || 1)}
                className="h-9 w-full rounded-lg border bg-background px-3 text-xs font-mono"
              />
            </LiyonField>

            <LiyonField label={t("booking.contactPhone")} htmlFor="formPhone">
              <input
                id="formPhone"
                type="tel"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="เช่น 081-234-5678"
                className="h-9 w-full rounded-lg border bg-background px-3 text-xs"
              />
            </LiyonField>
          </div>

          {/* Notes */}
          <LiyonField label={t("booking.notes")} htmlFor="formNotes" hint="เช่น การจัดโต๊ะ, อุปกรณ์ไมค์ไร้สาย, ระบบ Zoom">
            <textarea
              id="formNotes"
              rows={3}
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="ระบุความต้องการเพิ่มเติมสำหรับเจ้าหน้าที่ดูแลห้อง/ยานพาหนะ"
              className="w-full rounded-lg border bg-background p-2.5 text-xs"
            />
          </LiyonField>

          {/* Current User Snippet */}
          {currentUser && (
            <p className="text-[11px] text-muted-foreground">
              ผู้ยื่นคำขอ: <span className="font-semibold text-foreground">{currentUser.name}</span> ({currentUser.email})
            </p>
          )}
        </LiyonDialogBody>

        <LiyonDialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setBookingDialogOpen(false)}
            disabled={isPending}
            className="text-xs"
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            onClick={handleBookingSubmit}
            disabled={isPending}
            className="gap-1.5 text-xs"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{isPending ? "กำลังตรวจสอบและส่งคำขอ..." : "ยืนยันการจอง"}</span>
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}
