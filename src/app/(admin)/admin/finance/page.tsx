import { requirePermission } from "@/features/identity/server";
import { FINANCE_P } from "@/features/finance";
import {
  getBudgetSummary,
  listBudgetPlans,
} from "@/features/finance/server";
import { AdminFinanceClient } from "./_components/finance-client";

export default async function AdminFinancePage() {
  const ctx = await requirePermission(FINANCE_P.financeRead);

  const [summary, plans] = await Promise.all([
    getBudgetSummary(ctx.tenantId),
    listBudgetPlans(ctx.tenantId),
  ]);

  const canManage = ctx.permissions.includes(FINANCE_P.financeManage);
  const canCreate = ctx.permissions.includes(FINANCE_P.financeCreate);

  return (
    <AdminFinanceClient
      summary={summary}
      plans={plans}
      canManage={canManage}
      canCreate={canCreate}
    />
  );
}
