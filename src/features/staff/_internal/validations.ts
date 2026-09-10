import { z } from "zod";

export const academicPositionEnum = z.enum([
  "PROFESSOR",
  "ASSOCIATE_PROFESSOR",
  "ASSISTANT_PROFESSOR",
  "LECTURER",
  "RESEARCHER",
  "OFFICER",
  "OTHER",
]);

export const educationItemSchema = z.object({
  degree: z.string(),
  field: z.string(),
  institution: z.string(),
  year: z.string().optional(),
});

export const createStaffSchema = z.object({
  departmentId: z.string().uuid("invalid_department"),
  userId: z.string().uuid().optional().nullable(),
  titleTh: z.string().min(1, "title_required").max(50),
  titleEn: z.string().min(1, "title_required").max(50),
  firstNameTh: z.string().min(1, "name_required").max(100),
  lastNameTh: z.string().min(1, "name_required").max(100),
  firstNameEn: z.string().min(1, "name_required").max(100),
  lastNameEn: z.string().min(1, "name_required").max(100),
  academicPosition: academicPositionEnum.default("LECTURER"),
  managementPositionTh: z.string().max(150).optional().nullable(),
  managementPositionEn: z.string().max(150).optional().nullable(),
  email: z
    .string()
    .email("invalid_email")
    .optional()
    .nullable()
    .or(z.literal("")),
  phoneExt: z.string().max(50).optional().nullable(),
  roomNumber: z.string().max(50).optional().nullable(),
  avatarUrl: z.string().max(500).optional().nullable().or(z.literal("")),
  educationHistory: z.array(educationItemSchema).default([]),
  expertise: z.array(z.string()).default([]),
  isExecutive: z.boolean().default(false),
  isActive: z.boolean().default(true),
  orderSeq: z.number().int().default(0),
});

export const updateStaffSchema = createStaffSchema.extend({
  id: z.string().uuid(),
});

export const createDepartmentSchema = z.object({
  code: z.string().min(1, "code_required").max(50),
  nameTh: z.string().min(1, "name_required").max(255),
  nameEn: z.string().min(1, "name_required").max(255),
  type: z.enum(["ACADEMIC", "ADMINISTRATIVE"]).default("ACADEMIC"),
  orderSeq: z.number().int().default(0),
});

export const updateDepartmentSchema = createDepartmentSchema.extend({
  id: z.string().uuid(),
});

export type EducationItem = z.infer<typeof educationItemSchema>;
export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
