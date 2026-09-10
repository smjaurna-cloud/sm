import { z } from "zod";

export const kpiStatusEnum = z.enum([
  "ON_TRACK",
  "AT_RISK",
  "OFF_TRACK",
  "ACHIEVED",
]);
export type KpiStatus = z.infer<typeof kpiStatusEnum>;

export const createStrategicPlanSchema = z.object({
  nameTh: z.string().min(1).max(255),
  nameEn: z.string().min(1).max(255),
  startYear: z.number().int().min(2500).max(2700),
  endYear: z.number().int().min(2500).max(2700),
  visionTh: z.string().min(1),
  visionEn: z.string().min(1),
  missionTh: z.string().min(1),
  missionEn: z.string().min(1),
  isActive: z.boolean().default(true),
});
export type CreateStrategicPlanInput = z.infer<typeof createStrategicPlanSchema>;

export const createStrategicPillarSchema = z.object({
  planId: z.string().uuid(),
  code: z.string().min(1).max(20),
  titleTh: z.string().min(1).max(255),
  titleEn: z.string().min(1).max(255),
  description: z.string().optional().nullable(),
  orderSeq: z.number().int().default(0),
});
export type CreateStrategicPillarInput = z.infer<typeof createStrategicPillarSchema>;

export const createStrategicKpiSchema = z.object({
  pillarId: z.string().uuid(),
  code: z.string().min(1).max(50),
  nameTh: z.string().min(1).max(255),
  nameEn: z.string().min(1).max(255),
  targetValue: z.number().positive(),
  actualValue: z.number().default(0),
  unit: z.string().min(1).max(50),
  status: kpiStatusEnum.default("ON_TRACK"),
  period: z.string().min(1).max(50),
});
export type CreateStrategicKpiInput = z.infer<typeof createStrategicKpiSchema>;

export const updateStrategicKpiSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(1).max(50),
  nameTh: z.string().min(1).max(255),
  nameEn: z.string().min(1).max(255),
  targetValue: z.number().positive(),
  actualValue: z.number(),
  unit: z.string().min(1).max(50),
  status: kpiStatusEnum,
  period: z.string().min(1).max(50),
});
export type UpdateStrategicKpiInput = z.infer<typeof updateStrategicKpiSchema>;

export const updateKpiActualSchema = z.object({
  id: z.string().uuid(),
  actualValue: z.number(),
  status: kpiStatusEnum.optional(),
});
export type UpdateKpiActualInput = z.infer<typeof updateKpiActualSchema>;

export const deleteStrategicKpiSchema = z.object({
  id: z.string().uuid(),
});
export type DeleteStrategicKpiInput = z.infer<typeof deleteStrategicKpiSchema>;
