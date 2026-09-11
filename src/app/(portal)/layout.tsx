import Link from "next/link";
import { auth, resolveTenantSettings } from "@/features/identity/server";
import { getT } from "@/i18n/server";
import { GraduationCap } from "lucide-react";
import { PortalNavbar } from "./_components/portal-navbar";

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

      {/* Portal Footer */}
      <footer className="border-t bg-muted/40 py-12 text-sm text-muted-foreground">
        <div className="container mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-4">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2 font-bold text-foreground">
              {tenantSettings?.logoUrl ? (
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white dark:bg-card border border-border/60 p-0.5 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={tenantSettings.logoUrl} alt={t("portal.facultyName")} className="h-full w-full object-contain" />
                </div>
              ) : (
                <GraduationCap className="h-5 w-5 text-primary" />
              )}
              <span>{t("portal.facultyName")}</span>
            </div>
            <p className="max-w-md text-xs leading-relaxed">
              สถาบันชั้นนำด้านการศึกษา วิจัย และนวัตกรรมดิจิทัลเพื่อพัฒนาสังคมและเศรษฐกิจแห่งอนาคต
            </p>
            <p className="text-xs">
              © {new Date().getFullYear()} Faculty Web Platform. Powered by VibeCore Framework.
            </p>
          </div>

          <div>
            <h4 className="mb-3 font-semibold text-foreground">เมนูหลัก</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-foreground transition">
                  {t("portal.home")}
                </Link>
              </li>
              <li>
                <Link href="/curriculum" className="hover:text-foreground transition">
                  {t("portal.curriculum")}
                </Link>
              </li>
              <li>
                <Link href="/booking" className="hover:text-foreground transition">
                  {t("portal.booking")}
                </Link>
              </li>
              <li>
                <Link href="/research" className="hover:text-foreground transition">
                  {t("research.nav")}
                </Link>
              </li>
              <li>
                <Link href="/edoc" className="hover:text-foreground transition">
                  {t("edoc.nav")}
                </Link>
              </li>
              <li>
                <Link href="/finance" className="hover:text-foreground transition">
                  {t("finance.nav")}
                </Link>
              </li>
              <li>
                <Link href="/strategy" className="hover:text-foreground transition">
                  {t("strategy.nav")}
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-foreground transition">
                  {t("portal.news")}
                </Link>
              </li>
              <li>
                <Link href="/staff" className="hover:text-foreground transition">
                  {t("portal.staff")}
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-foreground transition">
                  {t("portal.login")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-semibold text-foreground">การติดต่อ</h4>
            <p className="text-xs leading-relaxed">
              สำนักงานคณบดี คณะเทคโนโลยีสารสนเทศฯ
              <br />
              โทรศัพท์: 0-2000-0000 ต่อ 101-105
              <br />
              อีเมล: contact@faculty.ac.th
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
