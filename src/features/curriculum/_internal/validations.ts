import { z } from "zod";

export const degreeLevelEnum = z.enum([
  "BACHELOR",
  "MASTER",
  "DOCTORAL",
  "CERTIFICATE",
]);

export const studyPlanItemSchema = z.object({
  groupName: z.string().min(1),
  credits: z.number().int().min(0),
  description: z.string().optional().nullable(),
});

export const createCurriculumSchema = z.object({
  departmentId: z.string().uuid("invalid_department"),
  code: z.string().min(1, "code_required").max(50),
  nameTh: z.string().min(1, "name_required").max(255),
  nameEn: z.string().min(1, "name_required").max(255),
  degreeTh: z.string().min(1, "degree_required").max(255),
  degreeEn: z.string().min(1, "degree_required").max(255),
  level: degreeLevelEnum.default("BACHELOR"),
  durationYears: z.number().int().min(1).default(4),
  totalCredits: z.number().int().min(1, "credits_required"),
  tuitionFeePerTerm: z.string().max(100).optional().nullable(),
  language: z.string().max(100).optional().nullable(),
  descriptionTh: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  careerOpportunities: z.array(z.string()).default([]),
  studyPlanStructure: z.array(studyPlanItemSchema).default([]),
  coverImageUrl: z.string().max(500).optional().nullable().or(z.literal("")),
  brochureUrl: z.string().max(500).optional().nullable().or(z.literal("")),
  isActive: z.boolean().default(true),
  orderSeq: z.number().int().default(0),
});

export const updateCurriculumSchema = createCurriculumSchema.extend({
  id: z.string().uuid(),
});

export type DegreeLevel = z.infer<typeof degreeLevelEnum>;
export type StudyPlanItem = z.infer<typeof studyPlanItemSchema>;
export type CreateCurriculumInput = z.infer<typeof createCurriculumSchema>;
export type UpdateCurriculumInput = z.infer<typeof updateCurriculumSchema>;
