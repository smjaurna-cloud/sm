"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Cpu,
  ExternalLink,
  FlaskConical,
  Globe,
  Pause,
  Phone,
  Play,
  Sparkles,
} from "lucide-react";
import { useT } from "@/shared/lib/i18n/client";

/**
 * ภาพและเนื้อหาจริงจากเว็บไซต์มหาวชิราลงกรณบาลีเถรวาทราชวิทยาลัย (sakyasiha.org)
 * สำหรับใช้เป็น Motion Background เคลื่อนไหวใน Hero Section
 */
export const SAKYASIHA_SLIDES = [
  {
    id: "slide-1",
    url: "https://www.sakyasiha.org/wp-content/uploads/2023/05/01-sakyasiha.jpg",
    title: "อาคารหอประชุมเตปิฏกสังคีติสิทธาคาร",
    subtitle: "ศูนย์กลางการสังคายนาพระไตรปิฎกสากล มหาวชิราลงกรณบาลีเถรวาทราชวิทยาลัย",
  },
  {
    id: "slide-2",
    url: "https://www.sakyasiha.org/wp-content/uploads/2023/05/02-sakyasiha.jpg",
    title: "พระคันธกุฎี วชิราลงกรณ",
    subtitle: "สถาปัตยกรรมมณฑลสถานแห่งการบำเพ็ญภาวนาและศึกษาพระธรรมวินัย",
  },
  {
    id: "slide-3",
    url: "https://www.sakyasiha.org/wp-content/uploads/2023/05/03-sakyasiha.jpg",
    title: "พระมหากรุณาธิคุณอันหาที่สุดมิได้",
    subtitle: "สถาบันการศึกษาพระบาลีในพระบรมราชูปถัมภ์",
  },
  {
    id: "slide-4",
    url: "https://www.sakyasiha.org/wp-content/uploads/2023/05/04-sakyasiha.jpg",
    title: "การศึกษาพระบาลีศากยสีหะ",
    subtitle: "สร้างศาสนทายาทผู้เชี่ยวชาญพระคัมภีร์และบาลีพระไตรปิฎกสู่ระดับสากล",
  },
  {
    id: "slide-5",
    url: "https://www.sakyasiha.org/wp-content/uploads/2023/05/05-sakyasiha.jpg",
    title: "มณฑลการศึกษาและนวัตกรรมทางปัญญา",
    subtitle: "ผสมผสานพระบาลีดั้งเดิมกับวิทยาการสมัยใหม่และเทคโนโลยีดิจิทัล",
  },
];

/**
 * ข่าวสารและโครงการสำคัญจาก sakyasiha.org สำหรับแสดงในแถบเคลื่อนไหวต่อเนื่อง (Live Marquee)
 */
export const SAKYASIHA_ACTIVITIES = [
  {
    id: "act-1",
    title: "เริ่มโครงการสร้าง อาคารหอประชุม 'เตปิฏกสังคีติสิทธาคาร' รองรับสังคายนาพระไตรปิฎก",
    category: "ร่วมบุญบารมี",
    img: "https://www.sakyasiha.org/wp-content/uploads/2026/02/631873286_3345619238931038_623406079489097156_n-e1770820563436-360x189.jpg",
    href: "https://www.sakyasiha.org/",
  },
  {
    id: "act-2",
    title: "ขออนุโมทนาบุญเจ้าภาพอุปถัมภ์หมุดไม้มงคล ๒๐๙ ต้น สถาปนาราชวิทยาลัย",
    category: "ร่วมบุญบารมี",
    img: "https://www.sakyasiha.org/wp-content/uploads/2026/03/657052141_3389215314571430_3001068036657165231_n-1024x576.jpg",
    href: "https://www.sakyasiha.org/",
  },
  {
    id: "act-3",
    title: "น้อมสำนึกในพระมหากรุณาธิคุณ พระราชทานพระบรมราชูปถัมภ์",
    category: "พระมหากรุณาธิคุณ",
    img: "https://www.sakyasiha.org/wp-content/uploads/2026/05/688830931_3433009800191981_5361919156107558761_n-1024x683.jpg",
    href: "https://www.sakyasiha.org/",
  },
  {
    id: "act-4",
    title: "โครงการอบรมหลักสูตรพระบาลีศากยสีหะ ผลิตศาสนทายาทสู่เวทีนานาชาติ",
    category: "การศึกษาพระบาลี",
    img: "https://www.sakyasiha.org/wp-content/uploads/2022/04/sakyasiha-58.jpg",
    href: "https://www.sakyasiha.org/",
  },
  {
    id: "act-5",
    title: "วันเฉลิมพระชนมพรรษา พระบาทสมเด็จพระเจ้าอยู่หัว ทรงพระเจริญ",
    category: "ข่าวสารสำคัญ",
    img: "https://www.sakyasiha.org/wp-content/uploads/2026/07/758554266_1358039829772406_562747684370838445_n-1024x814.jpg",
    href: "https://www.sakyasiha.org/",
  },
  {
    id: "act-6",
    title: "พระภิกษุสามเณรบาลีศากยสีหะ มุ่งมั่นศึกษาพระธรรมวินัยและภาษาบาลี",
    category: "กิจกรรมวิชาการ",
    img: "https://www.sakyasiha.org/wp-content/uploads/2026/07/716353432_3466249233534704_2811000237085859940_n-1024x478.jpg",
    href: "https://www.sakyasiha.org/",
  },
];

