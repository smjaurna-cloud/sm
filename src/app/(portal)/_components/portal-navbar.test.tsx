import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { PortalNavbar } from "./portal-navbar";
import { I18nProvider } from "@/shared/lib/i18n/client";
import { UI_MESSAGES } from "@/i18n";

vi.mock("next/navigation", () => ({
  usePathname: () => "/curriculum",
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light", setTheme: vi.fn() }),
}));

function renderNavbar(props = {}) {
  return render(
    <I18nProvider locale="th" messages={UI_MESSAGES}>
      <PortalNavbar
        facultyName="คณะวิทยาศาสตร์และนวัตกรรม"
        facultyTagline="ความเป็นเลิศด้านการศึกษาและวิจัย"
        isLoggedIn={false}
        {...props}
      />
    </I18nProvider>
  );
}

describe("PortalNavbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("เรนเดอร์ข้อมูลแบรนด์ สโลแกน และเมนูหลักครบถ้วน", () => {
    renderNavbar();

    expect(screen.getByText("คณะวิทยาศาสตร์และนวัตกรรม")).toBeTruthy();
    expect(screen.getByText("ความเป็นเลิศด้านการศึกษาและวิจัย")).toBeTruthy();

    // ตรวจสอบเมนูหลักทั้ง 9 รายการตาม href
    const hrefs = [
      "/",
      "/curriculum",
      "/booking",
      "/research",
      "/edoc",
      "/finance",
      "/strategy",
      "/news",
      "/staff",
    ];

    hrefs.forEach((href) => {
      const links = screen.getAllByRole("link");
      const matched = links.some((l) => l.getAttribute("href") === href);
      expect(matched).toBe(true);
    });
  });

  it("แสดงรูปภาพโลโก้เมื่อส่ง logoUrl เข้ามา", () => {
    renderNavbar({ logoUrl: "/uploads/logos/faculty-logo.png" });

    const imgs = screen.getAllByRole("img", { name: "คณะวิทยาศาสตร์และนวัตกรรม" });
    expect(imgs.length).toBeGreaterThan(0);
    expect(imgs[0].getAttribute("src")).toBe("/uploads/logos/faculty-logo.png");
  });

  it("แสดงปุ่มเข้าสู่ระบบเมื่อยังไม่ได้ล็อกอิน", () => {
    renderNavbar({ isLoggedIn: false });
    expect(screen.getByText("เข้าสู่ระบบ")).toBeTruthy();
  });

  it("แสดงปุ่มแดชบอร์ดเมื่อล็อกอินแล้ว", () => {
    renderNavbar({ isLoggedIn: true });
    expect(screen.getByText("แดชบอร์ด")).toBeTruthy();
  });
});
