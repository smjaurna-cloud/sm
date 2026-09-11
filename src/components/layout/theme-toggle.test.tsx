import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeToggle } from "./theme-toggle";
import { I18nProvider } from "@/shared/lib/i18n/client";
import { UI_MESSAGES } from "@/i18n";

const setThemeMock = vi.fn();
let resolvedThemeValue = "light";

vi.mock("next-themes", () => ({
  useTheme: () => ({
    resolvedTheme: resolvedThemeValue,
    setTheme: setThemeMock,
  }),
}));

function renderWithI18n() {
  return render(
    <I18nProvider locale="th" messages={UI_MESSAGES}>
      <ThemeToggle />
    </I18nProvider>
  );
}

describe("ThemeToggle", () => {
  beforeEach(() => {
    setThemeMock.mockClear();
    resolvedThemeValue = "light";
  });

  it("เรนเดอร์ปุ่มสลับโหมดพร้อมข้อความกำกับที่ถูกต้อง", () => {
    renderWithI18n();
    const btn = screen.getByRole("button", { name: "สลับโหมดสว่าง/มืด" });
    expect(btn).toBeTruthy();
  });

  it("เมื่อคลิกในโหมดสว่าง จะเรียก setTheme('dark')", () => {
    resolvedThemeValue = "light";
    renderWithI18n();
    const btn = screen.getByRole("button", { name: "สลับโหมดสว่าง/มืด" });
    fireEvent.click(btn);
    expect(setThemeMock).toHaveBeenCalledWith("dark");
  });

  it("เมื่อคลิกในโหมดมืด จะเรียก setTheme('light')", () => {
    resolvedThemeValue = "dark";
    renderWithI18n();
    const btn = screen.getByRole("button", { name: "สลับโหมดสว่าง/มืด" });
    fireEvent.click(btn);
    expect(setThemeMock).toHaveBeenCalledWith("light");
  });
});
