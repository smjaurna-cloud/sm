import { prisma } from "@/shared/lib/infra/prisma";
import { writeAudit, auth } from "@/features/identity/server";
import type {
  KpiStatus,
  CreateStrategicPlanInput,
  CreateStrategicPillarInput,
  CreateStrategicKpiInput,
  UpdateStrategicKpiInput,
  UpdateKpiActualInput,
} from "./validations";

export async function resolveCurrentTenantId(): Promise<string> {
  try {
    const session = await auth();
    if (session?.tenantId) return session.tenantId;
  } catch {
    // fallback below
  }
  const defaultTenant = await prisma.tenant.findFirst({
    where: { isActive: true },
    select: { id: true },
  });
  if (!defaultTenant) throw new Error("No active tenant found");
  return defaultTenant.id;
}

export interface StrategicKpiDto {
  id: string;
  tenantId: string;
  pillarId: string;
  pillarCode: string;
  pillarTitleTh: string;
  pillarTitleEn: string;
  code: string;
  nameTh: string;
  nameEn: string;
  targetValue: number;
  actualValue: number;
  unit: string;
  status: KpiStatus;
  achievementRate: number;
  period: string;
  createdAt: string;
  updatedAt: string;
}

export interface StrategicPillarDto {
  id: string;
  tenantId: string;
  planId: string;
  orderSeq: number;
  code: string;
  titleTh: string;
  titleEn: string;
  description: string | null;
  kpis: StrategicKpiDto[];
  achievementRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface StrategicPlanDto {
  id: string;
  tenantId: string;
  nameTh: string;
  nameEn: string;
  startYear: number;
  endYear: number;
  visionTh: string;
  visionEn: string;
  missionTh: string;
  missionEn: string;
  isActive: boolean;
  pillars: StrategicPillarDto[];
  totalKpis: number;
  overallAchievementRate: number;
  kpiStatusCounts: {
    onTrack: number;
    atRisk: number;
    offTrack: number;
    achieved: number;
  };
  createdAt: string;
  updatedAt: string;
}

function calculateAchievementRate(actual: number, target: number): number {
  if (target <= 0) return 0;
  const rate = (actual / target) * 100;
  return Number(Math.min(100, Math.max(0, rate)).toFixed(1));
}

function autoDeriveStatus(actual: number, target: number): KpiStatus {
  if (target <= 0) return "ON_TRACK";
  const ratio = actual / target;
  if (ratio >= 1.0) return "ACHIEVED";
  if (ratio >= 0.8) return "ON_TRACK";
  if (ratio >= 0.6) return "AT_RISK";
  return "OFF_TRACK";
}

export async function getActiveStrategicPlan(
  tenantId: string
): Promise<StrategicPlanDto | null> {
  const plan = await prisma.strategicPlan.findFirst({
    where: { tenantId, isActive: true },
    include: {
      pillars: {
        orderBy: { orderSeq: "asc" },
        include: {
          kpis: {
            orderBy: { code: "asc" },
          },
        },
      },
    },
  });

  if (!plan) return null;

  let totalKpis = 0;
  let sumKpiRates = 0;
  const statusCounts = {
    onTrack: 0,
    atRisk: 0,
    offTrack: 0,
    achieved: 0,
  };

  const pillarsDto: StrategicPillarDto[] = plan.pillars.map((pillar) => {
    let pillarRateSum = 0;
    const kpisDto: StrategicKpiDto[] = pillar.kpis.map((kpi) => {
      const rate = calculateAchievementRate(kpi.actualValue, kpi.targetValue);
      totalKpis += 1;
      sumKpiRates += rate;
      pillarRateSum += rate;

      if (kpi.status === "ACHIEVED") statusCounts.achieved += 1;
      else if (kpi.status === "ON_TRACK") statusCounts.onTrack += 1;
      else if (kpi.status === "AT_RISK") statusCounts.atRisk += 1;
      else if (kpi.status === "OFF_TRACK") statusCounts.offTrack += 1;

      return {
        id: kpi.id,
        tenantId: kpi.tenantId,
        pillarId: kpi.pillarId,
        pillarCode: pillar.code,
        pillarTitleTh: pillar.titleTh,
        pillarTitleEn: pillar.titleEn,
        code: kpi.code,
        nameTh: kpi.nameTh,
        nameEn: kpi.nameEn,
        targetValue: kpi.targetValue,
        actualValue: kpi.actualValue,
        unit: kpi.unit,
        status: kpi.status as KpiStatus,
        achievementRate: rate,
        period: kpi.period,
        createdAt: kpi.createdAt.toISOString(),
        updatedAt: kpi.updatedAt.toISOString(),
      };
    });

    const pillarAvgRate =
      pillar.kpis.length > 0 ? Number((pillarRateSum / pillar.kpis.length).toFixed(1)) : 0;

    return {
      id: pillar.id,
      tenantId: pillar.tenantId,
      planId: pillar.planId,
      orderSeq: pillar.orderSeq,
      code: pillar.code,
      titleTh: pillar.titleTh,
      titleEn: pillar.titleEn,
      description: pillar.description,
      kpis: kpisDto,
      achievementRate: pillarAvgRate,
      createdAt: pillar.createdAt.toISOString(),
      updatedAt: pillar.updatedAt.toISOString(),
    };
  });

  const overallRate =
    totalKpis > 0 ? Number((sumKpiRates / totalKpis).toFixed(1)) : 0;

  return {
    id: plan.id,
    tenantId: plan.tenantId,
    nameTh: plan.nameTh,
    nameEn: plan.nameEn,
    startYear: plan.startYear,
    endYear: plan.endYear,
    visionTh: plan.visionTh,
    visionEn: plan.visionEn,
    missionTh: plan.missionTh,
    missionEn: plan.missionEn,
    isActive: plan.isActive,
    pillars: pillarsDto,
    totalKpis,
    overallAchievementRate: overallRate,
    kpiStatusCounts: statusCounts,
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
  };
}

export async function listStrategicKpis(
  tenantId: string,
  planId?: string
): Promise<StrategicKpiDto[]> {
  const kpis = await prisma.strategicKpi.findMany({
    where: {
      tenantId,
      ...(planId ? { pillar: { planId } } : {}),
    },
    include: {
      pillar: { select: { code: true, titleTh: true, titleEn: true } },
    },
    orderBy: { code: "asc" },
  });

  return kpis.map((kpi) => {
    const rate = calculateAchievementRate(kpi.actualValue, kpi.targetValue);
    return {
      id: kpi.id,
      tenantId: kpi.tenantId,
      pillarId: kpi.pillarId,
      pillarCode: kpi.pillar.code,
      pillarTitleTh: kpi.pillar.titleTh,
      pillarTitleEn: kpi.pillar.titleEn,
      code: kpi.code,
      nameTh: kpi.nameTh,
      nameEn: kpi.nameEn,
      targetValue: kpi.targetValue,
      actualValue: kpi.actualValue,
      unit: kpi.unit,
      status: kpi.status as KpiStatus,
      achievementRate: rate,
      period: kpi.period,
      createdAt: kpi.createdAt.toISOString(),
      updatedAt: kpi.updatedAt.toISOString(),
    };
  });
}

export async function createStrategicPlan(
  tenantId: string,
  input: CreateStrategicPlanInput
): Promise<{ id: string }> {
  return await prisma.$transaction(async (tx) => {
    if (input.isActive) {
      await tx.strategicPlan.updateMany({
        where: { tenantId, isActive: true },
        data: { isActive: false },
      });
    }

    const created = await tx.strategicPlan.create({
      data: {
        tenantId,
        nameTh: input.nameTh.trim(),
        nameEn: input.nameEn.trim(),
        startYear: input.startYear,
        endYear: input.endYear,
        visionTh: input.visionTh.trim(),
        visionEn: input.visionEn.trim(),
        missionTh: input.missionTh.trim(),
        missionEn: input.missionEn.trim(),
        isActive: input.isActive,
      },
    });

    await writeAudit(
      {
        tenantId,
        actorId: null,
        action: "strategy.plan.create",
        entity: "strategic_plans",
        entityId: created.id,
        after: { nameTh: created.nameTh, startYear: created.startYear },
      },
      tx
    );

    return { id: created.id };
  });
}

export async function createStrategicPillar(
  tenantId: string,
  input: CreateStrategicPillarInput
): Promise<{ id: string }> {
  const created = await prisma.strategicPillar.create({
    data: {
      tenantId,
      planId: input.planId,
      code: input.code.trim(),
      titleTh: input.titleTh.trim(),
      titleEn: input.titleEn.trim(),
      description: input.description?.trim() ?? null,
      orderSeq: input.orderSeq,
    },
  });

  await writeAudit({
    tenantId,
    actorId: null,
    action: "strategy.pillar.create",
    entity: "strategic_pillars",
    entityId: created.id,
    after: { code: created.code, titleTh: created.titleTh },
  });

  return { id: created.id };
}

export async function createStrategicKpi(
  tenantId: string,
  input: CreateStrategicKpiInput
): Promise<StrategicKpiDto> {
  const created = await prisma.strategicKpi.create({
    data: {
      tenantId,
      pillarId: input.pillarId,
      code: input.code.trim(),
      nameTh: input.nameTh.trim(),
      nameEn: input.nameEn.trim(),
      targetValue: input.targetValue,
      actualValue: input.actualValue,
      unit: input.unit.trim(),
      status: input.status,
      period: input.period.trim(),
    },
    include: {
      pillar: { select: { code: true, titleTh: true, titleEn: true } },
    },
  });

  await writeAudit({
    tenantId,
    actorId: null,
    action: "strategy.kpi.create",
    entity: "strategic_kpis",
    entityId: created.id,
    after: { code: created.code, nameTh: created.nameTh },
  });

  const rate = calculateAchievementRate(created.actualValue, created.targetValue);
  return {
    id: created.id,
    tenantId: created.tenantId,
    pillarId: created.pillarId,
    pillarCode: created.pillar.code,
    pillarTitleTh: created.pillar.titleTh,
    pillarTitleEn: created.pillar.titleEn,
    code: created.code,
    nameTh: created.nameTh,
    nameEn: created.nameEn,
    targetValue: created.targetValue,
    actualValue: created.actualValue,
    unit: created.unit,
    status: created.status as KpiStatus,
    achievementRate: rate,
    period: created.period,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
  };
}

export async function updateKpiActual(
  tenantId: string,
  input: UpdateKpiActualInput
): Promise<StrategicKpiDto> {
  const existing = await prisma.strategicKpi.findUniqueOrThrow({
    where: { id: input.id, tenantId },
  });

  const status = input.status ?? autoDeriveStatus(input.actualValue, existing.targetValue);

  const updated = await prisma.strategicKpi.update({
    where: { id: input.id, tenantId },
    data: {
      actualValue: input.actualValue,
      status,
    },
    include: {
      pillar: { select: { code: true, titleTh: true, titleEn: true } },
    },
  });

  await writeAudit({
    tenantId,
    actorId: null,
    action: "strategy.kpi.updateActual",
    entity: "strategic_kpis",
    entityId: updated.id,
    after: {
      code: updated.code,
      oldActual: existing.actualValue,
      newActual: input.actualValue,
      status,
    },
  });

  const rate = calculateAchievementRate(updated.actualValue, updated.targetValue);
  return {
    id: updated.id,
    tenantId: updated.tenantId,
    pillarId: updated.pillarId,
    pillarCode: updated.pillar.code,
    pillarTitleTh: updated.pillar.titleTh,
    pillarTitleEn: updated.pillar.titleEn,
    code: updated.code,
    nameTh: updated.nameTh,
    nameEn: updated.nameEn,
    targetValue: updated.targetValue,
    actualValue: updated.actualValue,
    unit: updated.unit,
    status: updated.status as KpiStatus,
    achievementRate: rate,
    period: updated.period,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };
}

export async function updateStrategicKpi(
  tenantId: string,
  input: UpdateStrategicKpiInput
): Promise<StrategicKpiDto> {
  const updated = await prisma.strategicKpi.update({
    where: { id: input.id, tenantId },
    data: {
      code: input.code.trim(),
      nameTh: input.nameTh.trim(),
      nameEn: input.nameEn.trim(),
      targetValue: input.targetValue,
      actualValue: input.actualValue,
      unit: input.unit.trim(),
      status: input.status,
      period: input.period.trim(),
    },
    include: {
      pillar: { select: { code: true, titleTh: true, titleEn: true } },
    },
  });

  await writeAudit({
    tenantId,
    actorId: null,
    action: "strategy.kpi.update",
    entity: "strategic_kpis",
    entityId: updated.id,
    after: { code: updated.code, nameTh: updated.nameTh },
  });

  const rate = calculateAchievementRate(updated.actualValue, updated.targetValue);
  return {
    id: updated.id,
    tenantId: updated.tenantId,
    pillarId: updated.pillarId,
    pillarCode: updated.pillar.code,
    pillarTitleTh: updated.pillar.titleTh,
    pillarTitleEn: updated.pillar.titleEn,
    code: updated.code,
    nameTh: updated.nameTh,
    nameEn: updated.nameEn,
    targetValue: updated.targetValue,
    actualValue: updated.actualValue,
    unit: updated.unit,
    status: updated.status as KpiStatus,
    achievementRate: rate,
    period: updated.period,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };
}

export async function deleteStrategicKpi(
  tenantId: string,
  id: string
): Promise<void> {
  const existing = await prisma.strategicKpi.findUniqueOrThrow({
    where: { id, tenantId },
  });

  await prisma.strategicKpi.delete({
    where: { id, tenantId },
  });

  await writeAudit({
    tenantId,
    actorId: null,
    action: "strategy.kpi.delete",
    entity: "strategic_kpis",
    entityId: id,
    before: { code: existing.code },
  });
}
