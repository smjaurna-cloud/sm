"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import {
  BookOpen,
  CalendarCheck,
  FileCheck,
  FlaskConical,
  GraduationCap,
  Home,
  Landmark,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Newspaper,
  Settings,
  Target,
  User,
  Users,
  X,
} from "lucide-react";
import { useAppSession } from "@/hooks/use-session";
import { hasPermission, P } from "@/features/identity";
import { useT } from "@/shared/lib/i18n/client";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/shared/lib/utils";

export interface PortalNavbarProps {
  logoUrl?: string | null;
  facultyName: string;
  facultyTagline: string;
  isLoggedIn?: boolean;
  initialUser?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}

export function PortalNavbar({
  logoUrl,
  facultyName,
  facultyTagline,
  isLoggedIn = false,
  initialUser,
}: PortalNavbarProps) {
  const t = useT();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { user: clientUser, roles, permissions, isSuperAdmin, status } = useAppSession();
  const user =
    status === "unauthenticated"
      ? null
      : clientUser ??
        initialUser ??
        (isLoggedIn ? { name: "User", email: "" } : null);

  const initials = (user?.name ?? "?").trim().charAt(0).toUpperCase() || "?";
  const ctx = { roles, permissions, isSuperAdmin };
  const canManageSettings = hasPermission(ctx, P.settingsManage);

  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setDrawerOpen(false);
  }

  const navItems = [
    { href: "/", label: t("portal.home"), icon: Home, exact: true },
    { href: "/curriculum", label: t("portal.curriculum"), icon: BookOpen },
    { href: "/booking", label: t("portal.booking"), icon: CalendarCheck },
    { href: "/research", label: t("research.nav"), icon: FlaskConical },
    { href: "/edoc", label: t("edoc.nav"), icon: FileCheck },
    { href: "/finance", label: t("finance.nav"), icon: Landmark },
    { href: "/strategy", label: t("strategy.nav"), icon: Target },
    { href: "/news", label: t("portal.news"), icon: Newspaper },
    { href: "/staff", label: t("portal.staff"), icon: Users },
  ];

  function isItemActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      <header className="adm-head sticky top-0 z-40 w-full flex items-center justify-between px-3 sm:px-6">
        {/* Left: Brand block (Admin Style) */}
        <Link
          className="brand-blk flex items-center gap-2.5 transition hover:opacity-95 max-w-[260px] sm:max-w-[300px] shrink-0"
          style={{ width: "auto" }}
          href="/"
        >
          <i
            className={cn(
              "flex h-[34px] w-[34px] items-center justify-center rounded-md shrink-0 shadow-xs overflow-hidden",
              logoUrl
                ? "bg-white dark:bg-card border border-border/60 p-0.5"
                : "bg-primary text-primary-foreground"
            )}
          >
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={facultyName}
                className="h-full w-full object-contain"
              />
            ) : (
              <GraduationCap className="h-5 w-5" />
            )}
          </i>
          <div className="t min-w-0">
            <b className="block text-sm font-bold leading-tight tracking-tight text-foreground truncate">
              {facultyName}
            </b>
            <span className="block text-[0.72rem] text-muted-foreground truncate">
              {facultyTagline}
            </span>
          </div>
        </Link>

        {/* Middle: Desktop Menu Items (Preserved & Styled) */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 mx-2">
          {navItems.map((item) => {
            const active = isItemActive(item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs xl:text-sm font-medium transition-colors whitespace-nowrap",
                  active
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className={cn("h-3.5 w-3.5 xl:h-4 xl:w-4", active ? "text-primary" : "opacity-70")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions (Language, Theme, Auth, Mobile Menu Trigger) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <LanguageSwitcher className="h-8.5 w-8.5 rounded-md border" />
          <ThemeToggle className="h-8.5 w-8.5 rounded-md border" />

          {user ? (
            <div className="acct">
              <DropdownMenuPrimitive.Root>
                <DropdownMenuPrimitive.Trigger asChild>
                  <button
                    type="button"
                    className="cursor-pointer focus:outline-none"
                  >
                    <span className="who" aria-hidden="true">
                      {user.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.image}
                          alt=""
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        initials
                      )}
                    </span>
                    <span className="nm hidden sm:inline">{user.name}</span>
                    <svg className="chev" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="m6 9 6 6 6-6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </DropdownMenuPrimitive.Trigger>
                <DropdownMenuPrimitive.Portal>
                  <DropdownMenuPrimitive.Content
                    className="menu-list z-50 min-w-[200px]"
                    align="end"
                    sideOffset={8}
                    style={{ position: "static" }}
                  >
                    <DropdownMenuPrimitive.Label asChild>
                      <div className="px-2.5 py-2">
                        <p className="text-sm font-medium leading-tight">{user.name}</p>
                        {user.email && (
                          <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
                        )}
                      </div>
                    </DropdownMenuPrimitive.Label>
                    <DropdownMenuPrimitive.Separator asChild>
                      <hr />
                    </DropdownMenuPrimitive.Separator>
                    <DropdownMenuPrimitive.Item asChild>
                      <Link href="/dashboard">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>{t("portal.dashboard")}</span>
                      </Link>
                    </DropdownMenuPrimitive.Item>
                    <DropdownMenuPrimitive.Item asChild>
                      <Link href="/me">
                        <User className="h-4 w-4" />
                        <span>{t("account.profile")}</span>
                      </Link>
                    </DropdownMenuPrimitive.Item>
                    {canManageSettings && (
                      <DropdownMenuPrimitive.Item asChild>
                        <Link href="/settings">
                          <Settings className="h-4 w-4" />
                          <span>{t("nav.settings")}</span>
                        </Link>
                      </DropdownMenuPrimitive.Item>
                    )}
                    <DropdownMenuPrimitive.Separator asChild>
                      <hr />
                    </DropdownMenuPrimitive.Separator>
                    <DropdownMenuPrimitive.Item
                      asChild
                      onSelect={() => signOut({ callbackUrl: "/login" })}
                    >
                      <button type="button" className="danger">
                        <LogOut className="h-4 w-4" />
                        <span>{t("account.logout")}</span>
                      </button>
                    </DropdownMenuPrimitive.Item>
                  </DropdownMenuPrimitive.Content>
                </DropdownMenuPrimitive.Portal>
              </DropdownMenuPrimitive.Root>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-xs font-medium shadow-xs transition hover:bg-muted"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>{t("portal.login")}</span>
            </Link>
          )}

          {/* Mobile Drawer Trigger */}
          <button
            type="button"
            className="inline-flex lg:hidden h-8.5 w-8.5 items-center justify-center rounded-md border bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Open Navigation Menu"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 w-[280px] bg-background border-r p-5 shadow-xl flex flex-col z-50">
            <div className="flex items-center justify-between pb-4 border-b">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-md shrink-0 shadow-xs overflow-hidden",
                    logoUrl
                      ? "bg-white dark:bg-card border border-border/60 p-0.5"
                      : "bg-primary text-primary-foreground"
                  )}
                >
                  {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoUrl}
                      alt={facultyName}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <GraduationCap className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <b className="block text-xs font-bold text-foreground truncate">
                    {facultyName}
                  </b>
                  <span className="block text-[0.68rem] text-muted-foreground truncate">
                    {facultyTagline}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close Navigation Menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile Nav Links */}
            <div className="flex-1 overflow-y-auto py-4 space-y-1">
              {navItems.map((item) => {
                const active = isItemActive(item.href, item.exact);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", active ? "text-primary" : "opacity-70")} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile Footer Actions */}
            <div className="pt-4 border-t space-y-2">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-muted/50 border">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs shrink-0 overflow-hidden shadow-xs">
                      {user.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        initials
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <b className="block text-xs font-semibold text-foreground truncate">{user.name}</b>
                      {user.email && (
                        <span className="block text-[0.7rem] text-muted-foreground truncate">{user.email}</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-foreground hover:bg-muted transition"
                    >
                      <LayoutDashboard className="h-4 w-4 text-primary" />
                      <span>{t("portal.dashboard")}</span>
                    </Link>
                    <Link
                      href="/me"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-foreground hover:bg-muted transition"
                    >
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{t("account.profile")}</span>
                    </Link>
                    {canManageSettings && (
                      <Link
                        href="/settings"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-foreground hover:bg-muted transition"
                      >
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        <span>{t("nav.settings")}</span>
                      </Link>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex w-full items-center justify-center gap-2 rounded-md border border-destructive/30 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t("account.logout")}</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex w-full items-center justify-center gap-2 rounded-md border bg-background py-2 text-xs font-medium shadow-xs hover:bg-muted"
                >
                  <LogIn className="h-4 w-4" />
                  <span>{t("portal.login")}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
