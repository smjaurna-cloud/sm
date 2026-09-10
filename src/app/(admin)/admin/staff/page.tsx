import { requirePermission, hasPermission } from "@/features/identity/server";
import {
  STAFF_P,
  listAdminStaff,
  getPublicDepartments,
} from "@/features/staff/server";
import { StaffAdminClient } from "./_components/staff-client";

export default async function AdminStaffPage() {
  const ctx = await requirePermission(STAFF_P.staffRead);

  const [staff, departments] = await Promise.all([
    listAdminStaff(ctx.tenantId),
    getPublicDepartments(ctx.tenantId),
  ]);

  return (
    <StaffAdminClient
      initialStaff={staff}
      departments={departments}
      canManage={hasPermission(ctx, STAFF_P.staffManage)}
    />
  );
}
