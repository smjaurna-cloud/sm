import { auth, resolveTenantSettings } from "@/features/identity/server";
import { getT } from "@/i18n/server";
import { PortalNavbar } from "./_components/portal-navbar";
import { PortalFooter } from "./_components/portal-footer";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const [t, session, tenantSettings] = await Promise.all([
    getT(),
    auth().catch(() => null),
    resolveTenantSettings(),
  ]);
  const isLoggedIn = !!session?.user;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Admin-styled Portal Navbar */}
      <PortalNavbar
        logoUrl={tenantSettings?.logoUrl}
        facultyName={t("portal.facultyName")}
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
        facultyName={t("portal.facultyName")}
        facultyTagline={t("portal.facultyTagline")}
      />
    </div>
  );
}
