import { describe, it, expect } from "vitest";
import {
  calculateExecutionRate,
  calculateRemainingBudget,
  calculateCategoryStats,
} from "./calculations";

describe("finance calculations", () => {
  describe("calculateExecutionRate", () => {
    it("returns 0 when allocated is zero or negative", () => {
      expect(calculateExecutionRate(100, 0)).toBe(0);
      expect(calculateExecutionRate(100, -500)).toBe(0);
    });

    it("returns 0 when spent is zero or negative", () => {
      expect(calculateExecutionRate(0, 1000)).toBe(0);
      expect(calculateExecutionRate(-50, 1000)).toBe(0);
    });

    it("calculates exact percentage with 2 decimal precision", () => {
      expect(calculateExecutionRate(500, 1000)).toBe(50);
      expect(calculateExecutionRate(24150000, 45000000)).toBe(53.67);
      expect(calculateExecutionRate(1, 3)).toBe(33.33);
    });
  });

  describe("calculateRemainingBudget", () => {
    it("returns remaining positive amount", () => {
      expect(calculateRemainingBudget(1000, 400)).toBe(600);
      expect(calculateRemainingBudget(5000000, 2000000)).toBe(3000000);
    });

    it("returns 0 when spent exceeds allocated (no negative balance)", () => {
      expect(calculateRemainingBudget(1000, 1500)).toBe(0);
    });
  });

  describe("calculateCategoryStats", () => {
    it("summarizes 5 standard budget categories properly", () => {
      const plans = [
        { category: "PERSONNEL", allocatedAmount: 20000000, spentAmount: 12000000 },
        { category: "OPERATING", allocatedAmount: 10000000, spentAmount: 6000000 },
        { category: "INVESTMENT", allocatedAmount: 8000000, spentAmount: 4000000 },
      ];

      const stats = calculateCategoryStats(plans);
      expect(stats).toHaveLength(5);

      const personnel = stats.find((s) => s.category === "PERSONNEL");
      expect(personnel?.allocated).toBe(20000000);
      expect(personnel?.spent).toBe(12000000);
      expect(personnel?.executionRate).toBe(60);

      const subsidy = stats.find((s) => s.category === "SUBSIDY");
      expect(subsidy?.allocated).toBe(0);
      expect(subsidy?.spent).toBe(0);
      expect(subsidy?.executionRate).toBe(0);
    });
  });
});
