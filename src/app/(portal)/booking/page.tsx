import { getT } from "@/i18n/server";
import { auth } from "@/features/identity/server";
import {
  getPublicBookingResources,
  getPublicResourceSchedule,
  resolveCurrentTenantId,
} from "@/features/booking/server";
import { CalendarCheck } from "lucide-react";
import { BookingPortalClient } from "./_components/booking-client";

export default async function BookingPortalPage() {
  const [t, session] = await Promise.all([
    getT(),
    auth().catch(() => null),
  ]);

  const tenantId = await resolveCurrentTenantId();

  const [resources, schedules] = await Promise.all([
    getPublicBookingResources(tenantId),
    getPublicResourceSchedule(tenantId),
  ]);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-10 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
          <CalendarCheck className="h-4 w-4" />
          <span>{t("booking.title")}</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          {t("booking.title")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          {t("booking.subtitle")}
        </p>
      </div>

      <BookingPortalClient
        resources={resources}
        initialSchedules={schedules}
        isLoggedIn={!!session?.user}
        currentUser={
          session?.user
            ? { name: session.user.name, email: session.user.email }
            : null
        }
      />
    </div>
  );
}
