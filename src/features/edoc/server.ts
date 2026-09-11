export {
  listDocumentTemplates,
  listApprovalRequests,
  getApprovalRequestById,
  getApprovalRequestByNumber,
  getApprovalStats,
} from "./_internal/services";

export { resolveCurrentTenantId } from "@/features/identity/server";
