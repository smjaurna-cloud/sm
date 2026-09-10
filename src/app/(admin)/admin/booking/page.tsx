import { requirePermission, hasPermission } from "@/features/identity/server";
import {
  BOOKING_P,
  listAdminBookings,
  listAdminResources,
} from "@/features/booking/server";
import { BookingAdminClient } from "./_components/booking-client";

export default async function AdminBookingPage() {
  const ctx = await requirePermission(BOOKING_P.bookingRead);

  const [bookings, resources] = await Promise.all([
    listAdminBookings(ctx.tenantId),
    listAdminResources(ctx.tenantId),
  ]);

  return (
    <BookingAdminClient
      initialBookings={bookings}
      resources={resources}
      canManage={hasPermission(ctx, BOOKING_P.bookingManage)}
    />
  );
}
