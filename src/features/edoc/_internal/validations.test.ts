import { describe, it, expect } from "vitest";
import {
  createRequestSchema,
  approveRequestSchema,
  rejectRequestSchema,
  documentPriorityEnum,
  approvalStatusEnum,
} from "./validations";

describe("edoc validations", () => {
  it("validates a valid create request", () => {
    const valid = {
      title: "คำร้องขออนุมัติเดินทางไปปฏิบัติงานวิจัยภาคสนาม",
      priority: "HIGH" as const,
      formData: {
        destination: "จ.เชียงใหม่",
        purpose: "เก็บข้อมูลเซนเซอร์สภาพอากาศ",
      },
      attachmentUrls: ["https://example.com/proposal.pdf"],
    };
    const parsed = createRequestSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it("fails when required title is missing", () => {
    const invalid = {
      title: "",
    };
    const parsed = createRequestSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it("requires comments when rejecting a request", () => {
    const invalid = {
      id: "a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d",
      comments: "",
    };
    const parsed = rejectRequestSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);

    const valid = {
      id: "a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d",
      comments: "เอกสารไม่ครบถ้วน กรุณาแนบรายละเอียดงบประมาณ",
    };
    expect(rejectRequestSchema.safeParse(valid).success).toBe(true);
  });

  it("validates approve request schema", () => {
    const valid = {
      id: "a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d",
      comments: "อนุมัติเรียบร้อย",
    };
    expect(approveRequestSchema.safeParse(valid).success).toBe(true);
  });

  it("validates enums correctly", () => {
    expect(documentPriorityEnum.safeParse("URGENT").success).toBe(true);
    expect(approvalStatusEnum.safeParse("IN_REVIEW").success).toBe(true);
    expect(approvalStatusEnum.safeParse("INVALID").success).toBe(false);
  });
});
