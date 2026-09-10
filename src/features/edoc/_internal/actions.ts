"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission, requireSession } from "@/features/identity/server";
import { EDOC_P } from "../permissions";
import {
  createRequestSchema,
  approveRequestSchema,
  rejectRequestSchema,
  requestChangesSchema,
} from "./validations";
import {
  createApprovalRequest,
  approveApprovalRequest,
  rejectApprovalRequest,
  requestChangesApprovalRequest,
  type ApprovalRequestDto,
} from "./services";

export async function createRequestAction(
  input: unknown
): Promise<ActionResult<ApprovalRequestDto>> {
  return runAction(async () => {
    const session = await requireSession();
    const parsed = createRequestSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });
    const result = await createApprovalRequest(
      session.tenantId,
      session.userId,
      parsed
    );
    revalidatePath("/edoc");
    revalidatePath("/admin/edoc");
    return result;
  });
}

export async function approveRequestAction(
  input: unknown
): Promise<ActionResult<ApprovalRequestDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(EDOC_P.edocApprove);
    const parsed = approveRequestSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });
    const result = await approveApprovalRequest(
      ctx.tenantId,
      ctx.userId,
      parsed.id,
      parsed.comments
    );
    revalidatePath("/edoc");
    revalidatePath("/admin/edoc");
    return result;
  });
}

export async function rejectRequestAction(
  input: unknown
): Promise<ActionResult<ApprovalRequestDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(EDOC_P.edocApprove);
    const parsed = rejectRequestSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });
    const result = await rejectApprovalRequest(
      ctx.tenantId,
      ctx.userId,
      parsed.id,
      parsed.comments
    );
    revalidatePath("/edoc");
    revalidatePath("/admin/edoc");
    return result;
  });
}

export async function requestChangesAction(
  input: unknown
): Promise<ActionResult<ApprovalRequestDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(EDOC_P.edocApprove);
    const parsed = requestChangesSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });
    const result = await requestChangesApprovalRequest(
      ctx.tenantId,
      ctx.userId,
      parsed.id,
      parsed.comments
    );
    revalidatePath("/edoc");
    revalidatePath("/admin/edoc");
    return result;
  });
}
