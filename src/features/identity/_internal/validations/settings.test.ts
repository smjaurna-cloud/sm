import { describe, it, expect } from "vitest";
import { updateSettingsSchema } from "./settings";

describe("updateSettingsSchema", () => {
  it("ยอมรับข้อมูลการตั้งค่าที่ถูกต้องเมื่อ logoUrl เป็นค่าว่าง", () => {
    const parsed = updateSettingsSchema.safeParse({
      nameTh: "มหาวิทยาลัยแห่งการเรียนรู้",
      nameEn: "University of Learning",
      logoUrl: "",
      palette: "blue",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.logoUrl).toBe("");
    }
  });

  it("ยอมรับ logoUrl ที่เป็น relative path เช่น /uploads/logos/...", () => {
    const parsed = updateSettingsSchema.safeParse({
      nameTh: "มหาวิทยาลัยแห่งการเรียนรู้",
      nameEn: "University of Learning",
      logoUrl: "/uploads/logos/logo-123-456.png",
      palette: "green",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.logoUrl).toBe("/uploads/logos/logo-123-456.png");
    }
  });

  it("ยอมรับ logoUrl ที่เป็น absolute URL (http / https)", () => {
    const parsed = updateSettingsSchema.safeParse({
      nameTh: "คณะวิทยาศาสตร์",
      nameEn: "Faculty of Science",
      logoUrl: "https://example.com/logo.svg",
      palette: "purple",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.logoUrl).toBe("https://example.com/logo.svg");
    }
  });

  it("ปฏิเสธ logoUrl ที่ไม่ใช่ URL หรือ path ที่ถูกต้อง", () => {
    const parsed = updateSettingsSchema.safeParse({
      nameTh: "คณะวิทยาศาสตร์",
      nameEn: "Faculty of Science",
      logoUrl: "not-a-valid-url-or-path",
      palette: "blue",
    });
    expect(parsed.success).toBe(false);
  });
});
