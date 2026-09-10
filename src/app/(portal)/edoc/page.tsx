import { Metadata } from "next";
import { auth } from "@/features/identity/server";
import {
  listApprovalRequests,
  listDocumentTemplates,
  getApprovalStats,
  resolveCurrentTenantId,
} from "@/features/edoc/server";
import { EdocClient } from "./_components/edoc-client";

export const metadata: Metadata = {
  title: "ระบบอนุมัติเอกสารและคำร้อง (E-Document & Approval) | Faculty Web Platform",
  description: "ยื่นคำร้อง ติดตามสถานะ และดำเนินการพิจารณาอนุมัติเอกสารอิเล็กทรอนิกส์ของคณะ",
};

export default async function EdocPortalPage() {
  const tenantId = await resolveCurrentTenantId();
  const session = await auth().catch(() => null);

  const [requests, templates, stats] = await Promise.all([
    listApprovalRequests(tenantId),
    listDocumentTemplates(tenantId),
    getApprovalStats(tenantId),
  ]);

  return (
    <EdocClient
      requests={requests}
      templates={templates}
      stats={stats}
      isLoggedIn={!!session?.user}
    />
  );
}
