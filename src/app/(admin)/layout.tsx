import { resolveTenantSettings } from "@/features/identity/server";
import { AdminLayoutClient } from "./_components/admin-layout-client";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const settings = await resolveTenantSettings();
  return (
    <AdminLayoutClient logoUrl={settings?.logoUrl}>
      {children}
    </AdminLayoutClient>
  );
}
