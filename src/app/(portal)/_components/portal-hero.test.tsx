import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  PortalHero,
  SAKYASIHA_SLIDES,
  SAKYASIHA_ACTIVITIES,
} from "./portal-hero";
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

  it("เรนเดอร์ภาพพื้นหลังเคลื่อนไหว (Motion Background) จาก sakyasiha.org ครบ 5 ภาพ", () => {
    renderHero();

    const bgContainer = screen.getByTestId("hero-motion-background");
    expect(bgContainer).toBeTruthy();

    SAKYASIHA_SLIDES.forEach((slide) => {
      const img = screen.getByAltText(slide.title);
      expect(img).toBeTruthy();
      expect(img.getAttribute("src")).toBe(slide.url);
    });
  });

  it("สามารถกดเปลี่ยนภาพสไลด์และหยุด/เล่นการเคลื่อนไหวได้", () => {
    renderHero();

    // เริ่มต้นที่สไลด์แรก
    expect(
      screen.getByText("อาคารหอประชุมเตปิฏกสังคีติสิทธาคาร")
    ).toBeTruthy();

    // กดปุ่มสไลด์ถัดไป
    const nextBtn = screen.getByTitle("ภาพถัดไป");
    fireEvent.click(nextBtn);
    expect(screen.getByText("พระคันธกุฎี วชิราลงกรณ")).toBeTruthy();

    // กดปุ่มสไลด์ก่อนหน้า
    const prevBtn = screen.getByTitle("ภาพก่อนหน้า");
    fireEvent.click(prevBtn);
    expect(
      screen.getByText("อาคารหอประชุมเตปิฏกสังคีติสิทธาคาร")
    ).toBeTruthy();

    // กดปุ่ม Pause / Play
    const pauseBtn = screen.getByTitle("หยุดเคลื่อนไหว");
    fireEvent.click(pauseBtn);
    expect(screen.getByTitle("เล่นการเคลื่อนไหว")).toBeTruthy();
  });

  it("เรนเดอร์แถบกิจกรรมเคลื่อนไหวต่อเนื่อง (Live Ticker) จาก sakyasiha.org", () => {
    renderHero();

    const ticker = screen.getByTestId("hero-activity-ticker");
    expect(ticker).toBeTruthy();

    expect(
      screen.getByText("กิจกรรมและข่าวสารสำคัญจาก Sakyasiha.org")
    ).toBeTruthy();
    expect(screen.getByText("เข้าสู่เว็บไซต์ sakyasiha.org")).toBeTruthy();

    // ตรวจสอบว่ามีรายการกิจกรรมจาก sakyasiha ปรากฏในแถบ
    expect(
      screen.getAllByText(SAKYASIHA_ACTIVITIES[0].title).length
    ).toBeGreaterThan(0);
  });

  it("เรนเดอร์องค์ประกอบสไตล์ Neubrutalism และ Interactive Mindful Breathing Widget", () => {
    renderHero();

    // ตรวจสอบสติกเกอร์ Neubrutalism
    expect(screen.getByText("100% สมาธิและปัญญาบริสุทธิ์")).toBeTruthy();
    expect(screen.getByText("209+ หมุดไม้มงคลสถาปนา")).toBeTruthy();
    expect(screen.getByText("ออนไลน์ 24 ชม.")).toBeTruthy();

    // ตรวจสอบวิดเจ็ตฝึกกำหนดลมหายใจ
    expect(screen.getByText("✦ MINDFUL BREATHING")).toBeTruthy();
    expect(screen.getByText("หยุดฝึก")).toBeTruthy();

    // ทดสอบคลิกหยุดฝึก / เริ่มฝึก
    const toggleBreathingBtn = screen.getByText("หยุดฝึก");
    fireEvent.click(toggleBreathingBtn);
    expect(screen.getByText("เริ่มฝึกกำหนดลมหายใจ")).toBeTruthy();
  });
});
