import { z } from "zod";

export const documentPriorityEnum = z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]);

export const approvalStatusEnum = z.enum([
  "DRAFT",
  "SUBMITTED",
  "IN_REVIEW",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
]);

export const approvalActionEnum = z.enum([
  "SUBMIT",
  "REVIEW",
  "APPROVE",
  "REJECT",
  "REQUEST_CHANGE",
  "COMMENT",
]);

export const createRequestSchema = z.object({
  templateId: z.string().uuid().optional().nullable(),
  title: z.string().min(1, "title_required").max(500),
  departmentId: z.string().uuid().optional().nullable(),
  priority: documentPriorityEnum.default("NORMAL"),
  formData: z.record(z.string(), z.any()).default({}),
  attachmentUrls: z.array(z.string()).default([]),
});

export const approveRequestSchema = z.object({
  id: z.string().uuid(),
  comments: z.string().max(1000).optional().nullable(),
});

export const rejectRequestSchema = z.object({
  id: z.string().uuid(),
  comments: z.string().min(1, "comments_required").max(1000),
});

export const requestChangesSchema = z.object({
  id: z.string().uuid(),
  comments: z.string().min(1, "comments_required").max(1000),
});

export type DocumentPriority = z.infer<typeof documentPriorityEnum>;
export type ApprovalStatus = z.infer<typeof approvalStatusEnum>;
export type ApprovalAction = z.infer<typeof approvalActionEnum>;
export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type ApproveRequestInput = z.infer<typeof approveRequestSchema>;
export type RejectRequestInput = z.infer<typeof rejectRequestSchema>;
export type RequestChangesInput = z.infer<typeof requestChangesSchema>;
