import { describe, it, expect } from "vitest";
import {
  createBookingSchema,
  createResourceSchema,
  approveBookingSchema,
  rejectBookingSchema,
} from "./validations";

describe("booking validations", () => {
  const validBooking = {
    resourceId: "123e4567-e89b-12d3-a456-426614174000",
    title: "การประชุมเตรียมความพร้อมเปิดภาคการศึกษา",
    startAt: "2026-10-01T09:00:00.000Z",
    endAt: "2026-10-01T12:00:00.000Z",
    attendeesCount: 20,
    contactPhone: "081-234-5678",
    notes: "ต้องการโปรเจกเตอร์และไมค์ 2 ตัว",
  };

  it("validate createBookingSchema สำเร็จเมื่อข้อมูลถูกต้อง", () => {
    const result = createBookingSchema.parse(validBooking);
    expect(result.title).toBe("การประชุมเตรียมความพร้อมเปิดภาคการศึกษา");
    expect(result.attendeesCount).toBe(20);
  });

  it("validate createBookingSchema ล้มเมื่อเวลาเริ่มต้นหลังเวลาสิ้นสุด", () => {
    expect(() =>
      createBookingSchema.parse({
        ...validBooking,
        startAt: "2026-10-01T15:00:00.000Z",
        endAt: "2026-10-01T12:00:00.000Z",
      })
    ).toThrow();
  });

  it("validate createBookingSchema ล้มเมื่อไม่มีหัวข้อกิจกรรม", () => {
    expect(() =>
      createBookingSchema.parse({
        ...validBooking,
        title: "",
      })
    ).toThrow();
  });

  it("validate createResourceSchema สำเร็จสำหรับห้องประชุมใหม่", () => {
    const res = {
      code: "ROOM-801",
      nameTh: "ห้องสัมมนา 801",
      nameEn: "Seminar Room 801",
      type: "ROOM" as const,
      capacity: 80,
      location: "อาคาร 1 ชั้น 8",
      facilities: ["Projector", "Mic"],
      requiresApproval: true,
      isActive: true,
      orderSeq: 1,
    };
    expect(createResourceSchema.parse(res).code).toBe("ROOM-801");
  });

  it("validate approveBookingSchema และ rejectBookingSchema", () => {
    const id = "123e4567-e89b-12d3-a456-426614174001";
    expect(approveBookingSchema.parse({ id }).id).toBe(id);
    expect(rejectBookingSchema.parse({ id, reason: "ติดภารกิจอื่น" }).reason).toBe("ติดภารกิจอื่น");
  });
});
