import { requirePermission, hasPermission } from "@/features/identity/server";
import {
  CURRICULUM_P,
  listAdminCurriculums,
} from "@/features/curriculum/server";
import { getPublicDepartments } from "@/features/staff/server";
import { CurriculumAdminClient } from "./_components/curriculum-client";

export default async function AdminCurriculumPage() {
  const ctx = await requirePermission(CURRICULUM_P.curriculumRead);

  const [curriculums, departments] = await Promise.all([
    listAdminCurriculums(ctx.tenantId),
    getPublicDepartments(ctx.tenantId),
  ]);

  return (
    <CurriculumAdminClient
      initialCurriculums={curriculums}
      departments={departments}
      canManage={hasPermission(ctx, CURRICULUM_P.curriculumManage)}
    />
  );
}
