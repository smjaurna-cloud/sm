import { describe, it, expect } from "vitest";
import {
  createCurriculumSchema,
  updateCurriculumSchema,
  studyPlanItemSchema,
} from "./validations";

describe("curriculum validations", () => {
  const sampleCurriculum = {
    departmentId: "123e4567-e89b-12d3-a456-426614174000",
    code: "CS-BSC-2565",
    nameTh: "หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์",
    nameEn: "Bachelor of Science Program in Computer Science",
    degreeTh: "วท.บ. (วิทยาการคอมพิวเตอร์)",
    degreeEn: "B.S. (Computer Science)",
    level: "BACHELOR" as const,
    durationYears: 4,
    totalCredits: 128,
    tuitionFeePerTerm: "26,000 บาท/ภาคการศึกษา",
    language: "ภาษาไทย",
    descriptionTh: "รายละเอียดหลักสูตร",
    descriptionEn: "Program description",
    careerOpportunities: ["Software Engineer", "Data Scientist"],
    studyPlanStructure: [
      { groupName: "หมวดวิชาศึกษาทั่วไป", credits: 30, description: "ทักษะภาษาและดิจิทัล" },
    ],
    coverImageUrl: "https://example.com/cover.jpg",
    brochureUrl: "https://example.com/spec.pdf",
    isActive: true,
    orderSeq: 1,
  };

  it("validate createCurriculumSchema สำเร็จเมื่อข้อมูลถูกต้องครบถ้วน", () => {
    const result = createCurriculumSchema.parse(sampleCurriculum);
    expect(result.code).toBe("CS-BSC-2565");
    expect(result.level).toBe("BACHELOR");
    expect(result.totalCredits).toBe(128);
    expect(result.careerOpportunities).toEqual(["Software Engineer", "Data Scientist"]);
    expect(result.studyPlanStructure.length).toBe(1);
  });

  it("validate createCurriculumSchema ล้มเมื่อ departmentId ไม่ใช่ UUID", () => {
    expect(() =>
      createCurriculumSchema.parse({
        ...sampleCurriculum,
        departmentId: "invalid-uuid",
      })
    ).toThrow();
  });

  it("validate createCurriculumSchema ล้มเมื่อไม่มีชื่อหลักสูตร", () => {
    expect(() =>
      createCurriculumSchema.parse({
        ...sampleCurriculum,
        nameTh: "",
      })
    ).toThrow();
  });

  it("validate updateCurriculumSchema ต้องการ id ที่เป็น UUID", () => {
    const valid = {
      ...sampleCurriculum,
      id: "123e4567-e89b-12d3-a456-426614174001",
    };
    expect(updateCurriculumSchema.parse(valid).id).toBe("123e4567-e89b-12d3-a456-426614174001");
  });

  it("validate studyPlanItemSchema สำเร็จเมื่อข้อมูลถูกต้อง", () => {
    const item = { groupName: "หมวดวิชาเฉพาะ", credits: 84 };
    expect(studyPlanItemSchema.parse(item).groupName).toBe("หมวดวิชาเฉพาะ");
  });
});
