import { prisma } from "@/shared/lib/infra/prisma";
import type { Prisma } from "@/generated/prisma";
import { writeAudit } from "@/features/identity/server";
import type {
  CreateCurriculumInput,
  UpdateCurriculumInput,
  DegreeLevel,
  StudyPlanItem,
} from "./validations";

export interface CurriculumDto {
  id: string;
  tenantId: string;
  departmentId: string;
  departmentNameTh: string;
  departmentNameEn: string;
  departmentCode: string;
  code: string;
  nameTh: string;
  nameEn: string;
  degreeTh: string;
  degreeEn: string;
  level: DegreeLevel;
  durationYears: number;
  totalCredits: number;
  tuitionFeePerTerm: string | null;
  language: string | null;
  descriptionTh: string | null;
  descriptionEn: string | null;
  careerOpportunities: string[];
  studyPlanStructure: StudyPlanItem[];
  coverImageUrl: string | null;
  brochureUrl: string | null;
  isActive: boolean;
  orderSeq: number;
  createdAt: string;
  updatedAt: string;
}


function mapCurriculum(item: {
  id: string;
  tenantId: string;
  departmentId: string;
  code: string;
  nameTh: string;
  nameEn: string;
  degreeTh: string;
  degreeEn: string;
  level: string;
  durationYears: number;
  totalCredits: number;
  tuitionFeePerTerm: string | null;
  language: string | null;
  descriptionTh: string | null;
  descriptionEn: string | null;
  careerOpportunities: unknown;
  studyPlanStructure: unknown;
  coverImageUrl: string | null;
  brochureUrl: string | null;
  isActive: boolean;
  orderSeq: number;
  createdAt: Date;
  updatedAt: Date;
  department: { nameTh: string; nameEn: string; code: string };
}): CurriculumDto {
  return {
    id: item.id,
    tenantId: item.tenantId,
    departmentId: item.departmentId,
    departmentNameTh: item.department.nameTh,
    departmentNameEn: item.department.nameEn,
    departmentCode: item.department.code,
    code: item.code,
    nameTh: item.nameTh,
    nameEn: item.nameEn,
    degreeTh: item.degreeTh,
    degreeEn: item.degreeEn,
    level: item.level as DegreeLevel,
    durationYears: item.durationYears,
    totalCredits: item.totalCredits,
    tuitionFeePerTerm: item.tuitionFeePerTerm,
    language: item.language,
    descriptionTh: item.descriptionTh,
    descriptionEn: item.descriptionEn,
    careerOpportunities: (Array.isArray(item.careerOpportunities)
      ? item.careerOpportunities
      : []) as string[],
    studyPlanStructure: (Array.isArray(item.studyPlanStructure)
      ? item.studyPlanStructure
      : []) as StudyPlanItem[],
    coverImageUrl: item.coverImageUrl,
    brochureUrl: item.brochureUrl,
    isActive: item.isActive,
    orderSeq: item.orderSeq,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

// -------------------------------------------------------------
// PUBLIC PORTAL QUERIES
// -------------------------------------------------------------

export async function getPublicCurriculums(
  tenantId: string,
  options: { level?: string; departmentId?: string; search?: string } = {}
): Promise<CurriculumDto[]> {
  const where: Prisma.CurriculumWhereInput = {
    tenantId,
    isActive: true,
    ...(options.level && options.level !== "ALL"
      ? { level: options.level as Prisma.EnumDegreeLevelFilter["equals"] }
      : {}),
    ...(options.departmentId ? { departmentId: options.departmentId } : {}),
    ...(options.search
      ? {
          OR: [
            { nameTh: { contains: options.search, mode: "insensitive" } },
            { nameEn: { contains: options.search, mode: "insensitive" } },
            { degreeTh: { contains: options.search, mode: "insensitive" } },
            { degreeEn: { contains: options.search, mode: "insensitive" } },
            { code: { contains: options.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const items = await prisma.curriculum.findMany({
    where,
    include: {
      department: { select: { nameTh: true, nameEn: true, code: true } },
    },
    orderBy: [{ orderSeq: "asc" }, { code: "asc" }],
  });

  return items.map(mapCurriculum);
}

export async function getPublicCurriculumById(
  tenantId: string,
  id: string
): Promise<CurriculumDto | null> {
  const item = await prisma.curriculum.findFirst({
    where: { tenantId, id, isActive: true },
    include: {
      department: { select: { nameTh: true, nameEn: true, code: true } },
    },
  });

  return item ? mapCurriculum(item) : null;
}

// -------------------------------------------------------------
// ADMIN MANAGEMENT
// -------------------------------------------------------------

export async function listAdminCurriculums(
  tenantId: string,
  options?: { level?: string; departmentId?: string; isActive?: boolean; search?: string }
): Promise<CurriculumDto[]> {
  const where: Prisma.CurriculumWhereInput = {
    tenantId,
    ...(options?.level && options.level !== "ALL"
      ? { level: options.level as Prisma.EnumDegreeLevelFilter["equals"] }
      : {}),
    ...(options?.departmentId ? { departmentId: options.departmentId } : {}),
    ...(options?.isActive !== undefined ? { isActive: options.isActive } : {}),
    ...(options?.search
      ? {
          OR: [
            { nameTh: { contains: options.search, mode: "insensitive" } },
            { nameEn: { contains: options.search, mode: "insensitive" } },
            { code: { contains: options.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const items = await prisma.curriculum.findMany({
    where,
    include: {
      department: { select: { nameTh: true, nameEn: true, code: true } },
    },
    orderBy: [{ orderSeq: "asc" }, { code: "asc" }],
  });

  return items.map(mapCurriculum);
}

export async function createCurriculum(
  tenantId: string,
  actorId: string | null,
  input: CreateCurriculumInput
): Promise<CurriculumDto> {
  const created = await prisma.$transaction(async (tx) => {
    const item = await tx.curriculum.create({
      data: {
        tenantId,
        departmentId: input.departmentId,
        code: input.code.trim().toUpperCase(),
        nameTh: input.nameTh.trim(),
        nameEn: input.nameEn.trim(),
        degreeTh: input.degreeTh.trim(),
        degreeEn: input.degreeEn.trim(),
        level: input.level,
        durationYears: input.durationYears,
        totalCredits: input.totalCredits,
        tuitionFeePerTerm: input.tuitionFeePerTerm || null,
        language: input.language || null,
        descriptionTh: input.descriptionTh || null,
        descriptionEn: input.descriptionEn || null,
        careerOpportunities: input.careerOpportunities,
        studyPlanStructure: input.studyPlanStructure,
        coverImageUrl: input.coverImageUrl || null,
        brochureUrl: input.brochureUrl || null,
        isActive: input.isActive,
        orderSeq: input.orderSeq,
      },
      include: {
        department: { select: { nameTh: true, nameEn: true, code: true } },
      },
    });

    await writeAudit(
      {
        tenantId,
        actorId,
        action: "curriculum.create",
        entity: "curriculum",
        entityId: item.id,
        before: null,
        after: item,
      },
      tx
    );

    return item;
  });

  return mapCurriculum(created);
}

export async function updateCurriculum(
  tenantId: string,
  actorId: string | null,
  input: UpdateCurriculumInput
): Promise<CurriculumDto> {
  const updated = await prisma.$transaction(async (tx) => {
    const existing = await tx.curriculum.findFirst({
      where: { tenantId, id: input.id },
    });
    if (!existing) throw new Error("not_found");

    const item = await tx.curriculum.update({
      where: { id: input.id },
      data: {
        departmentId: input.departmentId,
        code: input.code.trim().toUpperCase(),
        nameTh: input.nameTh.trim(),
        nameEn: input.nameEn.trim(),
        degreeTh: input.degreeTh.trim(),
        degreeEn: input.degreeEn.trim(),
        level: input.level,
        durationYears: input.durationYears,
        totalCredits: input.totalCredits,
        tuitionFeePerTerm: input.tuitionFeePerTerm || null,
        language: input.language || null,
        descriptionTh: input.descriptionTh || null,
        descriptionEn: input.descriptionEn || null,
        careerOpportunities: input.careerOpportunities,
        studyPlanStructure: input.studyPlanStructure,
        coverImageUrl: input.coverImageUrl || null,
        brochureUrl: input.brochureUrl || null,
        isActive: input.isActive,
        orderSeq: input.orderSeq,
      },
      include: {
        department: { select: { nameTh: true, nameEn: true, code: true } },
      },
    });

    await writeAudit(
      {
        tenantId,
        actorId,
        action: "curriculum.update",
        entity: "curriculum",
        entityId: item.id,
        before: existing,
        after: item,
      },
      tx
    );

    return item;
  });

  return mapCurriculum(updated);
}

export async function deleteCurriculum(
  tenantId: string,
  actorId: string | null,
  id: string
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.curriculum.findFirst({
      where: { tenantId, id },
    });
    if (!existing) throw new Error("not_found");

    await tx.curriculum.delete({ where: { id } });

    await writeAudit(
      {
        tenantId,
        actorId,
        action: "curriculum.delete",
        entity: "curriculum",
        entityId: id,
        before: existing,
        after: null,
      },
      tx
    );
  });
}
