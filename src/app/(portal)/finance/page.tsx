import { Metadata } from "next";
import {
  getBudgetSummary,
  listBudgetPlans,
  resolveCurrentTenantId,
} from "@/features/finance/server";
import { FinanceClient } from "./_components/finance-client";

export const metadata: Metadata = {
  title: "งบประมาณและการเงิน (Budget & Finance) | Faculty Web Platform",
  description: "แผนการจัดสรรงบประมาณ การติดตามการเบิกจ่าย และข้อมูลความโปร่งใสทางการเงินของคณะ",
};

export default async function FinancePortalPage() {
  const tenantId = await resolveCurrentTenantId();

  const [summary, plans] = await Promise.all([
    getBudgetSummary(tenantId),
    listBudgetPlans(tenantId),
  ]);

  return <FinanceClient summary={summary} plans={plans} />;
}
