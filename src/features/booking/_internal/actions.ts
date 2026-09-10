"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission, requireSession } from "@/features/identity/server";
import { BOOKING_P } from "../permissions";
import {
  createBookingSchema,
  createResourceSchema,
  updateResourceSchema,
} from "./validations";
import {
  createBookingRequest,
  approveBooking,
  rejectBooking,
  cancelBooking,
  createResource,
  updateResource,
  deleteResource,
  type ResourceBookingDto,
  type BookingResourceDto,
} from "./services";

export async function createBookingAction(
  input: unknown
): Promise<ActionResult<ResourceBookingDto>> {
  return runAction(async () => {
    const session = await requireSession();
    const parsed = createBookingSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });
    const result = await createBookingRequest(session.tenantId, session.userId, parsed);
    revalidatePath("/booking");
    revalidatePath("/admin/booking");
    return result;
  });
}

export async function approveBookingAction(
  id: string
): Promise<ActionResult<ResourceBookingDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(BOOKING_P.bookingManage);
    const result = await approveBooking(ctx.tenantId, ctx.userId, id);
    revalidatePath("/booking");
    revalidatePath("/admin/booking");
    return result;
  });
}

export async function rejectBookingAction(
  id: string,
  reason?: string | null
): Promise<ActionResult<ResourceBookingDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(BOOKING_P.bookingManage);
    const result = await rejectBooking(ctx.tenantId, ctx.userId, id, reason);
    revalidatePath("/booking");
    revalidatePath("/admin/booking");
    return result;
  });
}

export async function cancelBookingAction(
  id: string
): Promise<ActionResult<ResourceBookingDto>> {
  return runAction(async () => {
    const session = await requireSession();
    const result = await cancelBooking(session.tenantId, session.userId, id);
    revalidatePath("/booking");
    revalidatePath("/admin/booking");
    return result;
  });
}

export async function createResourceAction(
  input: unknown
): Promise<ActionResult<BookingResourceDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(BOOKING_P.bookingManage);
    const parsed = createResourceSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });
    const result = await createResource(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/booking");
    revalidatePath("/admin/booking");
    return result;
  });
}

export async function updateResourceAction(
  input: unknown
): Promise<ActionResult<BookingResourceDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(BOOKING_P.bookingManage);
    const parsed = updateResourceSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });
    const result = await updateResource(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/booking");
    revalidatePath("/admin/booking");
    return result;
  });
}

export async function deleteResourceAction(
  id: string
): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(BOOKING_P.bookingManage);
    await deleteResource(ctx.tenantId, ctx.userId, id);
    revalidatePath("/booking");
    revalidatePath("/admin/booking");
  });
}
