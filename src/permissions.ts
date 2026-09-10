import type { PermissionDef } from "@/shared/lib/permission-def";
import { IDENTITY_PERMISSIONS } from "@/features/identity/permissions";
import { SAMPLE_PERMISSIONS } from "@/features/sample/permissions";
import { NEWS_PERMISSIONS } from "@/features/news/permissions";
import { STAFF_PERMISSIONS } from "@/features/staff/permissions";
import { CURRICULUM_PERMISSIONS } from "@/features/curriculum/permissions";
import { BOOKING_PERMISSIONS } from "@/features/booking/permissions";
import { RESEARCH_PERMISSIONS } from "@/features/research/permissions";
import { EDOC_PERMISSIONS } from "@/features/edoc/permissions";
import { FINANCE_PERMISSIONS } from "@/features/finance/permissions";
import { STRATEGY_PERMISSIONS } from "@/features/strategy/permissions";

/** สิทธิ์ทั้งระบบ — feature ใหม่เพิ่มบรรทัดที่นี่ · seed เขียนลง permissions ทุกครั้ง */
export const ALL_PERMISSIONS: readonly PermissionDef[] = [
  ...IDENTITY_PERMISSIONS,
  ...SAMPLE_PERMISSIONS,
  ...NEWS_PERMISSIONS,
  ...STAFF_PERMISSIONS,
  ...CURRICULUM_PERMISSIONS,
  ...BOOKING_PERMISSIONS,
  ...RESEARCH_PERMISSIONS,
  ...EDOC_PERMISSIONS,
  ...FINANCE_PERMISSIONS,
  ...STRATEGY_PERMISSIONS,
];

const codes = ALL_PERMISSIONS.map((p) => p.code);
if (new Set(codes).size !== codes.length) throw new Error("permission code ซ้ำใน ALL_PERMISSIONS");
