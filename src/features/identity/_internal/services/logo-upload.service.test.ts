import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { saveUploadedLogo, MAX_LOGO_SIZE_BYTES } from "./logo-upload.service";
import { AppError } from "@/shared/lib/errors";

describe("logo-upload.service", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "logo-upload-test-"));
  });

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  it("บันทึกไฟล์รูปภาพ PNG สำเร็จและคืนค่า path ที่ถูกต้อง", async () => {
    const file = new File([new Uint8Array([1, 2, 3, 4])], "test-logo.png", { type: "image/png" });
    const url = await saveUploadedLogo({
      tenantId: "tenant-123",
      file,
      targetDir: tempDir,
    });

    expect(url).toMatch(/^\/uploads\/logos\/logo-tenant-123-\d+\.png$/);
    const files = await fs.readdir(tempDir);
    expect(files.length).toBe(1);
    expect(files[0]).toMatch(/^logo-tenant-123-\d+\.png$/);

    const content = await fs.readFile(path.join(tempDir, files[0]));
    expect(content).toEqual(Buffer.from([1, 2, 3, 4]));
  });

  it("บันทึกไฟล์รูปภาพ SVG สำเร็จ", async () => {
    const svgContent = '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40"/></svg>';
    const file = new File([svgContent], "logo.svg", { type: "image/svg+xml" });
    const url = await saveUploadedLogo({
      tenantId: "tenant-456",
      file,
      targetDir: tempDir,
    });

    expect(url).toMatch(/^\/uploads\/logos\/logo-tenant-456-\d+\.svg$/);
  });

  it("ปฏิเสธไฟล์ที่ไม่ใช่ประเภทรูปภาพที่รองรับ (เช่น PDF)", async () => {
    const file = new File(["fake pdf content"], "doc.pdf", { type: "application/pdf" });

    await expect(
      saveUploadedLogo({
        tenantId: "tenant-123",
        file,
        targetDir: tempDir,
      })
    ).rejects.toThrowError(AppError);
  });

  it("ปฏิเสธไฟล์ที่มีขนาดใหญ่เกิน 2MB", async () => {
    // สร้าง ArrayBuffer ขนาด 2MB + 1 byte
    const largeBuffer = new Uint8Array(MAX_LOGO_SIZE_BYTES + 1);
    const file = new File([largeBuffer], "huge-image.png", { type: "image/png" });

    await expect(
      saveUploadedLogo({
        tenantId: "tenant-123",
        file,
        targetDir: tempDir,
      })
    ).rejects.toThrowError(AppError);
  });
});
