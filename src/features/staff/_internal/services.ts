import { prisma } from "@/shared/lib/infra/prisma";
import type { Prisma } from "@/generated/prisma";
import { writeAudit, auth } from "@/features/identity/server";
import type {
  CreateStaffInput,
  UpdateStaffInput,
  CreateDepartmentInput,
  EducationItem,
} from "./validations";

export interface DepartmentDto {
  id: string;
  tenantId: string;
  code: string;
  nameTh: string;
  nameEn: string;
  type: "ACADEMIC" | "ADMINISTRATIVE";
  orderSeq: number;
  staffCount?: number;
}

export interface StaffProfileDto {
  id: string;
  tenantId: string;
  userId: string | null;
  departmentId: string;
  departmentNameTh: string;
  departmentNameEn: string;
  departmentCode: string;
  departmentType: "ACADEMIC" | "ADMINISTRATIVE";
  titleTh: string;
  titleEn: string;
  firstNameTh: string;
  lastNameTh: string;
  firstNameEn: string;
  lastNameEn: string;
  fullNameTh: string;
  fullNameEn: string;
  academicPosition: string;
  managementPositionTh: string | null;
  managementPositionEn: string | null;
  email: string | null;
  phoneExt: string | null;
  roomNumber: string | null;
  avatarUrl: string | null;
  educationHistory: EducationItem[];
  expertise: string[];
  isExecutive: boolean;
  isActive: boolean;
  orderSeq: number;
  createdAt: string;
  updatedAt: string;
}

export async function resolveCurrentTenantId(): Promise<string> {
  try {
    const session = await auth();
    if (session?.tenantId) return session.tenantId;
  } catch {
    // guest
  }
  const first = await prisma.tenant.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  return first?.id ?? "";
}

