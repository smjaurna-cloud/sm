import type { BudgetCategory } from "./validations";

export interface CategoryStatItem {
  category: BudgetCategory;
  allocated: number;
  spent: number;
  executionRate: number;
}

/**
 * คำนวณร้อยละการเบิกจ่ายงบประมาณ (0.00% - 100.00%) ปัดทศนิยม 2 ตำแหน่ง
 */
export function calculateExecutionRate(spent: number, allocated: number): number {
  if (allocated <= 0) return 0;
  if (spent <= 0) return 0;
  const rate = (spent / allocated) * 100;
  return Number(rate.toFixed(2));
}

/**
 * คำนวณงบประมาณคงเหลือ (ไม่ติดลบ)
 */
export function calculateRemainingBudget(allocated: number, spent: number): number {
  return Math.max(0, allocated - spent);
}

/**
 * คำนวณสถิติงบประมาณแยกตาม 5 หมวดหมู่มาตรฐาน
 */
export function calculateCategoryStats(
  plans: { category: string; allocatedAmount: number; spentAmount: number }[]
): CategoryStatItem[] {
  const categories: BudgetCategory[] = [
    "PERSONNEL",
    "OPERATING",
    "INVESTMENT",
    "SUBSIDY",
    "OTHER",
  ];

  return categories.map((cat) => {
    const catPlans = plans.filter((p) => p.category === cat);
    const allocated = catPlans.reduce((sum, p) => sum + p.allocatedAmount, 0);
    const spent = catPlans.reduce((sum, p) => sum + p.spentAmount, 0);
    return {
      category: cat,
      allocated,
      spent,
      executionRate: calculateExecutionRate(spent, allocated),
    };
  });
}
