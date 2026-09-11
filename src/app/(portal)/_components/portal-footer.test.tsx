import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PortalFooter } from "./portal-footer";
import { I18nProvider } from "@/shared/lib/i18n/client";
import { UI_MESSAGES } from "@/i18n";

function renderFooter(props = {}) {
  return render(
    <I18nProvider locale="th" messages={UI_MESSAGES}>
      <PortalFooter
        facultyName="คณะวิทยาศาสตร์และนวัตกรรม"
        facultyTagline="มุ่งสู่ความเป็นเลิศระดับสากล"
        {...props}
      />
    </I18nProvider>
  );
}

describe("PortalFooter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("เรนเดอร์ชื่อคณะ สโลแกน และข้อความพันธกิจครบถ้วน", () => {
    renderFooter();

    expect(screen.getByText("คณะวิทยาศาสตร์และนวัตกรรม")).toBeTruthy();
    expect(screen.getByText("มุ่งสู่ความเป็นเลิศระดับสากล")).toBeTruthy();
    expect(
      screen.getByText(
        "สถาบันชั้นนำด้านการศึกษา วิจัย และนวัตกรรมดิจิทัลเพื่อพัฒนาสังคมและเศรษฐกิจแห่งอนาคต"
      )
    ).toBeTruthy();
  });

  it("แสดงรูปภาพโลโก้เมื่อมี logoUrl", () => {
    renderFooter({ logoUrl: "/uploads/logos/faculty-logo.png" });

    const img = screen.getByRole("img", { name: "คณะวิทยาศาสตร์และนวัตกรรม" });
    expect(img.getAttribute("src")).toBe("/uploads/logos/faculty-logo.png");
  });

  it("เรนเดอร์หัวข้อหลักทั้ง 4 คอลัมน์", () => {
    renderFooter();

    expect(screen.getByText("ช่องทางติดตาม")).toBeTruthy();
    expect(screen.getByText("การศึกษาและวิจัย")).toBeTruthy();
    expect(screen.getByText("ระบบบริการออนไลน์")).toBeTruthy();
    expect(screen.getByText("ติดต่อเรา")).toBeTruthy();
  });

  it("เรนเดอร์ลิงก์หมวดการศึกษาและวิจัยครบถ้วน", () => {
    renderFooter();

    const academicHrefs = ["/", "/curriculum", "/research", "/news", "/staff"];
    academicHrefs.forEach((href) => {
      const links = screen.getAllByRole("link");
      const matched = links.some((l) => l.getAttribute("href") === href);
      expect(matched).toBe(true);
    });
  });

  it("เรนเดอร์ลิงก์หมวดระบบบริการออนไลน์ครบถ้วน", () => {
    renderFooter();

    const serviceHrefs = ["/booking", "/edoc", "/finance", "/strategy", "/dashboard"];
    serviceHrefs.forEach((href) => {
      const links = screen.getAllByRole("link");
      const matched = links.some((l) => l.getAttribute("href") === href);
      expect(matched).toBe(true);
    });
  });

  it("เรนเดอร์ข้อมูลติดต่อ (ที่อยู่ เบอร์โทร อีเมล เวลาทำการ)", () => {
    renderFooter();

    expect(
      screen.getByText("สำนักงานคณบดี คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล อาคารปฏิบัติการวิชาการ")
    ).toBeTruthy();
    expect(screen.getByText("0-2000-0000 ต่อ 101-105")).toBeTruthy();
    expect(screen.getByText("contact@faculty.ac.th")).toBeTruthy();
    expect(screen.getByText("จันทร์ - ศุกร์: 08:30 - 16:30 น.")).toBeTruthy();
  });

  it("เรนเดอร์แถบล่างสุด (Copyright, Privacy, Terms, Sitemap)", () => {
    renderFooter();

    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(new RegExp(`© ${currentYear} คณะวิทยาศาสตร์และนวัตกรรม`))
    ).toBeTruthy();
    expect(screen.getByText("นโยบายความเป็นส่วนตัว")).toBeTruthy();
    expect(screen.getByText("ข้อกำหนดการใช้งาน")).toBeTruthy();
    expect(screen.getByText("แผนผังเว็บไซต์")).toBeTruthy();
  });

  it("คลิกปุ่มกลับสู่ด้านบนแล้วเรียก window.scrollTo", () => {
    const scrollToMock = vi.fn();
    window.scrollTo = scrollToMock;

    renderFooter();

    const topBtn = screen.getByRole("button", { name: "กลับสู่ด้านบน" });
    fireEvent.click(topBtn);

    expect(scrollToMock).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });
});