function mapStaff(item: {
  id: string;
  tenantId: string;
  userId: string | null;
  departmentId: string;
  titleTh: string;
  titleEn: string;
  firstNameTh: string;
  lastNameTh: string;
  firstNameEn: string;
  lastNameEn: string;
  academicPosition: string;
  managementPositionTh: string | null;
  managementPositionEn: string | null;
  email: string | null;
  phoneExt: string | null;
  roomNumber: string | null;
  avatarUrl: string | null;
  educationHistory: unknown;
  expertise: unknown;
  isExecutive: boolean;
  isActive: boolean;
  orderSeq: number;
  createdAt: Date;
  updatedAt: Date;
  department: { nameTh: string; nameEn: string; code: string; type: string };
}): StaffProfileDto {
  return {
    id: item.id,
    tenantId: item.tenantId,
    userId: item.userId,
    departmentId: item.departmentId,
    departmentNameTh: item.department.nameTh,
    departmentNameEn: item.department.nameEn,
    departmentCode: item.department.code,
    departmentType: item.department.type as "ACADEMIC" | "ADMINISTRATIVE",
    titleTh: item.titleTh,
    titleEn: item.titleEn,
    firstNameTh: item.firstNameTh,
    lastNameTh: item.lastNameTh,
    firstNameEn: item.firstNameEn,
    lastNameEn: item.lastNameEn,
    fullNameTh: `${item.titleTh} ${item.firstNameTh} ${item.lastNameTh}`.trim(),
    fullNameEn: `${item.titleEn} ${item.firstNameEn} ${item.lastNameEn}`.trim(),
    academicPosition: item.academicPosition,
    managementPositionTh: item.managementPositionTh,
    managementPositionEn: item.managementPositionEn,
    email: item.email,
    phoneExt: item.phoneExt,
    roomNumber: item.roomNumber,
    avatarUrl: item.avatarUrl,
    educationHistory: (Array.isArray(item.educationHistory) ? item.educationHistory : []) as EducationItem[],
    expertise: (Array.isArray(item.expertise) ? item.expertise : []) as string[],
    isExecutive: item.isExecutive,
    isActive: item.isActive,
    orderSeq: item.orderSeq,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

// -------------------------------------------------------------
// PUBLIC PORTAL QUERIES
// -------------------------------------------------------------

export async function getPublicDepartments(tenantId: string): Promise<DepartmentDto[]> {
  const depts = await prisma.department.findMany({
    where: { tenantId },
    include: {
      _count: { select: { staffProfiles: { where: { isActive: true } } } },
    },
    orderBy: { orderSeq: "asc" },
  });

  return depts.map((d) => ({
    id: d.id,
    tenantId: d.tenantId,
    code: d.code,
    nameTh: d.nameTh,
    nameEn: d.nameEn,
    type: d.type as "ACADEMIC" | "ADMINISTRATIVE",
    orderSeq: d.orderSeq,
    staffCount: d._count.staffProfiles,
  }));
}

export async function getPublicExecutiveBoard(tenantId: string): Promise<StaffProfileDto[]> {
  const items = await prisma.staffProfile.findMany({
    where: { tenantId, isExecutive: true, isActive: true },
    include: {
      department: { select: { nameTh: true, nameEn: true, code: true, type: true } },
    },
    orderBy: { orderSeq: "asc" },
  });
  return items.map(mapStaff);
}

export async function getPublicStaffDirectory(
  tenantId: string,
  options: { departmentId?: string; search?: string } = {}
): Promise<StaffProfileDto[]> {
  const where: Prisma.StaffProfileWhereInput = {
    tenantId,
    isActive: true,
    ...(options.departmentId ? { departmentId: options.departmentId } : {}),
    ...(options.search
      ? {
          OR: [
            { firstNameTh: { contains: options.search, mode: "insensitive" } },
            { lastNameTh: { contains: options.search, mode: "insensitive" } },
            { firstNameEn: { contains: options.search, mode: "insensitive" } },
            { lastNameEn: { contains: options.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const items = await prisma.staffProfile.findMany({
    where,
    include: {
      department: { select: { nameTh: true, nameEn: true, code: true, type: true } },
    },
    orderBy: [{ isExecutive: "desc" }, { orderSeq: "asc" }, { firstNameTh: "asc" }],
  });

  return items.map(mapStaff);
}

export async function getPublicStaffProfileById(
  tenantId: string,
  id: string
): Promise<StaffProfileDto | null> {
  const item = await prisma.staffProfile.findFirst({
    where: { tenantId, id, isActive: true },
    include: {
      department: { select: { nameTh: true, nameEn: true, code: true, type: true } },
    },
  });

  return item ? mapStaff(item) : null;
}

// -------------------------------------------------------------
// ADMIN MANAGEMENT
// -------------------------------------------------------------

export async function listAdminStaff(
  tenantId: string,
  options?: { departmentId?: string; isActive?: boolean; search?: string }
): Promise<StaffProfileDto[]> {
  const where: Prisma.StaffProfileWhereInput = {
    tenantId,
    ...(options?.departmentId ? { departmentId: options.departmentId } : {}),
    ...(options?.isActive !== undefined ? { isActive: options.isActive } : {}),
    ...(options?.search
      ? {
          OR: [
            { firstNameTh: { contains: options.search, mode: "insensitive" } },
            { lastNameTh: { contains: options.search, mode: "insensitive" } },
            { firstNameEn: { contains: options.search, mode: "insensitive" } },
            { lastNameEn: { contains: options.search, mode: "insensitive" } },
            { email: { contains: options.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const items = await prisma.staffProfile.findMany({
    where,
    include: {
      department: { select: { nameTh: true, nameEn: true, code: true, type: true } },
    },
    orderBy: [{ orderSeq: "asc" }, { firstNameTh: "asc" }],
  });

  return items.map(mapStaff);
}

export async function createStaffProfile(
  tenantId: string,
  actorId: string | null,
  input: CreateStaffInput
): Promise<StaffProfileDto> {
  const created = await prisma.staffProfile.create({
    data: {
      tenantId,
      departmentId: input.departmentId,
      userId: input.userId || null,
      titleTh: input.titleTh,
      titleEn: input.titleEn,
      firstNameTh: input.firstNameTh,
      lastNameTh: input.lastNameTh,
      firstNameEn: input.firstNameEn,
      lastNameEn: input.lastNameEn,
      academicPosition: input.academicPosition,
      managementPositionTh: input.managementPositionTh || null,
      managementPositionEn: input.managementPositionEn || null,
      email: input.email || null,
      phoneExt: input.phoneExt || null,
      roomNumber: input.roomNumber || null,
      avatarUrl: input.avatarUrl || null,
      educationHistory: input.educationHistory as unknown as Prisma.InputJsonValue,
      expertise: input.expertise as unknown as Prisma.InputJsonValue,
      isExecutive: input.isExecutive,
      isActive: input.isActive,
      orderSeq: input.orderSeq,
    },
    include: {
      department: { select: { nameTh: true, nameEn: true, code: true, type: true } },
    },
  });

  await writeAudit({
    tenantId,
    actorId,
    action: "staff.create",
    entity: "staff_profile",
    entityId: created.id,
    after: { nameTh: `${created.titleTh} ${created.firstNameTh} ${created.lastNameTh}`, departmentId: created.departmentId },
  });

  return mapStaff(created);
}

export async function updateStaffProfile(
  tenantId: string,
  actorId: string | null,
  input: UpdateStaffInput
): Promise<StaffProfileDto> {
  const current = await prisma.staffProfile.findUnique({ where: { id: input.id } });
  if (!current || current.tenantId !== tenantId) {
    throw new Error("staff_not_found");
  }

  const updated = await prisma.staffProfile.update({
    where: { id: input.id },
    data: {
      departmentId: input.departmentId,
      userId: input.userId || null,
      titleTh: input.titleTh,
      titleEn: input.titleEn,
      firstNameTh: input.firstNameTh,
      lastNameTh: input.lastNameTh,
      firstNameEn: input.firstNameEn,
      lastNameEn: input.lastNameEn,
      academicPosition: input.academicPosition,
      managementPositionTh: input.managementPositionTh || null,
      managementPositionEn: input.managementPositionEn || null,
      email: input.email || null,
      phoneExt: input.phoneExt || null,
      roomNumber: input.roomNumber || null,
      avatarUrl: input.avatarUrl || null,
      educationHistory: input.educationHistory as unknown as Prisma.InputJsonValue,
      expertise: input.expertise as unknown as Prisma.InputJsonValue,
      isExecutive: input.isExecutive,
      isActive: input.isActive,
      orderSeq: input.orderSeq,
    },
    include: {
      department: { select: { nameTh: true, nameEn: true, code: true, type: true } },
    },
  });

  await writeAudit({
    tenantId,
    actorId,
    action: "staff.update",
    entity: "staff_profile",
    entityId: updated.id,
    before: { nameTh: `${current.titleTh} ${current.firstNameTh} ${current.lastNameTh}`, isActive: current.isActive },
    after: { nameTh: `${updated.titleTh} ${updated.firstNameTh} ${updated.lastNameTh}`, isActive: updated.isActive },
  });

  return mapStaff(updated);
}

export async function deleteStaffProfile(
  tenantId: string,
  actorId: string | null,
  id: string
): Promise<void> {
  const current = await prisma.staffProfile.findUnique({ where: { id } });
  if (!current || current.tenantId !== tenantId) {
    throw new Error("staff_not_found");
  }

  await prisma.staffProfile.delete({ where: { id } });

  await writeAudit({
    tenantId,
    actorId,
    action: "staff.delete",
    entity: "staff_profile",
    entityId: id,
    before: { nameTh: `${current.titleTh} ${current.firstNameTh} ${current.lastNameTh}` },
  });
}

export async function createDepartment(
  tenantId: string,
  input: CreateDepartmentInput
): Promise<DepartmentDto> {
  const created = await prisma.department.create({
    data: {
      tenantId,
      code: input.code,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      type: input.type,
      orderSeq: input.orderSeq,
    },
  });

  return {
    id: created.id,
    tenantId: created.tenantId,
    code: created.code,
    nameTh: created.nameTh,
    nameEn: created.nameEn,
    type: created.type as "ACADEMIC" | "ADMINISTRATIVE",
    orderSeq: created.orderSeq,
  };
}
