import { prisma } from "@/shared/lib/infra/prisma";
import type { Prisma } from "@/generated/prisma";
import { writeAudit, auth } from "@/features/identity/server";
import type {
  BudgetCategory,
  BudgetTxType,
  CreateBudgetPlanInput,
  UpdateBudgetPlanInput,
  RecordTransactionInput,
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

export interface FiscalYearDto {
  id: string;
  tenantId: string;
  year: number;
  totalBudget: number;
  allocatedBudget: number;
  spentBudget: number;
  remainingBudget: number;
  executionRate: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface BudgetPlanDto {
  id: string;
  tenantId: string;
  fiscalYearId: string;
  code: string;
  nameTh: string;
  nameEn: string;
  category: BudgetCategory;
  departmentId: string | null;
  departmentNameTh: string | null;
  departmentNameEn: string | null;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  executionRate: number;
  orderSeq: number;
  transactionsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetTransactionDto {
  id: string;
  tenantId: string;
  planId: string;
  planNameTh: string;
  planNameEn: string;
  description: string;
  amount: number;
  type: BudgetTxType;
  txDate: string;
  referenceDoc: string | null;
  recordedById: string;
  recordedByName: string;
  createdAt: string;
}

export interface CategoryStatDto {
  category: BudgetCategory;
  allocated: number;
  spent: number;
  executionRate: number;
}

export interface BudgetSummaryDto {
  fiscalYear: FiscalYearDto | null;
  totalBudget: number;
  allocatedBudget: number;
  spentBudget: number;
  remainingBudget: number;
  executionRate: number;
  categoryStats: CategoryStatDto[];
  recentTransactions: BudgetTransactionDto[];
}

function mapFiscalYearDto(item: {
  id: string;
  tenantId: string;
  year: number;
  totalBudget: Prisma.Decimal;
  allocatedBudget: Prisma.Decimal;
  spentBudget: Prisma.Decimal;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
}): FiscalYearDto {
  const total = item.totalBudget.toNumber();
  const allocated = item.allocatedBudget.toNumber();
  const spent = item.spentBudget.toNumber();
  const remaining = Math.max(0, total - spent);
  const executionRate = total > 0 ? Number(((spent / total) * 100).toFixed(2)) : 0;

  return {
    id: item.id,
    tenantId: item.tenantId,
    year: item.year,
    totalBudget: total,
    allocatedBudget: allocated,
    spentBudget: spent,
    remainingBudget: remaining,
    executionRate,
    startDate: item.startDate.toISOString(),
    endDate: item.endDate.toISOString(),
    isActive: item.isActive,
    createdAt: item.createdAt.toISOString(),
  };
}

export async function getActiveFiscalYear(tenantId: string): Promise<FiscalYearDto | null> {
  const year = await prisma.fiscalYear.findFirst({
    where: { tenantId, isActive: true },
    orderBy: { year: "desc" },
  });
  if (!year) return null;
  return mapFiscalYearDto(year);
}

export async function listFiscalYears(tenantId: string): Promise<FiscalYearDto[]> {
  const years = await prisma.fiscalYear.findMany({
    where: { tenantId },
    orderBy: { year: "desc" },
  });
  return years.map(mapFiscalYearDto);
}

export async function listBudgetPlans(
  tenantId: string,
  fiscalYearId?: string
): Promise<BudgetPlanDto[]> {
  let targetYearId = fiscalYearId;
  if (!targetYearId) {
    const activeYear = await prisma.fiscalYear.findFirst({
      where: { tenantId, isActive: true },
      orderBy: { year: "desc" },
      select: { id: true },
    });
    if (!activeYear) return [];
    targetYearId = activeYear.id;
  }

  const plans = await prisma.budgetPlan.findMany({
    where: { tenantId, fiscalYearId: targetYearId },
    include: {
      department: {
        select: { nameTh: true, nameEn: true },
      },
      _count: {
        select: { transactions: true },
      },
    },
    orderBy: [{ orderSeq: "asc" }, { code: "asc" }],
  });

  return plans.map((p) => {
    const allocated = p.allocatedAmount.toNumber();
    const spent = p.spentAmount.toNumber();
    const remaining = Math.max(0, allocated - spent);
    const executionRate = allocated > 0 ? Number(((spent / allocated) * 100).toFixed(2)) : 0;

    return {
      id: p.id,
      tenantId: p.tenantId,
      fiscalYearId: p.fiscalYearId,
      code: p.code,
      nameTh: p.nameTh,
      nameEn: p.nameEn,
      category: p.category as BudgetCategory,
      departmentId: p.departmentId,
      departmentNameTh: p.department?.nameTh ?? null,
      departmentNameEn: p.department?.nameEn ?? null,
      allocatedAmount: allocated,
      spentAmount: spent,
      remainingAmount: remaining,
      executionRate,
      orderSeq: p.orderSeq,
      transactionsCount: p._count.transactions,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    };
  });
}

export async function listRecentTransactions(
  tenantId: string,
  limit = 10
): Promise<BudgetTransactionDto[]> {
  const txs = await prisma.budgetTransaction.findMany({
    where: { tenantId },
    include: {
      plan: { select: { nameTh: true, nameEn: true } },
      recordedBy: { select: { name: true } },
    },
    orderBy: { txDate: "desc" },
    take: limit,
  });

  return txs.map((tx) => ({
    id: tx.id,
    tenantId: tx.tenantId,
    planId: tx.planId,
    planNameTh: tx.plan.nameTh,
    planNameEn: tx.plan.nameEn,
    description: tx.description,
    amount: tx.amount.toNumber(),
    type: tx.type as BudgetTxType,
    txDate: tx.txDate.toISOString(),
    referenceDoc: tx.referenceDoc,
    recordedById: tx.recordedById,
    recordedByName: tx.recordedBy.name,
    createdAt: tx.createdAt.toISOString(),
  }));
}

export async function getBudgetSummary(
  tenantId: string,
  fiscalYearId?: string
): Promise<BudgetSummaryDto> {
  const activeYear = fiscalYearId
    ? await prisma.fiscalYear.findFirst({ where: { id: fiscalYearId, tenantId } })
    : await prisma.fiscalYear.findFirst({
        where: { tenantId, isActive: true },
        orderBy: { year: "desc" },
      });

  if (!activeYear) {
    return {
      fiscalYear: null,
      totalBudget: 0,
      allocatedBudget: 0,
      spentBudget: 0,
      remainingBudget: 0,
      executionRate: 0,
      categoryStats: [],
      recentTransactions: [],
    };
  }

  const fiscalYearDto = mapFiscalYearDto(activeYear);
  const plans = await prisma.budgetPlan.findMany({
    where: { tenantId, fiscalYearId: activeYear.id },
  });

  const categories: BudgetCategory[] = [
    "PERSONNEL",
    "OPERATING",
    "INVESTMENT",
    "SUBSIDY",
    "OTHER",
  ];

  const categoryStats: CategoryStatDto[] = categories.map((cat) => {
    const catPlans = plans.filter((p) => p.category === cat);
    const allocated = catPlans.reduce((sum, p) => sum + p.allocatedAmount.toNumber(), 0);
    const spent = catPlans.reduce((sum, p) => sum + p.spentAmount.toNumber(), 0);
    const executionRate = allocated > 0 ? Number(((spent / allocated) * 100).toFixed(2)) : 0;
    return {
      category: cat,
      allocated,
      spent,
      executionRate,
    };
  });

  const recentTransactions = await listRecentTransactions(tenantId, 8);

  return {
    fiscalYear: fiscalYearDto,
    totalBudget: fiscalYearDto.totalBudget,
    allocatedBudget: fiscalYearDto.allocatedBudget,
    spentBudget: fiscalYearDto.spentBudget,
    remainingBudget: fiscalYearDto.remainingBudget,
    executionRate: fiscalYearDto.executionRate,
    categoryStats,
    recentTransactions,
  };
}

export async function createBudgetPlan(
  tenantId: string,
  input: CreateBudgetPlanInput
): Promise<BudgetPlanDto> {
  return await prisma.$transaction(async (tx) => {
    const created = await tx.budgetPlan.create({
      data: {
        tenantId,
        fiscalYearId: input.fiscalYearId,
        code: input.code.trim(),
        nameTh: input.nameTh.trim(),
        nameEn: input.nameEn.trim(),
        category: input.category,
        departmentId: input.departmentId ?? null,
        allocatedAmount: input.allocatedAmount,
        orderSeq: input.orderSeq,
      },
      include: {
        department: { select: { nameTh: true, nameEn: true } },
      },
    });

    // Update allocated budget in fiscal year
    await tx.fiscalYear.update({
      where: { id: input.fiscalYearId, tenantId },
      data: {
        allocatedBudget: {
          increment: input.allocatedAmount,
        },
      },
    });

    await writeAudit(
      {
        tenantId,
        actorId: null,
        action: "finance.plan.create",
        entity: "budget_plans",
        entityId: created.id,
        after: { code: created.code, nameTh: created.nameTh, amount: input.allocatedAmount },
      },
      tx
    );

    const allocated = created.allocatedAmount.toNumber();
    const spent = created.spentAmount.toNumber();

    return {
      id: created.id,
      tenantId: created.tenantId,
      fiscalYearId: created.fiscalYearId,
      code: created.code,
      nameTh: created.nameTh,
      nameEn: created.nameEn,
      category: created.category as BudgetCategory,
      departmentId: created.departmentId,
      departmentNameTh: created.department?.nameTh ?? null,
      departmentNameEn: created.department?.nameEn ?? null,
      allocatedAmount: allocated,
      spentAmount: spent,
      remainingAmount: Math.max(0, allocated - spent),
      executionRate: 0,
      orderSeq: created.orderSeq,
      transactionsCount: 0,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  });
}

export async function updateBudgetPlan(
  tenantId: string,
  input: UpdateBudgetPlanInput
): Promise<BudgetPlanDto> {
  return await prisma.$transaction(async (tx) => {
    const existing = await tx.budgetPlan.findUniqueOrThrow({
      where: { id: input.id, tenantId },
    });

    const diffAllocated = input.allocatedAmount - existing.allocatedAmount.toNumber();

    const updated = await tx.budgetPlan.update({
      where: { id: input.id, tenantId },
      data: {
        code: input.code.trim(),
        nameTh: input.nameTh.trim(),
        nameEn: input.nameEn.trim(),
        category: input.category,
        departmentId: input.departmentId ?? null,
        allocatedAmount: input.allocatedAmount,
        orderSeq: input.orderSeq,
      },
      include: {
        department: { select: { nameTh: true, nameEn: true } },
        _count: { select: { transactions: true } },
      },
    });

    if (diffAllocated !== 0) {
      await tx.fiscalYear.update({
        where: { id: existing.fiscalYearId, tenantId },
        data: {
          allocatedBudget: {
            increment: diffAllocated,
          },
        },
      });
    }

    await writeAudit(
      {
        tenantId,
        actorId: null,
        action: "finance.plan.update",
        entity: "budget_plans",
        entityId: updated.id,
        after: { code: updated.code, diffAllocated },
      },
      tx
    );

    const allocated = updated.allocatedAmount.toNumber();
    const spent = updated.spentAmount.toNumber();

    return {
      id: updated.id,
      tenantId: updated.tenantId,
      fiscalYearId: updated.fiscalYearId,
      code: updated.code,
      nameTh: updated.nameTh,
      nameEn: updated.nameEn,
      category: updated.category as BudgetCategory,
      departmentId: updated.departmentId,
      departmentNameTh: updated.department?.nameTh ?? null,
      departmentNameEn: updated.department?.nameEn ?? null,
      allocatedAmount: allocated,
      spentAmount: spent,
      remainingAmount: Math.max(0, allocated - spent),
      executionRate: allocated > 0 ? Number(((spent / allocated) * 100).toFixed(2)) : 0,
      orderSeq: updated.orderSeq,
      transactionsCount: updated._count.transactions,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  });
}

export async function deleteBudgetPlan(tenantId: string, id: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.budgetPlan.findUniqueOrThrow({
      where: { id, tenantId },
    });

    const allocated = existing.allocatedAmount.toNumber();
    const spent = existing.spentAmount.toNumber();

    await tx.budgetPlan.delete({
      where: { id, tenantId },
    });

    await tx.fiscalYear.update({
      where: { id: existing.fiscalYearId, tenantId },
      data: {
        allocatedBudget: { decrement: allocated },
        spentBudget: { decrement: spent },
      },
    });

    await writeAudit(
      {
        tenantId,
        actorId: null,
        action: "finance.plan.delete",
        entity: "budget_plans",
        entityId: id,
        before: { code: existing.code },
      },
      tx
    );
  });
}

export async function recordBudgetTransaction(
  tenantId: string,
  userId: string,
  input: RecordTransactionInput
): Promise<BudgetTransactionDto> {
  return await prisma.$transaction(async (tx) => {
    const plan = await tx.budgetPlan.findUniqueOrThrow({
      where: { id: input.planId, tenantId },
    });

    const created = await tx.budgetTransaction.create({
      data: {
        tenantId,
        planId: input.planId,
        description: input.description.trim(),
        amount: input.amount,
        type: input.type,
        txDate: input.txDate ? new Date(input.txDate) : new Date(),
        referenceDoc: input.referenceDoc?.trim() ?? null,
        recordedById: userId,
      },
      include: {
        plan: { select: { nameTh: true, nameEn: true, fiscalYearId: true } },
        recordedBy: { select: { name: true } },
      },
    });

    if (input.type === "EXPENSE") {
      await tx.budgetPlan.update({
        where: { id: input.planId, tenantId },
        data: { spentAmount: { increment: input.amount } },
      });
      await tx.fiscalYear.update({
        where: { id: plan.fiscalYearId, tenantId },
        data: { spentBudget: { increment: input.amount } },
      });
    }

    await writeAudit(
      {
        tenantId,
        actorId: userId,
        action: "finance.tx.record",
        entity: "budget_transactions",
        entityId: created.id,
        after: {
          planCode: plan.code,
          amount: input.amount,
          type: input.type,
        },
      },
      tx
    );

    return {
      id: created.id,
      tenantId: created.tenantId,
      planId: created.planId,
      planNameTh: created.plan.nameTh,
      planNameEn: created.plan.nameEn,
      description: created.description,
      amount: created.amount.toNumber(),
      type: created.type as BudgetTxType,
      txDate: created.txDate.toISOString(),
      referenceDoc: created.referenceDoc,
      recordedById: created.recordedById,
      recordedByName: created.recordedBy.name,
      createdAt: created.createdAt.toISOString(),
    };
  });
}
