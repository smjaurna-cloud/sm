import { z } from "zod";

export const researchStatusEnum = z.enum([
  "PROPOSED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]);

export const publicationTypeEnum = z.enum([
  "JOURNAL_INTERNATIONAL",
  "JOURNAL_NATIONAL",
  "CONFERENCE_INTERNATIONAL",
  "CONFERENCE_NATIONAL",
  "PATENT",
]);

export const createProjectSchema = z.object({
  code: z.string().min(1, "code_required").max(50),
  titleTh: z.string().min(1, "title_required").max(500),
  titleEn: z.string().min(1, "title_required").max(500),
  abstractTh: z.string().optional().nullable(),
  abstractEn: z.string().optional().nullable(),
  leaderId: z.string().uuid().optional().nullable(),
  leaderName: z.string().min(1, "leader_name_required").max(255),
  members: z.array(z.string()).default([]),
  departmentId: z.string().uuid().optional().nullable(),
  budget: z.number().min(0).optional().nullable(),
  fundingSource: z.string().max(255).optional().nullable(),
  startDate: z.string().min(1, "start_date_required"),
  endDate: z.string().optional().nullable(),
  status: researchStatusEnum.default("IN_PROGRESS"),
  coverImageUrl: z.string().max(500).optional().nullable().or(z.literal("")),
  outputFileUrl: z.string().max(500).optional().nullable().or(z.literal("")),
});

export const updateProjectSchema = createProjectSchema.extend({
  id: z.string().uuid(),
});

export const createPublicationSchema = z.object({
  projectId: z.string().uuid().optional().nullable(),
  title: z.string().min(1, "title_required").max(500),
  authors: z.string().min(1, "authors_required").max(500),
  journalOrConference: z.string().min(1, "journal_required").max(500),
  publicationType: publicationTypeEnum.default("JOURNAL_INTERNATIONAL"),
  tier: z.string().max(50).optional().nullable(),
  doi: z.string().max(255).optional().nullable(),
  year: z.number().int().min(1900).max(2100).default(2026),
  url: z.string().max(500).optional().nullable().or(z.literal("")),
});

export const updatePublicationSchema = createPublicationSchema.extend({
  id: z.string().uuid(),
});

export type ResearchStatus = z.infer<typeof researchStatusEnum>;
export type PublicationType = z.infer<typeof publicationTypeEnum>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreatePublicationInput = z.infer<typeof createPublicationSchema>;
export type UpdatePublicationInput = z.infer<typeof updatePublicationSchema>;
