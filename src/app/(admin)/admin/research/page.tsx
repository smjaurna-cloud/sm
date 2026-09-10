import { requirePermission } from "@/features/identity/server";
import { RESEARCH_P } from "@/features/research";
import {
  listResearchProjects,
  listPublications,
} from "@/features/research/server";
import { AdminResearchClient } from "./_components/research-client";

export default async function AdminResearchPage() {
  const ctx = await requirePermission(RESEARCH_P.researchRead);

  const [projects, publications] = await Promise.all([
    listResearchProjects(ctx.tenantId),
    listPublications(ctx.tenantId),
  ]);

  const canManage = ctx.permissions.includes(RESEARCH_P.researchManage);

  return (
    <AdminResearchClient
      projects={projects}
      publications={publications}
      canManage={canManage}
    />
  );
}
