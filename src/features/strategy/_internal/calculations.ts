import type { KpiStatus } from "./validations";

/**
 * คำนวณร้อยละความสำเร็จของตัวชี้วัด (0.0% - 100.0%) ปัดทศนิยม 1 ตำแหน่ง
 */
export function calculateAchievementRate(actual: number, target: number): number {
  if (target <= 0) return 0;
  if (actual <= 0) return 0;
  const rate = (actual / target) * 100;
  return Number(Math.min(100, Math.max(0, rate)).toFixed(1));
}

/**
 * กำหนดสถานะ KPI อัตโนมัติตามสัดส่วนผลงานจริงเทียบกับเป้าหมาย
 * - >= 100%: ACHIEVED (บรรลุเป้าหมาย)
 * - >= 80%: ON_TRACK (เป็นไปตามแผน)
 * - >= 60%: AT_RISK (มีความเสี่ยง)
 * - < 60%: OFF_TRACK (ไม่เป็นไปตามแผน)
 */
export function autoDeriveStatus(actual: number, target: number): KpiStatus {
  if (target <= 0) return "ON_TRACK";
  const ratio = actual / target;
  if (ratio >= 1.0) return "ACHIEVED";
  if (ratio >= 0.8) return "ON_TRACK";
  if (ratio >= 0.6) return "AT_RISK";
  return "OFF_TRACK";
}

/**
 * คำนวณร้อยละความสำเร็จเฉลี่ยของเสาหลักยุทธศาสตร์
 */
export function calculatePillarAverage(rates: number[]): number {
  if (rates.length === 0) return 0;
  const sum = rates.reduce((a, b) => a + b, 0);
  return Number((sum / rates.length).toFixed(1));
}
