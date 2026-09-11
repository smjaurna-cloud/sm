import fs from "node:fs/promises";
import path from "node:path";
import { errors } from "@/shared/lib/errors";

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
]);

const EXT_BY_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

export const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

export interface SaveLogoOptions {
  tenantId: string;
  file: File;
  targetDir?: string;
}

/**
 * Validates the uploaded logo image (type and size) and saves it to disk.
 * Returns the public relative URL for the saved logo.
 */
export async function saveUploadedLogo({ tenantId, file, targetDir }: SaveLogoOptions): Promise<string> {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw errors.validation("Invalid file type", { file: ["Only PNG, JPG, WebP, SVG images are supported"] });
  }

  if (file.size > MAX_LOGO_SIZE_BYTES) {
    throw errors.validation("File too large", { file: ["File size must not exceed 2MB"] });
  }

  const ext = EXT_BY_MIME[file.type] || "png";
  const filename = `logo-${tenantId}-${Date.now()}.${ext}`;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const destDir = targetDir ?? path.join(process.cwd(), "public", "uploads", "logos");
  await fs.mkdir(destDir, { recursive: true });
  await fs.writeFile(path.join(destDir, filename), buffer);

  return `/uploads/logos/${filename}`;
}
