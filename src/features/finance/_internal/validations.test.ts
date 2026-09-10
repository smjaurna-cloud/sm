import { describe, it, expect } from "vitest";
import {
  createBudgetPlanSchema,
  updateBudgetPlanSchema,
  recordTransactionSchema,
} from "./validations";

describe("finance validations", () => {
  const validUuid = "a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d";
  const planUuid = "b2c3d4e5-f6a1-4b2c-9d3e-4f5a6b7c8d9e";

  it("validate createBudgetPlanSchema successfully with valid input", () => {
    const input = {
      fiscalYearId: validUuid,
      code: "PLAN-2569-01",
      nameTh: "โครงการพัฒนาระบบเทคโนโลยีสารสนเทศ",
      nameEn: "IT Infrastructure Development Project",
      category: "OPERATING" as const,
      allocatedAmount: 1500000,
    };
    const parsed = createBudgetPlanSchema.parse(input);
    expect(parsed.code).toBe("PLAN-2569-01");
    expect(parsed.allocatedAmount).toBe(1500000);
  });

  it("fails createBudgetPlanSchema when code is empty", () => {
    expect(() =>
      createBudgetPlanSchema.parse({
        fiscalYearId: validUuid,
        code: "",
        nameTh: "ทดสอบ",
        nameEn: "Test",
        allocatedAmount: 1000,
      })
    ).toThrow();
  });

  it("validate recordTransactionSchema successfully", () => {
    const input = {
      planId: planUuid,
      description: "จัดซื้อเซิร์ฟเวอร์สำรอง",
      amount: 450000,
      type: "EXPENSE" as const,
      referenceDoc: "PO-2569-0042",
    };
    const parsed = recordTransactionSchema.parse(input);
    expect(parsed.amount).toBe(450000);
    expect(parsed.type).toBe("EXPENSE");
  });

  it("validate updateBudgetPlanSchema requires valid id", () => {
    const input = {
      id: validUuid,
      code: "PLAN-2569-02",
      nameTh: "ปรับปรุงห้องปฏิบัติการ",
      nameEn: "Lab Upgrade",
      category: "INVESTMENT" as const,
      allocatedAmount: 2000000,
      orderSeq: 1,
    };
    const parsed = updateBudgetPlanSchema.parse(input);
    expect(parsed.id).toBe(validUuid);
  });
});
