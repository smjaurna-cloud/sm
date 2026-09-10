import "server-only";

export {
  getPublicCurriculums,
  getPublicCurriculumById,
  listAdminCurriculums,
  resolveCurrentTenantId,
  type CurriculumDto,
} from "./_internal/services";

export type { DegreeLevel, StudyPlanItem } from "./_internal/validations";
export { CURRICULUM_P, CURRICULUM_PERMISSIONS } from "./permissions";
