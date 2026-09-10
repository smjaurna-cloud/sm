import { requirePermission } from "@/features/identity/server";
import { EDOC_P } from "@/features/edoc";
import { listApprovalRequests } from "@/features/edoc/server";
import { AdminEdocClient } from "./_components/edoc-client";

export default async function AdminEdocPage() {
  const ctx = await requirePermission(EDOC_P.edocRead);

  const requests = await listApprovalRequests(ctx.tenantId);
  const canApprove = ctx.permissions.includes(EDOC_P.edocApprove);

  return (
    <AdminEdocClient
      requests={requests}
      canApprove={canApprove}
    />
  );
}
