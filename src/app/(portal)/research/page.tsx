import { Metadata } from "next";
import {
  listResearchProjects,
  listPublications,
  getResearchStats,
  resolveCurrentTenantId,
} from "@/features/research/server";
import { ResearchClient } from "./_components/research-client";

export const metadata: Metadata = {
  title: "งานวิจัยและนวัตกรรม (Research & Innovation) | Faculty Web Platform",
  description: "โครงการวิจัย ผลงานนวัตกรรม และบทความวิชาการตีพิมพ์ระดับนานาชาติของคณะ",
};

export default async function ResearchPortalPage() {
  const tenantId = await resolveCurrentTenantId();

  const [projects, publications, stats] = await Promise.all([
    listResearchProjects(tenantId),
    listPublications(tenantId),
    getResearchStats(tenantId),
  ]);

  return (
    <ResearchClient
      projects={projects}
      publications={publications}
      stats={stats}
    />
  );
}
