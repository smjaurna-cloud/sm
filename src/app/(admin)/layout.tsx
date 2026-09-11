import { resolveTenantSettings } from "@/features/identity/server";
import { getLocale } from "@/shared/lib/i18n/server";
import { AdminLayoutClient } from "./_components/admin-layout-client";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [settings, locale] = await Promise.all([
    resolveTenantSettings(),
    getLocale(),
  ]);
  const brandName =
    (locale === "en" ? settings?.nameEn : settings?.nameTh) ||
    settings?.nameTh;

  return (
    <AdminLayoutClient logoUrl={settings?.logoUrl} brandName={brandName}>
      {children}
    </AdminLayoutClient>
  );
}