export function PortalHero() {
  const t = useT();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // สลับภาพพื้นหลังอัตโนมัติทุก 6 วินาที พร้อมหยุดเมื่อกด Pause หรือชี้เมาส์
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SAKYASIHA_SLIDES.length);
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  const handlePrevSlide = () => {
    setActiveSlide((prev) =>
      prev === 0 ? SAKYASIHA_SLIDES.length - 1 : prev - 1
    );
  };

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % SAKYASIHA_SLIDES.length);
  };

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
    <section
      className="relative w-full overflow-hidden pt-8 sm:pt-14 pb-14"
      aria-label="Hero Section"
    >
      {/* ═══ 1. Dynamic Motion Background System (Sakyasiha.org Live Footage) ═══ */}
      <div
        className="absolute inset-0 -z-10 overflow-hidden select-none pointer-events-none"
        data-testid="hero-motion-background"
      >
        {/* เลเยอร์ภาพเคลื่อนไหว Ken Burns Background Slides */}
        {SAKYASIHA_SLIDES.map((slide, idx) => {
          const isActive = idx === activeSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100 z-1" : "opacity-0 z-0"
              }`}
            >
              {/* ภาพความละเอียดสูง พร้อม Animation ซูมเคลื่อนไหวช้าๆ */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.url}
                alt={slide.title}
                className={`h-full w-full object-cover object-center transition-transform duration-[7000ms] ease-out will-change-transform ${
                  isActive ? "scale-105 translate-y-[-1%]" : "scale-100"
                }`}
                loading={idx === 0 ? "eager" : "lazy"}
              />
            </div>
          );
        })}

        {/* Dynamic Gradient Mask (ผสมผสานเฉดสี Liyon Theme ทั้งใน Light & Dark Mode ให้อ่านตัวหนังสือชัด 100%) */}
        <div className="absolute inset-0 z-2 bg-gradient-to-b from-background/90 via-background/75 to-background dark:from-background/95 dark:via-background/85 dark:to-background backdrop-blur-[1.5px]" />

        {/* Radial Vignette Mask เน้นโฟกัสตรงกลาง */}
        <div className="absolute inset-0 z-3 bg-[radial-gradient(ellipse_at_center,transparent_10%,var(--background)_85%)] opacity-85" />

        {/* Ambient Glows รับกับ Token ของ Palette */}
        <div className="absolute left-1/2 -top-20 z-4 -translate-x-1/2 w-[70vw] max-w-[900px] h-[360px] rounded-full bg-[var(--brand)]/15 blur-[110px] opacity-70 dark:opacity-40" />
        <div className="absolute right-0 top-1/3 z-4 w-[350px] h-[350px] rounded-full bg-[var(--brand-light)]/10 blur-[100px] opacity-50 dark:opacity-30" />
        <div className="absolute left-0 bottom-1/4 z-4 w-[300px] h-[300px] rounded-full bg-[var(--brand2,#0E9E86)]/10 blur-[90px] opacity-40 dark:opacity-25" />
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
        {/* ═══ 2. Main Hero Intro Banner ═══ */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--brand)]/30 bg-[var(--brand)]/10 px-4 py-1.5 text-xs sm:text-sm font-semibold text-[var(--brand-ink)] dark:text-[var(--brand-light)] shadow-xs backdrop-blur-md animate-fade-in">
            <Sparkles className="h-3.5 w-3.5 text-[var(--brand)] animate-pulse" />
            <span>{t("portal.hero.badge")}</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.18] sm:leading-[1.15] drop-shadow-xs">
            <span>{t("portal.hero.title1")}</span>
            <span className="block mt-2 bg-gradient-to-r from-[var(--brand)] via-[var(--brand-light)] to-[var(--brand)] bg-clip-text text-transparent">
              {t("portal.hero.title2")}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto drop-shadow-xs">
            {t("portal.hero.subtitle")}
          </p>

          {/* Hotline Contact Info */}
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground bg-card/85 border border-border/80 rounded-full px-4 py-1 backdrop-blur-sm shadow-xs">
            <Phone className="h-3.5 w-3.5 text-[var(--brand)]" />
            <a
              href="tel:020000000"
              className="hover:text-foreground transition-colors"
            >
              {t("portal.hero.hotline")}
            </a>
          </div>

          {/* Action CTA Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4">
            <Link
              href="/curriculum"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-[var(--brand)] text-[var(--on-brand)] font-semibold text-sm sm:text-base px-7 py-3 shadow-md shadow-[var(--brand)]/25 hover:brightness-105 active:scale-98 transition-all"
            >
              <span>{t("portal.hero.cta.curriculum")}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/news"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md border border-border/90 bg-card/80 hover:bg-muted font-semibold text-sm sm:text-base px-7 py-3 shadow-xs backdrop-blur-sm transition-all"
            >
              <span>{t("portal.hero.cta.contact")}</span>
            </Link>
          </div>

          {/* ═══ Motion Slide Caption & Controller Bar ═══ */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/80 bg-card/75 backdrop-blur-md text-muted-foreground shadow-xs max-w-[90vw] truncate">
              <span className="h-2 w-2 rounded-full bg-[var(--brand)] animate-ping" />
              <span className="font-semibold text-foreground truncate">
                {SAKYASIHA_SLIDES[activeSlide].title}
              </span>
              <span className="hidden md:inline text-muted-foreground/80">
                — {SAKYASIHA_SLIDES[activeSlide].subtitle}
              </span>
            </div>

            {/* Slide Navigation Dots & Play/Pause Button */}
            <div className="inline-flex items-center gap-1.5 p-1 rounded-full border border-border/80 bg-card/75 backdrop-blur-md shadow-xs">
              <button
                type="button"
                onClick={handlePrevSlide}
                className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer"
                title={t("portal.hero.motion.prev")}
                aria-label={t("portal.hero.motion.prev")}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>

              <div className="flex items-center gap-1 px-1">
                {SAKYASIHA_SLIDES.map((slide, idx) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setActiveSlide(idx)}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === activeSlide
                        ? "w-5 bg-[var(--brand)]"
                        : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                    }`}
                    aria-label={`${t("portal.hero.motion.slide")} ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleNextSlide}
                className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer"
                title={t("portal.hero.motion.next")}
                aria-label={t("portal.hero.motion.next")}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsPaused(!isPaused)}
                className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors ml-0.5 cursor-pointer"
                title={
                  isPaused
                    ? t("portal.hero.motion.play")
                    : t("portal.hero.motion.pause")
                }
                aria-label={
                  isPaused
                    ? t("portal.hero.motion.play")
                    : t("portal.hero.motion.pause")
                }
              >
                {isPaused ? (
                  <Play className="h-3.5 w-3.5 text-[var(--brand)]" />
                ) : (
                  <Pause className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ═══ 3. Live Moving Ticker / Activity Marquee from Sakyasiha.org ═══ */}
        <div className="mt-10 sm:mt-14 overflow-hidden rounded-xl border border-border/80 bg-card/60 backdrop-blur-md p-3 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-border/50 text-xs">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <span className="flex h-2 w-2 rounded-full bg-[var(--brand)] animate-pulse" />
              <span>{t("portal.hero.motion.tickerTitle")}</span>
            </div>
            <a
              href="https://www.sakyasiha.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[var(--brand-ink)] dark:text-[var(--brand-light)] hover:underline font-medium"
            >
              <span>{t("portal.hero.motion.visitSource")}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Scrolling Strip Container */}
          <div
            className="group relative flex overflow-x-hidden"
            data-testid="hero-activity-ticker"
          >
            <div className="flex gap-4 animate-marquee group-hover:[animation-play-state:paused] whitespace-nowrap will-change-transform">
              {[...SAKYASIHA_ACTIVITIES, ...SAKYASIHA_ACTIVITIES].map(
                (act, idx) => (
                  <a
                    key={`${act.id}-${idx}`}
                    href={act.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 rounded-lg border border-border/70 bg-background/80 hover:bg-background hover:border-[var(--brand)]/50 p-2 sm:p-2.5 pr-4 shadow-2xs hover:shadow-xs transition-all duration-200 shrink-0 max-w-[340px] sm:max-w-[380px]"
                  >
                    {/* Thumbnail Image */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={act.img}
                      alt={act.title}
                      className="h-12 w-16 sm:h-14 sm:w-20 rounded-md object-cover shrink-0 border border-border/40"
                      loading="lazy"
                    />
                    <div className="min-w-0 text-left">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-[var(--brand)]/15 text-[var(--brand-ink)] dark:text-[var(--brand-light)] mb-1">
                        {act.category}
                      </span>
                      <p className="text-xs font-medium text-foreground line-clamp-2 text-wrap leading-tight">
                        {act.title}
                      </p>
                    </div>
                  </a>
                )
              )}
            </div>
          </div>
        </div>

        {/* ═══ 4. Slogan Band (BaanWebsite style: LEARN • INNOVATE • LEAD) ═══ */}
        <div className="mt-12 sm:mt-16 rounded-2xl border border-[var(--brand)]/25 bg-gradient-to-r from-[var(--brand)]/10 via-[var(--brand)]/5 to-[var(--brand)]/10 p-6 sm:p-10 shadow-xs relative overflow-hidden backdrop-blur-xs">
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

        {/* ═══ 5. Why Choose Us Feature Pillars (6 Grid Cards) ═══ */}
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
                  className="group relative rounded-xl border border-border/70 bg-card/85 p-6 shadow-xs backdrop-blur-xs transition-all duration-200 hover:-translate-y-1 hover:border-[var(--brand)]/50 hover:shadow-md flex flex-col justify-between"
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

      {/* Marquee Animation Definition */}
      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 35s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
