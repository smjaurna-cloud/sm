"use client";

import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  Cpu,
  FlaskConical,
  Globe,
  Phone,
  Sparkles,
} from "lucide-react";
import { useT } from "@/shared/lib/i18n/client";

export function PortalHero() {
  const t = useT();

  const pillars = [
    {
      icon: BookOpen,
      title: t("portal.hero.pillar1.title"),
      desc: t("portal.hero.pillar1.desc"),
    },
    {
      icon: FlaskConical,
      title: t("portal.hero.pillar2.title"),
      desc: t("portal.hero.pillar2.desc"),
    },
    {
      icon: Globe,
      title: t("portal.hero.pillar3.title"),
      desc: t("portal.hero.pillar3.desc"),
    },
    {
      icon: Briefcase,
      title: t("portal.hero.pillar4.title"),
      desc: t("portal.hero.pillar4.desc"),
    },
    {
      icon: Award,
      title: t("portal.hero.pillar5.title"),
      desc: t("portal.hero.pillar5.desc"),
    },
    {
      icon: Cpu,
      title: t("portal.hero.pillar6.title"),
      desc: t("portal.hero.pillar6.desc"),
    },
  ];

  return (
    <section className="relative w-full overflow-hidden pt-8 sm:pt-14 pb-12">
      {/* Dynamic Background Glows matching Liyon Theme Tokens */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute left-1/2 -top-24 -translate-x-1/2 w-[70vw] max-w-[900px] h-[350px] rounded-full bg-[var(--brand)]/15 blur-[100px] opacity-70 dark:opacity-40" />
        {/* Ambient Side Accent */}
        <div className="absolute right-0 top-1/3 w-[350px] h-[350px] rounded-full bg-[var(--brand-light)]/10 blur-[90px] opacity-50 dark:opacity-30" />
        <div className="absolute left-0 bottom-1/4 w-[300px] h-[300px] rounded-full bg-[var(--brand2,#0E9E86)]/10 blur-[90px] opacity-40 dark:opacity-25" />
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* 1. Main Hero Intro Banner */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--brand)]/30 bg-[var(--brand)]/10 px-4 py-1.5 text-xs sm:text-sm font-semibold text-[var(--brand-ink)] dark:text-[var(--brand-light)] shadow-xs backdrop-blur-md animate-fade-in">
            <Sparkles className="h-3.5 w-3.5 text-[var(--brand)] animate-pulse" />
            <span>{t("portal.hero.badge")}</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.18] sm:leading-[1.15]">
            <span>{t("portal.hero.title1")}</span>
            <span className="block mt-2 bg-gradient-to-r from-[var(--brand)] via-[var(--brand-light)] to-[var(--brand)] bg-clip-text text-transparent">
              {t("portal.hero.title2")}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {t("portal.hero.subtitle")}
          </p>

          {/* Hotline Contact Info */}
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground bg-muted/50 border rounded-full px-4 py-1">
            <Phone className="h-3.5 w-3.5 text-[var(--brand)]" />
            <a
              href="tel:020000000"
              className="hover:text-foreground transition-colors"
            >
              {t("portal.hero.hotline")}
            </a>
          </div>

          {/* Action CTA Buttons */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4">
            <Link
              href="/curriculum"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-[var(--brand)] text-[var(--on-brand)] font-semibold text-sm sm:text-base px-7 py-3 shadow-md shadow-[var(--brand)]/20 hover:brightness-105 active:scale-98 transition-all"
            >
              <span>{t("portal.hero.cta.curriculum")}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/news"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md border border-border/80 bg-background/80 hover:bg-muted font-semibold text-sm sm:text-base px-7 py-3 shadow-xs transition-all"
            >
              <span>{t("portal.hero.cta.contact")}</span>
            </Link>
          </div>
        </div>

        {/* 2. Slogan Band (BaanWebsite style: LEARN • INNOVATE • LEAD) */}
        <div className="mt-14 sm:mt-20 rounded-2xl border border-[var(--brand)]/25 bg-gradient-to-r from-[var(--brand)]/10 via-[var(--brand)]/5 to-[var(--brand)]/10 p-6 sm:p-10 shadow-xs relative overflow-hidden backdrop-blur-xs">
          <div className="relative z-10 text-center space-y-4">
            <div className="font-bold tracking-[0.25em] text-xs sm:text-sm uppercase text-[var(--brand-ink)] dark:text-[var(--brand-light)]">
              {t("portal.hero.slogan")}
            </div>

            <p className="text-sm sm:text-base lg:text-lg text-foreground font-medium max-w-3xl mx-auto leading-relaxed">
              {t("portal.hero.sloganDesc")}{" "}
              <span className="font-bold text-[var(--brand)] underline decoration-[var(--brand)]/40 underline-offset-4">
                &ldquo;{t("portal.hero.sloganGoal")}&rdquo;
              </span>
            </p>

            <div className="pt-1">
              <Link
                href="/curriculum"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--brand)]/40 bg-background/90 px-5 py-2 text-xs sm:text-sm font-semibold text-foreground hover:bg-[var(--brand)] hover:text-[var(--on-brand)] shadow-xs transition-all"
              >
                <Sparkles className="h-3.5 w-3.5 text-[var(--brand)]" />
                <span>{t("portal.hero.sloganCta")}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 3. Why Choose Us Feature Pillars (6 Grid Cards) */}
        <div className="mt-14 sm:mt-20">
          <div className="text-center space-y-2 mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {t("portal.hero.whyTitle")}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
              {t("portal.hero.whySubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="group relative rounded-xl border border-border/70 bg-card/80 p-6 shadow-xs backdrop-blur-xs transition-all duration-200 hover:-translate-y-1 hover:border-[var(--brand)]/50 hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--brand)]/10 text-[var(--brand)] group-hover:bg-[var(--brand)] group-hover:text-[var(--on-brand)] transition-colors mb-4 shadow-xs">
                      <Icon className="h-5 w-5" />
                    </div>

                    <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-[var(--brand-ink)] dark:group-hover:text-[var(--brand-light)] transition-colors">
                      {pillar.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
