import "server-only";

export {
  getPublicDepartments,
  getPublicExecutiveBoard,
  getPublicStaffDirectory,
  getPublicStaffProfileById,
  listAdminStaff,
  resolveCurrentTenantId,
  type DepartmentDto,
  type StaffProfileDto,
} from "./_internal/services";

export { STAFF_P, STAFF_PERMISSIONS } from "./permissions";
