import { describe, it, expect } from "vitest";
import {
  createProjectSchema,
  createPublicationSchema,
  researchStatusEnum,
  publicationTypeEnum,
} from "./validations";

describe("research validations", () => {
  it("validates a valid project schema", () => {
    const valid = {
      code: "RES-2026-001",
      titleTh: "ระบบตรวจจับโรคใบข้าวด้วย AI",
      titleEn: "Rice Leaf Disease Detection with AI",
      leaderName: "รศ.ดร.สมชาย ใจดี",
      startDate: "2026-01-01T00:00:00.000Z",
      status: "IN_PROGRESS" as const,
      budget: 250000,
      members: ["ดร.กานดา สุขใจ"],
    };
    const parsed = createProjectSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it("fails if required fields in project schema are missing", () => {
    const invalid = {
      code: "",
      titleTh: "",
    };
    const parsed = createProjectSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it("validates publication schema", () => {
    const valid = {
      title: "Deep Learning for Smart Agriculture",
      authors: "Somchai J., Kanda S.",
      journalOrConference: "IEEE Access",
      publicationType: "JOURNAL_INTERNATIONAL" as const,
      year: 2026,
      tier: "Q1",
    };
    const parsed = createPublicationSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it("verifies research status enum", () => {
    expect(researchStatusEnum.safeParse("IN_PROGRESS").success).toBe(true);
    expect(researchStatusEnum.safeParse("INVALID").success).toBe(false);
  });

  it("verifies publication type enum", () => {
    expect(publicationTypeEnum.safeParse("JOURNAL_INTERNATIONAL").success).toBe(true);
    expect(publicationTypeEnum.safeParse("INVALID").success).toBe(false);
  });
});
