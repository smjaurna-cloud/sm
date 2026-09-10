import type { PermissionDef } from "@/shared/lib/permission-def";

export const FINANCE_P = {
  financeRead: "finance:read",
  financeCreate: "finance:create",
  financeManage: "finance:manage",
} as const;

export const FINANCE_PERMISSIONS: readonly PermissionDef[] = [
  { code: FINANCE_P.financeRead, module: "finance", action: "read" },
  { code: FINANCE_P.financeCreate, module: "finance", action: "create" },
  { code: FINANCE_P.financeManage, module: "finance", action: "manage" },
];
