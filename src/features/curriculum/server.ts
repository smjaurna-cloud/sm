import "server-only";

export {
  getPublicCurriculums,
  getPublicCurriculumById,
  listAdminCurriculums,
  type CurriculumDto,
} from "./_internal/services";

export { resolveCurrentTenantId } from "@/features/identity/server";

export type { DegreeLevel, StudyPlanItem } from "./_internal/validations";
export { CURRICULUM_P, CURRICULUM_PERMISSIONS } from "./permissions";
