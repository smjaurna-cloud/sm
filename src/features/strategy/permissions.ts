import type { PermissionDef } from "@/shared/lib/permission-def";

export const STRATEGY_P = {
  strategyRead: "strategy:read",
  strategyManage: "strategy:manage",
} as const;

export const STRATEGY_PERMISSIONS: readonly PermissionDef[] = [
  { code: STRATEGY_P.strategyRead, module: "strategy", action: "read" },
  { code: STRATEGY_P.strategyManage, module: "strategy", action: "manage" },
];
