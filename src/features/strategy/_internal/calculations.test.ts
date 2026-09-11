import { describe, it, expect } from "vitest";
import {
  calculateAchievementRate,
  autoDeriveStatus,
  calculatePillarAverage,
} from "./calculations";

describe("strategy calculations", () => {
  describe("calculateAchievementRate", () => {
    it("returns 0 when target is zero or negative", () => {
      expect(calculateAchievementRate(50, 0)).toBe(0);
      expect(calculateAchievementRate(50, -10)).toBe(0);
    });

    it("returns 0 when actual is zero or negative", () => {
      expect(calculateAchievementRate(0, 100)).toBe(0);
      expect(calculateAchievementRate(-10, 100)).toBe(0);
    });

    it("caps rate at 100.0% even if actual exceeds target", () => {
      expect(calculateAchievementRate(150, 100)).toBe(100);
      expect(calculateAchievementRate(250, 200)).toBe(100);
    });

    it("calculates exact percentage with 1 decimal precision", () => {
      expect(calculateAchievementRate(95, 100)).toBe(95);
      expect(calculateAchievementRate(87, 90)).toBe(96.7);
      expect(calculateAchievementRate(1, 3)).toBe(33.3);
    });
  });

  describe("autoDeriveStatus", () => {
    it("returns ACHIEVED when actual meets or exceeds target", () => {
      expect(autoDeriveStatus(100, 100)).toBe("ACHIEVED");
      expect(autoDeriveStatus(120, 100)).toBe("ACHIEVED");
    });

    it("returns ON_TRACK when ratio is between 80% and 99.9%", () => {
      expect(autoDeriveStatus(80, 100)).toBe("ON_TRACK");
      expect(autoDeriveStatus(99, 100)).toBe("ON_TRACK");
    });

    it("returns AT_RISK when ratio is between 60% and 79.9%", () => {
      expect(autoDeriveStatus(60, 100)).toBe("AT_RISK");
      expect(autoDeriveStatus(79, 100)).toBe("AT_RISK");
    });

    it("returns OFF_TRACK when ratio is below 60%", () => {
      expect(autoDeriveStatus(59, 100)).toBe("OFF_TRACK");
      expect(autoDeriveStatus(10, 100)).toBe("OFF_TRACK");
      expect(autoDeriveStatus(0, 100)).toBe("OFF_TRACK");
    });

    it("returns ON_TRACK when target is zero or invalid", () => {
      expect(autoDeriveStatus(0, 0)).toBe("ON_TRACK");
    });
  });

  describe("calculatePillarAverage", () => {
    it("returns 0 for empty array", () => {
      expect(calculatePillarAverage([])).toBe(0);
    });

    it("calculates average with 1 decimal precision", () => {
      expect(calculatePillarAverage([100, 80, 90])).toBe(90);
      expect(calculatePillarAverage([95.5, 87.3])).toBe(91.4);
    });
  });
});
