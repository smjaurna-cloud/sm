"use client";

import Link from "next/link";
import {
  ArrowUp,
  Clock,
  Globe,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { useT } from "@/shared/lib/i18n/client";
import { cn } from "@/shared/lib/utils";

export interface PortalFooterProps {
  logoUrl?: string | null;
  facultyName: string;
  facultyTagline: string;
}

export function PortalFooter({
  logoUrl,
  facultyName,
  facultyTagline,
}: PortalFooterProps) {
  const t = useT();

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 sm:mt-24 border-t border-white/10 bg-[var(--ink-band)] text-[var(--ink-band-text)] relative z-10">
      {/* Upper Footer Container */}
      <div className="mx-auto max-w-[min(1440px,100%-32px)] px-4 sm:px-6 lg:px-[var(--gutter)] py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Column 1: Brand & Mission (4 cols on lg) */}
          <div className="lg:col-span-4 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-3 transition hover:opacity-95"
            >
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg shrink-0 shadow-sm overflow-hidden",
                  logoUrl
                    ? "bg-white p-0.5"
                    : "bg-[var(--brand)] text-[var(--on-brand)]"
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
              </div>
              <div className="min-w-0">
                <b className="block text-sm sm:text-base font-bold tracking-tight text-[var(--ink-band-text)] leading-tight">
                  {facultyName}
                </b>
                <span className="block text-[0.72rem] text-[var(--ink-band-muted)] truncate">
                  {facultyTagline}
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-[var(--ink-band-muted)] leading-relaxed max-w-sm">
              {t("portal.footer.mission")}
            </p>

            {/* Social / Portal Links */}
            <div className="pt-2">
              <span className="block text-[0.75rem] font-semibold uppercase tracking-wider text-[var(--ink-band-muted)] mb-2.5">
                {t("portal.footer.socials")}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="https://www.facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex h-8 w-8 items-center justify-center rounded-md bg-white/5 border border-white/10 text-[var(--ink-band-muted)] hover:text-white hover:bg-white/15 hover:border-white/20 transition"
                >
                  <span className="text-xs font-bold">f</span>
                </a>
                <a
                  href="https://www.youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="flex h-8 w-8 items-center justify-center rounded-md bg-white/5 border border-white/10 text-[var(--ink-band-muted)] hover:text-white hover:bg-white/15 hover:border-white/20 transition"
                >
                  <span className="text-xs font-bold">▶</span>
                </a>
                <a
                  href="https://line.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LINE"
                  className="flex h-8 w-8 items-center justify-center rounded-md bg-white/5 border border-white/10 text-[var(--ink-band-muted)] hover:text-white hover:bg-white/15 hover:border-white/20 transition"
                >
                  <span className="text-xs font-bold">L</span>
                </a>
                <Link
                  href="/"
                  aria-label="Website"
                  className="flex h-8 w-8 items-center justify-center rounded-md bg-white/5 border border-white/10 text-[var(--ink-band-muted)] hover:text-white hover:bg-white/15 hover:border-white/20 transition"
                >
                  <Globe className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Column 2: Academic & Research (2 cols on lg) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs sm:text-sm font-bold tracking-wider uppercase text-[var(--ink-band-text)] mb-4 border-l-2 border-[var(--brand-light)] pl-2.5">
              {t("portal.footer.academic")}
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link
                  href="/"
                  className="text-[var(--ink-band-muted)] hover:text-[var(--ink-band-text)] transition-colors inline-block"
                >
                  {t("portal.home")}
                </Link>
              </li>
              <li>
                <Link
                  href="/curriculum"
                  className="text-[var(--ink-band-muted)] hover:text-[var(--ink-band-text)] transition-colors inline-block"
                >
                  {t("portal.curriculum")}
                </Link>
              </li>
              <li>
                <Link
                  href="/research"
                  className="text-[var(--ink-band-muted)] hover:text-[var(--ink-band-text)] transition-colors inline-block"
                >
                  {t("research.nav")}
                </Link>
              </li>
              <li>
                <Link
                  href="/news"
                  className="text-[var(--ink-band-muted)] hover:text-[var(--ink-band-text)] transition-colors inline-block"
                >
                  {t("portal.news")}
                </Link>
              </li>
              <li>
                <Link
                  href="/staff"
                  className="text-[var(--ink-band-muted)] hover:text-[var(--ink-band-text)] transition-colors inline-block"
                >
                  {t("portal.staff")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Online Services (3 cols on lg) */}
          <div className="lg:col-span-3">
            <h4 className="text-xs sm:text-sm font-bold tracking-wider uppercase text-[var(--ink-band-text)] mb-4 border-l-2 border-[var(--brand-light)] pl-2.5">
              {t("portal.footer.services")}
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link
                  href="/booking"
                  className="text-[var(--ink-band-muted)] hover:text-[var(--ink-band-text)] transition-colors inline-block"
                >
                  {t("portal.booking")}
                </Link>
              </li>
              <li>
                <Link
                  href="/edoc"
                  className="text-[var(--ink-band-muted)] hover:text-[var(--ink-band-text)] transition-colors inline-block"
                >
                  {t("edoc.nav")}
                </Link>
              </li>
              <li>
                <Link
                  href="/finance"
                  className="text-[var(--ink-band-muted)] hover:text-[var(--ink-band-text)] transition-colors inline-block"
                >
                  {t("finance.nav")}
                </Link>
              </li>
              <li>
                <Link
                  href="/strategy"
                  className="text-[var(--ink-band-muted)] hover:text-[var(--ink-band-text)] transition-colors inline-block"
                >
                  {t("strategy.nav")}
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-[var(--ink-band-muted)] hover:text-[var(--ink-band-text)] transition-colors inline-block"
                >
                  {t("portal.dashboard")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Office (3 cols on lg) */}
          <div className="lg:col-span-3 space-y-3.5 text-xs sm:text-sm">
            <h4 className="text-xs sm:text-sm font-bold tracking-wider uppercase text-[var(--ink-band-text)] mb-4 border-l-2 border-[var(--brand-light)] pl-2.5">
              {t("portal.footer.contact")}
            </h4>

            <div className="flex items-start gap-2.5 text-[var(--ink-band-muted)]">
              <MapPin className="h-4 w-4 shrink-0 text-[var(--brand-light)] mt-0.5" />
              <span className="leading-relaxed">
                {t("portal.footer.address")}
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-[var(--ink-band-muted)]">
              <Phone className="h-4 w-4 shrink-0 text-[var(--brand-light)]" />
              <a
                href="tel:020000000"
                className="hover:text-[var(--ink-band-text)] transition-colors"
              >
                {t("portal.footer.phoneNumber")}
              </a>
            </div>

            <div className="flex items-center gap-2.5 text-[var(--ink-band-muted)]">
              <Mail className="h-4 w-4 shrink-0 text-[var(--brand-light)]" />
              <a
                href={`mailto:${t("portal.footer.emailAddress")}`}
                className="hover:text-[var(--ink-band-text)] transition-colors"
              >
                {t("portal.footer.emailAddress")}
              </a>
            </div>

            <div className="flex items-center gap-2.5 text-[var(--ink-band-muted)]">
              <Clock className="h-4 w-4 shrink-0 text-[var(--brand-light)]" />
              <span>{t("portal.footer.hoursDetail")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright & Policies */}
      <div className="border-t border-white/10 bg-black/15">
        <div className="mx-auto max-w-[min(1440px,100%-32px)] px-4 sm:px-6 lg:px-[var(--gutter)] py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--ink-band-muted)]">
          <div>
            <span>
              © {currentYear} {facultyName}. {t("portal.footer.rights")}
            </span>
            <span className="hidden md:inline mx-2 text-white/20">|</span>
            <span className="hidden md:inline">
              {t("portal.footer.poweredBy")}
            </span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/privacy"
              className="hover:text-[var(--ink-band-text)] transition-colors"
            >
              {t("portal.footer.privacy")}
            </Link>
            <Link
              href="/terms"
              className="hover:text-[var(--ink-band-text)] transition-colors"
            >
              {t("portal.footer.terms")}
            </Link>
            <Link
              href="/sitemap"
              className="hover:text-[var(--ink-band-text)] transition-colors"
            >
              {t("portal.footer.sitemap")}
            </Link>

            <button
              type="button"
              onClick={scrollToTop}
              aria-label={t("portal.footer.backToTop")}
              className="inline-flex items-center gap-1 text-[var(--ink-band-muted)] hover:text-white hover:bg-white/10 rounded px-2 py-1 transition ml-2 border border-white/10 cursor-pointer"
            >
              <ArrowUp className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t("portal.footer.backToTop")}</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
