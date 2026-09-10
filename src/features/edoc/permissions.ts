import type { PermissionDef } from "@/shared/lib/permission-def";

export const EDOC_P = {
  edocRead: "edoc:read",
  edocCreate: "edoc:create",
  edocApprove: "edoc:approve",
  edocManage: "edoc:manage",
} as const;

export const EDOC_PERMISSIONS: readonly PermissionDef[] = [
  { code: EDOC_P.edocRead, module: "edoc", action: "read" },
  { code: EDOC_P.edocCreate, module: "edoc", action: "create" },
  { code: EDOC_P.edocApprove, module: "edoc", action: "approve" },
  { code: EDOC_P.edocManage, module: "edoc", action: "manage" },
];
