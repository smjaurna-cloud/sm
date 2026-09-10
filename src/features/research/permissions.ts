import type { PermissionDef } from "@/shared/lib/permission-def";

export const RESEARCH_P = {
  researchRead: "research:read",
  researchCreate: "research:create",
  researchManage: "research:manage",
} as const;

export const RESEARCH_PERMISSIONS: readonly PermissionDef[] = [
  { code: RESEARCH_P.researchRead, module: "research", action: "read" },
  { code: RESEARCH_P.researchCreate, module: "research", action: "create" },
  { code: RESEARCH_P.researchManage, module: "research", action: "manage" },
];
