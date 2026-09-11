import { auth, resolveTenantSettings } from "@/features/identity/server";
import { getT } from "@/i18n/server";
import { getLocale } from "@/shared/lib/i18n/server";
import { PortalNavbar } from "./_components/portal-navbar";
import { PortalFooter } from "./_components/portal-footer";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const [t, locale, session, tenantSettings] = await Promise.all([
    getT(),
    getLocale(),
    auth().catch(() => null),
    resolveTenantSettings(),
  ]);
  const isLoggedIn = !!session?.user;
  const facultyName =
    (locale === "en" ? tenantSettings?.nameEn : tenantSettings?.nameTh) ||
    tenantSettings?.nameTh ||
    t("portal.facultyName");

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Admin-styled Portal Navbar */}
      <PortalNavbar
        logoUrl={tenantSettings?.logoUrl}
        facultyName={facultyName}
        facultyTagline={t("portal.facultyTagline")}
        isLoggedIn={isLoggedIn}
        initialUser={
          session?.user
            ? {
                name: session.user.name,
                email: session.user.email,
                image: session.user.image,
              }
            : null
        }
      />

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Portal Footer (Liyon Theme Design) */}
      <PortalFooter
        logoUrl={tenantSettings?.logoUrl}
        facultyName={facultyName}
        facultyTagline={t("portal.facultyTagline")}
      />
    </div>
  );
}
