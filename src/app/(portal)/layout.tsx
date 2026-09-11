import Link from "next/link";
import { auth, resolveTenantSettings } from "@/features/identity/server";
import { getT } from "@/i18n/server";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { GraduationCap, Newspaper, Users, BookOpen, CalendarCheck, FlaskConical, FileCheck, Landmark, Target, LayoutDashboard, LogIn } from "lucide-react";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const [t, session, tenantSettings] = await Promise.all([
    getT(),
    auth().catch(() => null),
    resolveTenantSettings(),
  ]);
  const isLoggedIn = !!session?.user;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Top Announcement Bar */}
      <div className="border-b bg-primary/10 px-4 py-1.5 text-center text-xs font-medium text-primary">
        {t("portal.facultyTagline")}
      </div>

      {/* Main Navigation */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-xs">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3 transition hover:opacity-90">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-sm overflow-hidden ${
              tenantSettings?.logoUrl
                ? "bg-white dark:bg-card border border-border/60 p-1"
                : "bg-primary text-primary-foreground"
            }`}>
              {tenantSettings?.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={tenantSettings.logoUrl} alt={t("portal.facultyName")} className="h-full w-full object-contain" />
              ) : (
                <GraduationCap className="h-6 w-6" />
              )}
            </div>
            <div>
              <span className="block text-base font-bold leading-tight tracking-tight sm:text-lg">
                {t("portal.facultyName")}
              </span>
              <span className="block text-xs text-muted-foreground">
                VibeCore Faculty Platform
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              {t("portal.home")}
            </Link>
            <Link
              href="/curriculum"
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              <BookOpen className="h-4 w-4" />
              {t("portal.curriculum")}
            </Link>
            <Link
              href="/booking"
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              <CalendarCheck className="h-4 w-4" />
              {t("portal.booking")}
            </Link>
            <Link
              href="/research"
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              <FlaskConical className="h-4 w-4" />
              {t("research.nav")}
            </Link>
            <Link
              href="/edoc"
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              <FileCheck className="h-4 w-4" />
              {t("edoc.nav")}
            </Link>
            <Link
              href="/finance"
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              <Landmark className="h-4 w-4" />
              {t("finance.nav")}
            </Link>
            <Link
              href="/strategy"
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              <Target className="h-4 w-4" />
              {t("strategy.nav")}
            </Link>
            <Link
              href="/news"
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              <Newspaper className="h-4 w-4" />
              {t("portal.news")}
            </Link>
            <Link
              href="/staff"
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              <Users className="h-4 w-4" />
              {t("portal.staff")}
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher className="h-9 w-9 rounded-lg border" />
            <ThemeToggle className="h-9 w-9 rounded-lg border" />

            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-lg bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground shadow-xs transition hover:bg-primary/90"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>{t("portal.dashboard")}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-lg border px-3.5 py-1.5 text-sm font-medium shadow-xs transition hover:bg-muted"
              >
                <LogIn className="h-4 w-4" />
                <span>{t("portal.login")}</span>
              </Link>
            )}
          </div>
        </div>
      </header>

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
