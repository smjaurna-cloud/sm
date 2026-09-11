import { prisma } from "@/shared/lib/infra/prisma";
import type { Prisma } from "@/generated/prisma";
import { writeAudit } from "@/features/identity/server";
import type {
  CreateBookingInput,
  CreateResourceInput,
  UpdateResourceInput,
  ResourceType,
  BookingStatus,
} from "./validations";

export interface BookingResourceDto {
  id: string;
  tenantId: string;
  code: string;
  nameTh: string;
  nameEn: string;
  type: ResourceType;
  capacity: number;
  location: string | null;
  facilities: string[];
  imageUrl: string | null;
  requiresApproval: boolean;
  isActive: boolean;
  orderSeq: number;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceBookingDto {
  id: string;
  tenantId: string;
  resourceId: string;
  resourceNameTh: string;
  resourceNameEn: string;
  resourceCode: string;
  resourceType: ResourceType;
  userId: string;
  userName: string;
  userEmail: string;
  bookingNumber: string;
  title: string;
  startAt: string;
  endAt: string;
  attendeesCount: number;
  status: BookingStatus;
  contactPhone: string | null;
  notes: string | null;
  rejectionReason: string | null;
  approvedByName: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}


function mapResource(item: {
  id: string;
  tenantId: string;
  code: string;
  nameTh: string;
  nameEn: string;
  type: string;
  capacity: number;
  location: string | null;
  facilities: unknown;
  imageUrl: string | null;
  requiresApproval: boolean;
  isActive: boolean;
  orderSeq: number;
  createdAt: Date;
  updatedAt: Date;
}): BookingResourceDto {
  return {
    id: item.id,
    tenantId: item.tenantId,
    code: item.code,
    nameTh: item.nameTh,
    nameEn: item.nameEn,
    type: item.type as ResourceType,
    capacity: item.capacity,
    location: item.location,
    facilities: (Array.isArray(item.facilities) ? item.facilities : []) as string[],
    imageUrl: item.imageUrl,
    requiresApproval: item.requiresApproval,
    isActive: item.isActive,
    orderSeq: item.orderSeq,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

function mapBooking(item: {
  id: string;
  tenantId: string;
  resourceId: string;
  userId: string;
  bookingNumber: string;
  title: string;
  startAt: Date;
  endAt: Date;
  attendeesCount: number;
  status: string;
  contactPhone: string | null;
  notes: string | null;
  rejectionReason: string | null;
  approvedById: string | null;
  approvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  resource: { nameTh: string; nameEn: string; code: string; type: string };
  user: { name: string; email: string };
  approvedBy?: { name: string } | null;
}): ResourceBookingDto {
  return {
    id: item.id,
    tenantId: item.tenantId,
    resourceId: item.resourceId,
    resourceNameTh: item.resource.nameTh,
    resourceNameEn: item.resource.nameEn,
    resourceCode: item.resource.code,
    resourceType: item.resource.type as ResourceType,
    userId: item.userId,
    userName: item.user.name,
    userEmail: item.user.email,
    bookingNumber: item.bookingNumber,
    title: item.title,
    startAt: item.startAt.toISOString(),
    endAt: item.endAt.toISOString(),
    attendeesCount: item.attendeesCount,
    status: item.status as BookingStatus,
    contactPhone: item.contactPhone,
    notes: item.notes,
    rejectionReason: item.rejectionReason,
    approvedByName: item.approvedBy?.name ?? null,
    approvedAt: item.approvedAt ? item.approvedAt.toISOString() : null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

// -------------------------------------------------------------
// PUBLIC PORTAL QUERIES
// -------------------------------------------------------------

export async function getPublicBookingResources(
  tenantId: string,
  options?: { type?: string }
): Promise<BookingResourceDto[]> {
  const where: Prisma.BookingResourceWhereInput = {
    tenantId,
    isActive: true,
    ...(options?.type && options.type !== "ALL"
      ? { type: options.type as Prisma.EnumResourceTypeFilter["equals"] }
      : {}),
  };

  const items = await prisma.bookingResource.findMany({
    where,
    orderBy: [{ orderSeq: "asc" }, { code: "asc" }],
  });

  return items.map(mapResource);
}

export async function getPublicResourceSchedule(
  tenantId: string,
  resourceId?: string,
  startDate?: Date,
  endDate?: Date
): Promise<ResourceBookingDto[]> {
  const now = new Date();
  const start = startDate ?? new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const end = endDate ?? new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 23, 59, 59);

  const where: Prisma.ResourceBookingWhereInput = {
    tenantId,
    ...(resourceId ? { resourceId } : {}),
    status: { in: ["APPROVED", "PENDING"] },
    startAt: { gte: start },
    endAt: { lte: end },
  };

  const items = await prisma.resourceBooking.findMany({
    where,
    include: {
      resource: { select: { nameTh: true, nameEn: true, code: true, type: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: { startAt: "asc" },
  });

  return items.map(mapBooking);
}

// -------------------------------------------------------------
// BOOKING MUTATIONS
// -------------------------------------------------------------

export async function createBookingRequest(
  tenantId: string,
  userId: string,
  input: CreateBookingInput
): Promise<ResourceBookingDto> {
  const startAt = new Date(input.startAt);
  const endAt = new Date(input.endAt);

  return await prisma.$transaction(async (tx) => {
    const resource = await tx.bookingResource.findFirst({
      where: { tenantId, id: input.resourceId, isActive: true },
    });
    if (!resource) throw new Error("resource_not_found");

    // Conflict overlap check:
    const overlap = await tx.resourceBooking.findFirst({
      where: {
        tenantId,
        resourceId: input.resourceId,
        status: { in: ["APPROVED", "PENDING"] },
        startAt: { lt: endAt },
        endAt: { gt: startAt },
      },
    });

    if (overlap) {
      throw new Error("booking_overlap");
    }

    const count = await tx.resourceBooking.count({ where: { tenantId } });
    const bookingNumber = `BK-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

    const initialStatus = resource.requiresApproval ? "PENDING" : "APPROVED";

    const created = await tx.resourceBooking.create({
      data: {
        tenantId,
        resourceId: input.resourceId,
        userId,
        bookingNumber,
        title: input.title.trim(),
        startAt,
        endAt,
        attendeesCount: input.attendeesCount,
        status: initialStatus,
        contactPhone: input.contactPhone || null,
        notes: input.notes || null,
        approvedById: resource.requiresApproval ? null : userId,
        approvedAt: resource.requiresApproval ? null : new Date(),
      },
      include: {
        resource: { select: { nameTh: true, nameEn: true, code: true, type: true } },
        user: { select: { name: true, email: true } },
        approvedBy: { select: { name: true } },
      },
    });

    await writeAudit(
      {
        tenantId,
        actorId: userId,
        action: "booking.create",
        entity: "resource_booking",
        entityId: created.id,
        before: null,
        after: created,
      },
      tx
    );

    return mapBooking(created);
  });
}

export async function approveBooking(
  tenantId: string,
  actorId: string,
  id: string
): Promise<ResourceBookingDto> {
  return await prisma.$transaction(async (tx) => {
    const existing = await tx.resourceBooking.findFirst({
      where: { tenantId, id },
    });
    if (!existing) throw new Error("not_found");

    const updated = await tx.resourceBooking.update({
      where: { id },
      data: {
        status: "APPROVED",
        approvedById: actorId,
        approvedAt: new Date(),
      },
      include: {
        resource: { select: { nameTh: true, nameEn: true, code: true, type: true } },
        user: { select: { name: true, email: true } },
        approvedBy: { select: { name: true } },
      },
    });

    await writeAudit(
      {
        tenantId,
        actorId,
        action: "booking.approve",
        entity: "resource_booking",
        entityId: updated.id,
        before: existing,
        after: updated,
      },
      tx
    );

    return mapBooking(updated);
  });
}

export async function rejectBooking(
  tenantId: string,
  actorId: string,
  id: string,
  reason?: string | null
): Promise<ResourceBookingDto> {
  return await prisma.$transaction(async (tx) => {
    const existing = await tx.resourceBooking.findFirst({
      where: { tenantId, id },
    });
    if (!existing) throw new Error("not_found");

    const updated = await tx.resourceBooking.update({
      where: { id },
      data: {
        status: "REJECTED",
        rejectionReason: reason || null,
        approvedById: actorId,
        approvedAt: new Date(),
      },
      include: {
        resource: { select: { nameTh: true, nameEn: true, code: true, type: true } },
        user: { select: { name: true, email: true } },
        approvedBy: { select: { name: true } },
      },
    });

    await writeAudit(
      {
        tenantId,
        actorId,
        action: "booking.reject",
        entity: "resource_booking",
        entityId: updated.id,
        before: existing,
        after: updated,
      },
      tx
    );

    return mapBooking(updated);
  });
}

export async function cancelBooking(
  tenantId: string,
  actorId: string,
  id: string
): Promise<ResourceBookingDto> {
  return await prisma.$transaction(async (tx) => {
    const existing = await tx.resourceBooking.findFirst({
      where: { tenantId, id },
    });
    if (!existing) throw new Error("not_found");

    const updated = await tx.resourceBooking.update({
      where: { id },
      data: {
        status: "CANCELLED",
      },
      include: {
        resource: { select: { nameTh: true, nameEn: true, code: true, type: true } },
        user: { select: { name: true, email: true } },
        approvedBy: { select: { name: true } },
      },
    });

    await writeAudit(
      {
        tenantId,
        actorId,
        action: "booking.cancel",
        entity: "resource_booking",
        entityId: updated.id,
        before: existing,
        after: updated,
      },
      tx
    );

    return mapBooking(updated);
  });
}

// -------------------------------------------------------------
// ADMIN MANAGEMENT (RESOURCES & BOOKINGS)
// -------------------------------------------------------------

export async function listAdminBookings(
  tenantId: string,
  options?: { status?: string; resourceId?: string; search?: string }
): Promise<ResourceBookingDto[]> {
  const where: Prisma.ResourceBookingWhereInput = {
    tenantId,
    ...(options?.status && options.status !== "ALL"
      ? { status: options.status as Prisma.EnumBookingStatusFilter["equals"] }
      : {}),
    ...(options?.resourceId ? { resourceId: options.resourceId } : {}),
    ...(options?.search
      ? {
          OR: [
            { title: { contains: options.search, mode: "insensitive" } },
            { bookingNumber: { contains: options.search, mode: "insensitive" } },
            { user: { name: { contains: options.search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const items = await prisma.resourceBooking.findMany({
    where,
    include: {
      resource: { select: { nameTh: true, nameEn: true, code: true, type: true } },
      user: { select: { name: true, email: true } },
      approvedBy: { select: { name: true } },
    },
    orderBy: { startAt: "desc" },
  });

  return items.map(mapBooking);
}

export async function listAdminResources(tenantId: string): Promise<BookingResourceDto[]> {
  const items = await prisma.bookingResource.findMany({
    where: { tenantId },
    orderBy: [{ orderSeq: "asc" }, { code: "asc" }],
  });
  return items.map(mapResource);
}

export async function createResource(
  tenantId: string,
  actorId: string | null,
  input: CreateResourceInput
): Promise<BookingResourceDto> {
  const item = await prisma.$transaction(async (tx) => {
    const created = await tx.bookingResource.create({
      data: {
        tenantId,
        code: input.code.trim().toUpperCase(),
        nameTh: input.nameTh.trim(),
        nameEn: input.nameEn.trim(),
        type: input.type,
        capacity: input.capacity,
        location: input.location || null,
        facilities: input.facilities,
        imageUrl: input.imageUrl || null,
        requiresApproval: input.requiresApproval,
        isActive: input.isActive,
        orderSeq: input.orderSeq,
      },
    });

    await writeAudit(
      {
        tenantId,
        actorId,
        action: "booking_resource.create",
        entity: "booking_resource",
        entityId: created.id,
        before: null,
        after: created,
      },
      tx
    );

    return created;
  });

  return mapResource(item);
}

export async function updateResource(
  tenantId: string,
  actorId: string | null,
  input: UpdateResourceInput
): Promise<BookingResourceDto> {
  const item = await prisma.$transaction(async (tx) => {
    const existing = await tx.bookingResource.findFirst({
      where: { tenantId, id: input.id },
    });
    if (!existing) throw new Error("not_found");

    const updated = await tx.bookingResource.update({
      where: { id: input.id },
      data: {
        code: input.code.trim().toUpperCase(),
        nameTh: input.nameTh.trim(),
        nameEn: input.nameEn.trim(),
        type: input.type,
        capacity: input.capacity,
        location: input.location || null,
        facilities: input.facilities,
        imageUrl: input.imageUrl || null,
        requiresApproval: input.requiresApproval,
        isActive: input.isActive,
        orderSeq: input.orderSeq,
      },
    });

    await writeAudit(
      {
        tenantId,
        actorId,
        action: "booking_resource.update",
        entity: "booking_resource",
        entityId: updated.id,
        before: existing,
        after: updated,
      },
      tx
    );

    return updated;
  });

  return mapResource(item);
}

export async function deleteResource(
  tenantId: string,
  actorId: string | null,
  id: string
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.bookingResource.findFirst({
      where: { tenantId, id },
    });
    if (!existing) throw new Error("not_found");

    await tx.bookingResource.delete({ where: { id } });

    await writeAudit(
      {
        tenantId,
        actorId,
        action: "booking_resource.delete",
        entity: "booking_resource",
        entityId: id,
        before: existing,
        after: null,
      },
      tx
    );
  });
}
