import { requirePermission } from "@/features/identity/server";
import { STRATEGY_P } from "@/features/strategy";
import {
  getActiveStrategicPlan,
  listStrategicKpis,
} from "@/features/strategy/server";
import { AdminStrategyClient } from "./_components/strategy-client";

export default async function AdminStrategyPage() {
  const ctx = await requirePermission(STRATEGY_P.strategyRead);

  const [plan, kpis] = await Promise.all([
    getActiveStrategicPlan(ctx.tenantId),
    listStrategicKpis(ctx.tenantId),
  ]);

  const canManage = ctx.permissions.includes(STRATEGY_P.strategyManage);

  return (
    <AdminStrategyClient
      plan={plan}
      kpis={kpis}
      canManage={canManage}
    />
  );
}
