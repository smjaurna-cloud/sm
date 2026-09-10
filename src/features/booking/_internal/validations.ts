import { z } from "zod";

export const resourceTypeEnum = z.enum(["ROOM", "VEHICLE", "EQUIPMENT"]);

export const bookingStatusEnum = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
  "COMPLETED",
]);

export const createBookingSchema = z
  .object({
    resourceId: z.string().uuid("invalid_resource"),
    title: z.string().min(1, "purpose_required").max(255),
    startAt: z.string().datetime({ message: "invalid_start_time" }),
    endAt: z.string().datetime({ message: "invalid_end_time" }),
    attendeesCount: z.number().int().min(1).default(1),
    contactPhone: z.string().max(50).optional().nullable(),
    notes: z.string().optional().nullable(),
  })
  .refine(
    (data) => new Date(data.startAt).getTime() < new Date(data.endAt).getTime(),
    {
      message: "start_before_end",
      path: ["endAt"],
    }
  );

export const createResourceSchema = z.object({
  code: z.string().min(1, "code_required").max(50),
  nameTh: z.string().min(1, "name_required").max(255),
  nameEn: z.string().min(1, "name_required").max(255),
  type: resourceTypeEnum.default("ROOM"),
  capacity: z.number().int().min(0).default(0),
  location: z.string().max(255).optional().nullable(),
  facilities: z.array(z.string()).default([]),
  imageUrl: z.string().max(500).optional().nullable().or(z.literal("")),
  requiresApproval: z.boolean().default(true),
  isActive: z.boolean().default(true),
  orderSeq: z.number().int().default(0),
});

export const updateResourceSchema = createResourceSchema.extend({
  id: z.string().uuid(),
});

export const approveBookingSchema = z.object({
  id: z.string().uuid(),
});

export const rejectBookingSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().max(500).optional().nullable(),
});

export type ResourceType = z.infer<typeof resourceTypeEnum>;
export type BookingStatus = z.infer<typeof bookingStatusEnum>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
