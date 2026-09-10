import { describe, it, expect } from "vitest";
import {
  createStaffSchema,
  updateStaffSchema,
  createDepartmentSchema,
} from "./validations";

describe("staff validations", () => {
  const sampleStaff = {
    departmentId: "123e4567-e89b-12d3-a456-426614174000",
    titleTh: "ศ.ดร.",
    titleEn: "Prof. Dr.",
    firstNameTh: "สมชาย",
    lastNameTh: "ใจดี",
    firstNameEn: "Somchai",
    lastNameEn: "Jaidee",
    academicPosition: "PROFESSOR" as const,
    managementPositionTh: "คณบดี",
    managementPositionEn: "Dean",
    email: "somchai@faculty.ac.th",
    phoneExt: "101",
    roomNumber: "IT-801",
    avatarUrl: "https://example.com/avatar.jpg",
    expertise: ["AI", "Cloud"],
    educationHistory: [
      { degree: "Ph.D.", field: "Computer Science", institution: "Stanford", year: "2010" },
    ],
    isExecutive: true,
    isActive: true,
    orderSeq: 1,
  };

  it("validate createStaffSchema สำเร็จเมื่อข้อมูลถูกต้องครบถ้วน", () => {
    const result = createStaffSchema.parse(sampleStaff);
    expect(result.firstNameTh).toBe("สมชาย");
    expect(result.expertise).toEqual(["AI", "Cloud"]);
    expect(result.educationHistory.length).toBe(1);
    expect(result.isExecutive).toBe(true);
  });

  it("validate createStaffSchema ล้มเมื่อ departmentId ไม่ใช่ UUID", () => {
    expect(() =>
      createStaffSchema.parse({
        ...sampleStaff,
        departmentId: "invalid-uuid",
      })
    ).toThrow();
  });

  it("validate createStaffSchema ล้มเมื่อไม่มีชื่อ-นามสกุล", () => {
    expect(() =>
      createStaffSchema.parse({
        ...sampleStaff,
        firstNameTh: "",
      })
    ).toThrow();
  });

  it("validate updateStaffSchema ต้องการ id ที่เป็น UUID", () => {
    const valid = {
      ...sampleStaff,
      id: "123e4567-e89b-12d3-a456-426614174001",
    };
    expect(updateStaffSchema.parse(valid).id).toBe("123e4567-e89b-12d3-a456-426614174001");
  });

  it("validate createDepartmentSchema สำเร็จสำหรับสังกัดใหม่", () => {
    const dept = {
      code: "CS",
      nameTh: "วิทยาการคอมพิวเตอร์",
      nameEn: "Computer Science",
      type: "ACADEMIC" as const,
      orderSeq: 1,
    };
    expect(createDepartmentSchema.parse(dept).code).toBe("CS");
  });
});
