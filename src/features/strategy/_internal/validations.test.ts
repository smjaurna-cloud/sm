import { describe, it, expect } from "vitest";
import {
  createStrategicPlanSchema,
  createStrategicKpiSchema,
  updateKpiActualSchema,
} from "./validations";

describe("strategy validations", () => {
  const validUuid = "a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d";
  const pillarUuid = "b2c3d4e5-f6a1-4b2c-9d3e-4f5a6b7c8d9e";

  it("validate createStrategicPlanSchema successfully with valid input", () => {
    const input = {
      nameTh: "แผนยุทธศาสตร์การพัฒนาคณะ 5 ปี (พ.ศ. 2566-2570)",
      nameEn: "5-Year Faculty Strategic Development Plan (2023-2027)",
      startYear: 2566,
      endYear: 2570,
      visionTh: "คณะชั้นนำด้านนวัตกรรมและเทคโนโลยี",
      visionEn: "Leading Faculty in Innovation and Technology",
      missionTh: "ผลิตบัณฑิตคุณภาพสูงและสร้างงานวิจัยมูลค่าสูง",
      missionEn: "Produce high quality graduates and high value research",
    };
    const parsed = createStrategicPlanSchema.parse(input);
    expect(parsed.startYear).toBe(2566);
    expect(parsed.isActive).toBe(true);
  });

  it("validate createStrategicKpiSchema successfully", () => {
    const input = {
      pillarId: pillarUuid,
      code: "KPI-1.1",
      nameTh: "ร้อยละของผู้สำเร็จการศึกษาที่มีงานทำภายใน 1 ปี",
      nameEn: "Employment rate of graduates within 1 year",
      targetValue: 95.0,
      actualValue: 92.5,
      unit: "%",
      status: "ON_TRACK" as const,
      period: "2569",
    };
    const parsed = createStrategicKpiSchema.parse(input);
    expect(parsed.code).toBe("KPI-1.1");
    expect(parsed.targetValue).toBe(95.0);
  });

  it("validate updateKpiActualSchema with valid values", () => {
    const input = {
      id: validUuid,
      actualValue: 96.0,
      status: "ACHIEVED" as const,
    };
    const parsed = updateKpiActualSchema.parse(input);
    expect(parsed.actualValue).toBe(96.0);
    expect(parsed.status).toBe("ACHIEVED");
  });
});
