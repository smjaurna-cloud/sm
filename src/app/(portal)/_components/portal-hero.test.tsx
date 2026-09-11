import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { PortalHero } from "./portal-hero";
import { I18nProvider } from "@/shared/lib/i18n/client";
import { UI_MESSAGES } from "@/i18n";

function renderHero() {
  return render(
    <I18nProvider locale="th" messages={UI_MESSAGES}>
      <PortalHero />
    </I18nProvider>
  );
}

describe("PortalHero", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("เรนเดอร์ป้ายกำกับด้านบนและพาดหัวหลักครบถ้วน", () => {
    renderHero();

    expect(
      screen.getByText("สถาบันชั้นนำด้านการศึกษา วิจัย และนวัตกรรมดิจิทัล")
    ).toBeTruthy();
    expect(screen.getByText("พัฒนาศักยภาพสู่อนาคต")).toBeTruthy();
    expect(
      screen.getByText("สร้างความสำเร็จของคุณอย่างแตกต่างแบบมืออาชีพ")
    ).toBeTruthy();
  });

  it("เรนเดอร์คำอธิบายและข้อมูลสายด่วน", () => {
    renderHero();

    expect(
      screen.getByText(
        "มุ่งสู่ความเป็นเลิศทางวิชาการและเทคโนโลยีขั้นสูง พร้อมมอบประสบการณ์การเรียนรู้และวิจัยที่ตอบโจทย์ยุคดิจิทัลในทุกมิติ"
      )
    ).toBeTruthy();
    expect(
      screen.getByText("สายด่วนข้อมูลการศึกษา: 0-2000-0000 ต่อ 101")
    ).toBeTruthy();
  });

  it("เรนเดอร์ปุ่ม CTA สำหรับสำรวจหลักสูตรและติดต่อสอบถาม", () => {
    renderHero();

    const curriculumBtn = screen.getByRole("link", {
      name: /สำรวจหลักสูตรการศึกษา/,
    });
    expect(curriculumBtn.getAttribute("href")).toBe("/curriculum");

    const contactBtn = screen.getByRole("link", {
      name: /ปรึกษาข้อมูลการศึกษาฟรี/,
    });
    expect(contactBtn.getAttribute("href")).toBe("/news");
  });

  it("เรนเดอร์แถบสโลแกน LEARN • INNOVATE • LEAD", () => {
    renderHero();

    expect(screen.getByText("LEARN • INNOVATE • LEAD")).toBeTruthy();
    expect(screen.getByText(/เป้าหมายสูงสุดของเรา/)).toBeTruthy();
  });

  it("เรนเดอร์การ์ดจุดเด่นทั้ง 6 เสาหลัก (Why Choose Us)", () => {
    renderHero();

    expect(
      screen.getByRole("heading", { name: "ทำไมต้องเลือกศึกษาและวิจัยกับเรา" })
    ).toBeTruthy();

    const expectedPillars = [
      "Innovative Curricula",
      "Smart Labs & Facilities",
      "World-Class Research",
      "Career Opportunities",
      "Mentorship & Grants",
      "Digital Ecosystem",
    ];

    expectedPillars.forEach((title) => {
      expect(screen.getByRole("heading", { name: title })).toBeTruthy();
    });
  });
});
