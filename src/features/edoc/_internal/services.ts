import { prisma } from "@/shared/lib/infra/prisma";
import type { Prisma } from "@/generated/prisma";
import { writeAudit, auth } from "@/features/identity/server";
import type {
  CreateRequestInput,
  DocumentPriority,
  ApprovalStatus,
  ApprovalAction,
} from "./validations";

export interface DocumentTemplateDto {
  id: string;
  tenantId: string;
  code: string;
  nameTh: string;
  nameEn: string;
  category: string;
  formFields: unknown[];
  isActive: boolean;
  orderSeq: number;
}

export interface ApprovalHistoryDto {
  id: string;
  requestId: string;
  actorId: string;
  actorName: string;
  action: ApprovalAction;
  comments: string | null;
  createdAt: string;
}

export interface ApprovalRequestDto {
  id: string;
  tenantId: string;
  requestNumber: string;
  templateId: string | null;
  templateNameTh: string | null;
  templateNameEn: string | null;
  title: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  departmentId: string | null;
  departmentNameTh: string | null;
  departmentNameEn: string | null;
  priority: DocumentPriority;
  formData: Record<string, unknown>;
  attachmentUrls: string[];
  status: ApprovalStatus;
  currentApproverId: string | null;
  currentApproverName: string | null;
  histories: ApprovalHistoryDto[];
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalStatsDto {
  totalRequests: number;
  submittedCount: number;
  inReviewCount: number;
  approvedCount: number;
  rejectedCount: number;
}

export async function resolveCurrentTenantId(): Promise<string> {
  try {
    const session = await auth();
    if (session?.tenantId) return session.tenantId;
  } catch {
    // fallback
  }
  const defaultTenant = await prisma.tenant.findFirst({
    where: { isActive: true },
    select: { id: true },
  });
  if (!defaultTenant) throw new Error("No active tenant found");
  return defaultTenant.id;
}

type RequestWithRelations = Prisma.ApprovalRequestGetPayload<{
  include: {
    template: { select: { nameTh: true; nameEn: true } };
    requester: { select: { name: true, email: true } };
    department: { select: { nameTh: true; nameEn: true } };
    currentApprover: { select: { name: true } };
    histories: {
      include: {
        actor: { select: { name: true } };
      };
      orderBy: { createdAt: "desc" };
    };
  };
}>;

function mapRequest(item: RequestWithRelations): ApprovalRequestDto {
  const formData =
    item.formData && typeof item.formData === "object"
      ? (item.formData as Record<string, unknown>)
      : {};
  const attachmentUrls = Array.isArray(item.attachmentUrls)
    ? (item.attachmentUrls as string[])
    : [];

  const histories: ApprovalHistoryDto[] = item.histories.map((h) => ({
    id: h.id,
    requestId: h.requestId,
    actorId: h.actorId,
    actorName: h.actor.name,
    action: h.action as ApprovalAction,
    comments: h.comments,
    createdAt: h.createdAt.toISOString(),
  }));

  return {
    id: item.id,
    tenantId: item.tenantId,
    requestNumber: item.requestNumber,
    templateId: item.templateId,
    templateNameTh: item.template?.nameTh ?? null,
    templateNameEn: item.template?.nameEn ?? null,
    title: item.title,
    requesterId: item.requesterId,
    requesterName: item.requester.name,
    requesterEmail: item.requester.email,
    departmentId: item.departmentId,
    departmentNameTh: item.department?.nameTh ?? null,
    departmentNameEn: item.department?.nameEn ?? null,
    priority: item.priority as DocumentPriority,
    formData,
    attachmentUrls,
    status: item.status as ApprovalStatus,
    currentApproverId: item.currentApproverId,
    currentApproverName: item.currentApprover?.name ?? null,
    histories,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export async function listDocumentTemplates(
  tenantId: string
): Promise<DocumentTemplateDto[]> {
  const items = await prisma.documentTemplate.findMany({
    where: { tenantId, isActive: true },
    orderBy: { orderSeq: "asc" },
  });

  return items.map((t) => ({
    id: t.id,
    tenantId: t.tenantId,
    code: t.code,
    nameTh: t.nameTh,
    nameEn: t.nameEn,
    category: t.category,
    formFields: Array.isArray(t.formFields) ? (t.formFields as unknown[]) : [],
    isActive: t.isActive,
    orderSeq: t.orderSeq,
  }));
}

export async function listApprovalRequests(
  tenantId: string,
  options?: {
    status?: ApprovalStatus;
    requesterId?: string;
    priority?: DocumentPriority;
    search?: string;
  }
): Promise<ApprovalRequestDto[]> {
  const where: Prisma.ApprovalRequestWhereInput = { tenantId };

  if (options?.status) {
    where.status = options.status;
  }
  if (options?.requesterId) {
    where.requesterId = options.requesterId;
  }
  if (options?.priority) {
    where.priority = options.priority;
  }
  if (options?.search) {
    const s = options.search.trim();
    where.OR = [
      { requestNumber: { contains: s, mode: "insensitive" } },
      { title: { contains: s, mode: "insensitive" } },
      { requester: { name: { contains: s, mode: "insensitive" } } },
    ];
  }

  const items = await prisma.approvalRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      template: { select: { nameTh: true, nameEn: true } },
      requester: { select: { name: true, email: true } },
      department: { select: { nameTh: true, nameEn: true } },
      currentApprover: { select: { name: true } },
      histories: {
        include: {
          actor: { select: { name: true } }
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return items.map(mapRequest);
}

export async function getApprovalRequestById(
  tenantId: string,
  id: string
): Promise<ApprovalRequestDto | null> {
  const item = await prisma.approvalRequest.findFirst({
    where: { tenantId, id },
    include: {
      template: { select: { nameTh: true, nameEn: true } },
      requester: { select: { name: true, email: true } },
      department: { select: { nameTh: true, nameEn: true } },
      currentApprover: { select: { name: true } },
      histories: {
        include: {
          actor: { select: { name: true } }
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  return item ? mapRequest(item) : null;
}

export async function getApprovalRequestByNumber(
  tenantId: string,
  requestNumber: string
): Promise<ApprovalRequestDto | null> {
  const item = await prisma.approvalRequest.findFirst({
    where: { tenantId, requestNumber: requestNumber.trim() },
    include: {
      template: { select: { nameTh: true, nameEn: true } },
      requester: { select: { name: true, email: true } },
      department: { select: { nameTh: true, nameEn: true } },
      currentApprover: { select: { name: true } },
      histories: {
        include: {
          actor: { select: { name: true } }
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  return item ? mapRequest(item) : null;
}

export async function getApprovalStats(tenantId: string): Promise<ApprovalStatsDto> {
  const items = await prisma.approvalRequest.findMany({
    where: { tenantId },
    select: { status: true },
  });

  return {
    totalRequests: items.length,
    submittedCount: items.filter((r) => r.status === "SUBMITTED").length,
    inReviewCount: items.filter((r) => r.status === "IN_REVIEW").length,
    approvedCount: items.filter((r) => r.status === "APPROVED").length,
    rejectedCount: items.filter((r) => r.status === "REJECTED").length,
  };
}

export async function createApprovalRequest(
  tenantId: string,
  requesterId: string,
  input: CreateRequestInput
): Promise<ApprovalRequestDto> {
  return await prisma.$transaction(async (tx) => {
    // Generate requestNumber: REQ-YYYY-XXXX
    const year = new Date().getFullYear();
    const count = await tx.approvalRequest.count({
      where: {
        tenantId,
        createdAt: {
          gte: new Date(year, 0, 1),
        },
      },
    });
    const seq = String(count + 1).padStart(4, "0");
    const requestNumber = `REQ-${year}-${seq}`;

    const created = await tx.approvalRequest.create({
      data: {
        tenantId,
        requestNumber,
        templateId: input.templateId || null,
        title: input.title,
        requesterId,
        departmentId: input.departmentId || null,
        priority: input.priority,
        formData: (input.formData as Prisma.InputJsonValue) ?? {},
        attachmentUrls: (input.attachmentUrls as Prisma.InputJsonValue) ?? [],
        status: "SUBMITTED",
      },
      include: {
        template: { select: { nameTh: true, nameEn: true } },
        requester: { select: { name: true, email: true } },
        department: { select: { nameTh: true, nameEn: true } },
        currentApprover: { select: { name: true } },
        histories: {
          include: { actor: { select: { name: true } } },
        },
      },
    });

    // Record initial history
    await tx.approvalHistory.create({
      data: {
        requestId: created.id,
        actorId: requesterId,
        action: "SUBMIT",
        comments: "ยื่นคำร้องเข้าสู่ระบบ",
      },
    });

    await writeAudit(
      {
        tenantId,
        actorId: requesterId,
        action: "edoc.request.create",
        entity: "approval_request",
        entityId: created.id,
        before: null,
        after: created,
      },
      tx
    );

    // Re-fetch with histories
    const full = await tx.approvalRequest.findUniqueOrThrow({
      where: { id: created.id },
      include: {
        template: { select: { nameTh: true, nameEn: true } },
        requester: { select: { name: true, email: true } },
        department: { select: { nameTh: true, nameEn: true } },
        currentApprover: { select: { name: true } },
        histories: {
          include: { actor: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return mapRequest(full);
  });
}

export async function approveApprovalRequest(
  tenantId: string,
  actorId: string,
  id: string,
  comments?: string | null
): Promise<ApprovalRequestDto> {
  return await prisma.$transaction(async (tx) => {
    const existing = await tx.approvalRequest.findFirst({
      where: { tenantId, id },
    });
    if (!existing) throw new Error("not_found");

    const updated = await tx.approvalRequest.update({
      where: { id },
      data: {
        status: "APPROVED",
        currentApproverId: actorId,
      },
      include: {
        template: { select: { nameTh: true, nameEn: true } },
        requester: { select: { name: true, email: true } },
        department: { select: { nameTh: true, nameEn: true } },
        currentApprover: { select: { name: true } },
        histories: {
          include: { actor: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    await tx.approvalHistory.create({
      data: {
        requestId: id,
        actorId,
        action: "APPROVE",
        comments: comments || "อนุมัติเรียบร้อย",
      },
    });

    await writeAudit(
      {
        tenantId,
        actorId,
        action: "edoc.request.approve",
        entity: "approval_request",
        entityId: id,
        before: existing,
        after: updated,
      },
      tx
    );

    const full = await tx.approvalRequest.findUniqueOrThrow({
      where: { id },
      include: {
        template: { select: { nameTh: true, nameEn: true } },
        requester: { select: { name: true, email: true } },
        department: { select: { nameTh: true, nameEn: true } },
        currentApprover: { select: { name: true } },
        histories: {
          include: { actor: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return mapRequest(full);
  });
}

export async function rejectApprovalRequest(
  tenantId: string,
  actorId: string,
  id: string,
  comments: string
): Promise<ApprovalRequestDto> {
  return await prisma.$transaction(async (tx) => {
    const existing = await tx.approvalRequest.findFirst({
      where: { tenantId, id },
    });
    if (!existing) throw new Error("not_found");

    const updated = await tx.approvalRequest.update({
      where: { id },
      data: {
        status: "REJECTED",
        currentApproverId: actorId,
      },
      include: {
        template: { select: { nameTh: true, nameEn: true } },
        requester: { select: { name: true, email: true } },
        department: { select: { nameTh: true, nameEn: true } },
        currentApprover: { select: { name: true } },
        histories: {
          include: { actor: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    await tx.approvalHistory.create({
      data: {
        requestId: id,
        actorId,
        action: "REJECT",
        comments,
      },
    });

    await writeAudit(
      {
        tenantId,
        actorId,
        action: "edoc.request.reject",
        entity: "approval_request",
        entityId: id,
        before: existing,
        after: updated,
      },
      tx
    );

    const full = await tx.approvalRequest.findUniqueOrThrow({
      where: { id },
      include: {
        template: { select: { nameTh: true, nameEn: true } },
        requester: { select: { name: true, email: true } },
        department: { select: { nameTh: true, nameEn: true } },
        currentApprover: { select: { name: true } },
        histories: {
          include: { actor: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return mapRequest(full);
  });
}

export async function requestChangesApprovalRequest(
  tenantId: string,
  actorId: string,
  id: string,
  comments: string
): Promise<ApprovalRequestDto> {
  return await prisma.$transaction(async (tx) => {
    const existing = await tx.approvalRequest.findFirst({
      where: { tenantId, id },
    });
    if (!existing) throw new Error("not_found");

    const updated = await tx.approvalRequest.update({
      where: { id },
      data: {
        status: "IN_REVIEW",
        currentApproverId: actorId,
      },
      include: {
        template: { select: { nameTh: true, nameEn: true } },
        requester: { select: { name: true, email: true } },
        department: { select: { nameTh: true, nameEn: true } },
        currentApprover: { select: { name: true } },
        histories: {
          include: { actor: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    await tx.approvalHistory.create({
      data: {
        requestId: id,
        actorId,
        action: "REQUEST_CHANGE",
        comments,
      },
    });

    await writeAudit(
      {
        tenantId,
        actorId,
        action: "edoc.request.request_change",
        entity: "approval_request",
        entityId: id,
        before: existing,
        after: updated,
      },
      tx
    );

    const full = await tx.approvalRequest.findUniqueOrThrow({
      where: { id },
      include: {
        template: { select: { nameTh: true, nameEn: true } },
        requester: { select: { name: true, email: true } },
        department: { select: { nameTh: true, nameEn: true } },
        currentApprover: { select: { name: true } },
        histories: {
          include: { actor: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return mapRequest(full);
  });
}
