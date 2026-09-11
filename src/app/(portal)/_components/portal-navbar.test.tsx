import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PortalNavbar } from "./portal-navbar";
import { I18nProvider } from "@/shared/lib/i18n/client";
import { UI_MESSAGES } from "@/i18n";
import { P } from "@/features/identity";

const mockUseAppSession = vi.fn();

vi.mock("@/hooks/use-session", () => ({
  useAppSession: () => mockUseAppSession(),
}));

vi.mock("next-auth/react", () => ({
  signOut: vi.fn(),
}));

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
    mockUseAppSession.mockReturnValue({
      status: "unauthenticated",
      isAuthenticated: false,
      user: null,
      roles: [],
      permissions: [],
      isSuperAdmin: false,
    });
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
    expect(screen.getAllByText("เข้าสู่ระบบ").length).toBeGreaterThan(0);
  });

  it("แสดง Avatar และชื่อผู้ใช้เมื่อล็อกอินแล้ว", () => {
    mockUseAppSession.mockReturnValue({
      status: "authenticated",
      isAuthenticated: true,
      user: { name: "ดร.สมชาย นามสมมุติ", email: "somchai@univ.ac.th" },
      roles: ["staff"],
      permissions: [],
      isSuperAdmin: false,
    });

    renderNavbar({ isLoggedIn: true });

    // แสดงชื่อผู้ใช้บนปุ่ม avatar
    expect(screen.getByText("ดร.สมชาย นามสมมุติ")).toBeTruthy();
    // ตัวย่อต้องแสดง "ด"
    expect(screen.getByText("ด")).toBeTruthy();
  });

  it("เปิดเมนู Avatar และพบลิงก์ไปยังแดชบอร์ด, โปรไฟล์, และออกจากระบบ", async () => {
    mockUseAppSession.mockReturnValue({
      status: "authenticated",
      isAuthenticated: true,
      user: { name: "ดร.สมชาย", email: "somchai@univ.ac.th" },
      roles: ["staff"],
      permissions: [],
      isSuperAdmin: false,
    });

    renderNavbar({ isLoggedIn: true });

    const avatarBtn = screen.getByRole("button", { name: /ดร.สมชาย/ });
    fireEvent.pointerDown(avatarBtn, { button: 0, ctrlKey: false });

    // ตรวจสอบตัวเลือกใน Dropdown Menu
    expect(await screen.findByText("somchai@univ.ac.th")).toBeTruthy();
    expect(await screen.findByText("แดชบอร์ด")).toBeTruthy();
    expect(await screen.findByText("ออกจากระบบ")).toBeTruthy();
  });

  it("แสดงเมนูตั้งค่าองค์กรเฉพาะผู้มีสิทธิ์ settings:manage หรือ Super Admin", async () => {
    mockUseAppSession.mockReturnValue({
      status: "authenticated",
      isAuthenticated: true,
      user: { name: "Admin", email: "admin@univ.ac.th" },
      roles: ["admin"],
      permissions: [P.settingsManage],
      isSuperAdmin: true,
    });

    renderNavbar({ isLoggedIn: true });

    const avatarBtn = screen.getByRole("button", { name: /Admin/ });
    fireEvent.pointerDown(avatarBtn, { button: 0, ctrlKey: false });

    expect(await screen.findByText("ตั้งค่าองค์กร")).toBeTruthy();
  });

  it("ไม่แสดงเมนูตั้งค่าองค์กรเมื่อผู้ใช้ไม่มีสิทธิ์ settings:manage", async () => {
    mockUseAppSession.mockReturnValue({
      status: "authenticated",
      isAuthenticated: true,
      user: { name: "Staff Member", email: "staff@univ.ac.th" },
      roles: ["staff"],
      permissions: [],
      isSuperAdmin: false,
    });

    renderNavbar({ isLoggedIn: true });

    const avatarBtn = screen.getByRole("button", { name: /Staff Member/ });
    fireEvent.pointerDown(avatarBtn, { button: 0, ctrlKey: false });

    await screen.findByText("แดชบอร์ด");
    expect(screen.queryByText("ตั้งค่าองค์กร")).toBeNull();
  });

  it("แสดงข้อมูลผู้ใช้และเมนูใน Mobile Drawer เมื่อล็อกอินแล้ว", () => {
    mockUseAppSession.mockReturnValue({
      status: "authenticated",
      isAuthenticated: true,
      user: { name: "สมศรี ใจดี", email: "somsri@univ.ac.th" },
      roles: ["staff"],
      permissions: [],
      isSuperAdmin: false,
    });

    renderNavbar({ isLoggedIn: true });

    const menuTrigger = screen.getByRole("button", { name: "Open Navigation Menu" });
    fireEvent.click(menuTrigger);

    expect(screen.getAllByText("สมศรี ใจดี").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("somsri@univ.ac.th")).toBeTruthy();
    expect(screen.getAllByText("แดชบอร์ด").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("ออกจากระบบ").length).toBeGreaterThanOrEqual(1);
  });
});
