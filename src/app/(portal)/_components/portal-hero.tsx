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
  Heart,
  Pause,
  Phone,
  Play,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useT } from "@/shared/lib/i18n/client";

/**
 * ภาพและเนื้อหาจริงจากเว็บไซต์มหาวชิราลงกรณบาลีเถรวาทราชวิทยาลัย (sakyasiha.org)
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
 * ข่าวสารและโครงการสำคัญจาก sakyasiha.org สำหรับแสดงในแถบเคลื่อนไหว
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
  const [isSlidePaused, setIsSlidePaused] = useState(false);
  const slideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // สลับภาพพื้นหลังอัตโนมัติทุก 6 วินาที
  useEffect(() => {
    if (isSlidePaused) return;
    slideTimerRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SAKYASIHA_SLIDES.length);
    }, 6000);

    return () => {
      if (slideTimerRef.current) clearInterval(slideTimerRef.current);
    };
  }, [isSlidePaused]);

  // ระบบ Mindful Breathing Interactive Animation (Inhale 4s -> Hold 4s -> Exhale 4s)
  const [breathePhase, setBreathePhase] = useState<"in" | "hold" | "out">("in");
  const [isBreathingActive, setIsBreathingActive] = useState(true);

  useEffect(() => {
    if (!isBreathingActive) return;

    const cycle = () => {
      setBreathePhase("in");
      const t1 = setTimeout(() => {
        setBreathePhase("hold");
        const t2 = setTimeout(() => {
          setBreathePhase("out");
        }, 4000);
        return () => clearTimeout(t2);
      }, 4000);
      return () => clearTimeout(t1);
    };

    cycle();
    const interval = setInterval(cycle, 12000);
    return () => clearInterval(interval);
  }, [isBreathingActive]);

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
      color: "bg-emerald-100 dark:bg-emerald-950/50",
      accent: "bg-emerald-400",
    },
    {
      icon: FlaskConical,
      title: t("portal.hero.pillar2.title"),
      desc: t("portal.hero.pillar2.desc"),
      color: "bg-sky-100 dark:bg-sky-950/50",
      accent: "bg-sky-400",
    },
    {
      icon: Globe,
      title: t("portal.hero.pillar3.title"),
      desc: t("portal.hero.pillar3.desc"),
      color: "bg-purple-100 dark:bg-purple-950/50",
      accent: "bg-purple-400",
    },
    {
      icon: Briefcase,
      title: t("portal.hero.pillar4.title"),
      desc: t("portal.hero.pillar4.desc"),
      color: "bg-amber-100 dark:bg-amber-950/50",
      accent: "bg-amber-400",
    },
    {
      icon: Award,
      title: t("portal.hero.pillar5.title"),
      desc: t("portal.hero.pillar5.desc"),
      color: "bg-rose-100 dark:bg-rose-950/50",
      accent: "bg-rose-400",
    },
    {
      icon: Cpu,
      title: t("portal.hero.pillar6.title"),
      desc: t("portal.hero.pillar6.desc"),
      color: "bg-teal-100 dark:bg-teal-950/50",
      accent: "bg-teal-400",
    },
  ];

  return (
    <section
      className="relative w-full overflow-hidden bg-[#faf8f5] dark:bg-[#111113] pt-6 sm:pt-12 pb-16 transition-colors"
      aria-label="Hero Section"
    >
      {/* ═══ Neubrutalist Dot-Matrix Grid Background ═══ */}
      <div
        className="absolute inset-0 pointer-events-none -z-10 bg-[radial-gradient(#000000_1.2px,transparent_1.2px)] dark:bg-[radial-gradient(#ffffff_1.2px,transparent_1.2px)] [background-size:26px_26px] opacity-15 dark:opacity-20"
        aria-hidden="true"
      />

      {/* Playful Floating Shapes / Stickers */}
      <div className="absolute top-12 left-4 sm:left-12 text-2xl sm:text-3xl select-none animate-float-slow pointer-events-none opacity-80">
        ✦
      </div>
      <div className="absolute top-28 right-6 sm:right-16 text-xl sm:text-2xl select-none animate-float-reverse pointer-events-none text-amber-500 opacity-80">
        ★
      </div>
      <div className="absolute bottom-24 left-8 text-2xl select-none animate-pulse pointer-events-none text-rose-500 opacity-70">
        ✿
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* ═══ 1. Neubrutalist Main Intro & Badges ═══ */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Tilted Sticker Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-amber-300 dark:bg-amber-400 px-5 py-1.5 text-xs sm:text-sm font-black text-black shadow-[4px_4px_0px_0px_#000] -rotate-1 hover:rotate-0 transition-transform cursor-default select-none">
            <Sparkles className="h-4 w-4 animate-spin text-black" />
            <span>{t("portal.hero.badge")}</span>
          </div>

          {/* Main Headline with Neubrutalist Highlight Box */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.2] sm:leading-[1.15]">
            <span className="block">{t("portal.hero.title1")}</span>
            <span className="inline-block mt-2 sm:mt-3 px-4 sm:px-6 py-1.5 rounded-2xl bg-emerald-300 dark:bg-emerald-400 text-black border-2 sm:border-3 border-black shadow-[5px_5px_0px_0px_#000] rotate-1 hover:-rotate-1 transition-transform">
              {t("portal.hero.title2")}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
            {t("portal.hero.subtitle")}
          </p>

          {/* Hotline Contact Pill */}
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-foreground bg-white dark:bg-zinc-800 border-2 border-black rounded-full px-5 py-1.5 shadow-[3px_3px_0px_0px_#000]">
            <Phone className="h-4 w-4 text-[var(--brand)]" />
            <a
              href="tel:020000000"
              className="hover:underline transition-colors"
            >
              {t("portal.hero.hotline")}
            </a>
          </div>

          {/* Tactile Neubrutalist Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/curriculum"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand,#2563EB)] text-white font-black text-sm sm:text-base px-8 py-3.5 border-2 sm:border-3 border-black shadow-[5px_5px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_0px_#000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[1px_1px_0px_0px_#000] transition-all"
            >
              <span>{t("portal.hero.cta.curriculum")}</span>
              <ArrowRight className="h-4 w-4 stroke-[3]" />
            </Link>

            <Link
              href="/news"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border-2 sm:border-3 border-black bg-white dark:bg-zinc-800 text-foreground font-black text-sm sm:text-base px-8 py-3.5 shadow-[5px_5px_0px_0px_#000] hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_0px_#000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[1px_1px_0px_0px_#000] transition-all"
            >
              <span>{t("portal.hero.cta.contact")}</span>
            </Link>
          </div>
        </div>

        {/* ═══ 2. Centerpiece Neubrutalist OS Window Showcase ═══ */}
        <div className="mt-12 sm:mt-16 relative max-w-5xl mx-auto">
          {/* Floating Sticker: Mindful & Wisdom (Top Left) */}
          <div className="absolute -top-6 -left-3 sm:-left-6 z-20 hidden sm:inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-rose-300 text-black px-3.5 py-2 font-black text-xs shadow-[4px_4px_0px_0px_#000] -rotate-3 hover:rotate-0 transition-transform animate-float-slow select-none">
            <Heart className="h-4 w-4 fill-rose-500 text-black" />
            <span>{t("portal.hero.neubrutalism.sticker1")}</span>
          </div>

          {/* Floating Sticker: 209 Sacred Pillars (Top Right) */}
          <div className="absolute -top-7 -right-2 sm:-right-6 z-20 hidden sm:inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-cyan-300 text-black px-3.5 py-2 font-black text-xs shadow-[4px_4px_0px_0px_#000] rotate-3 hover:rotate-0 transition-transform animate-float-reverse select-none">
            <span>⭐</span>
            <span>{t("portal.hero.neubrutalism.sticker2")}</span>
          </div>

          {/* Window Card Frame */}
          <div
            className="rounded-3xl border-3 border-black bg-white dark:bg-zinc-900 shadow-[8px_8px_0px_0px_#000] sm:shadow-[12px_12px_0px_0px_#000] overflow-hidden"
            data-testid="hero-motion-background"
          >
            {/* Retro Window Titlebar */}
            <div className="border-b-3 border-black bg-zinc-100 dark:bg-zinc-800 px-4 py-3 flex items-center justify-between">
              {/* Traffic Light Dots */}
              <div className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full border border-black bg-rose-500 shadow-2xs" />
                <span className="h-3.5 w-3.5 rounded-full border border-black bg-amber-400 shadow-2xs" />
                <span className="h-3.5 w-3.5 rounded-full border border-black bg-emerald-500 shadow-2xs" />
              </div>

              <div className="text-xs font-mono font-bold text-foreground/80 truncate px-2">
                sakyasiha.org • wellness & wisdom portal
              </div>

              {/* Live Badge */}
              <div className="inline-flex items-center gap-1.5 rounded-full border border-black bg-emerald-300 text-black px-2.5 py-0.5 text-[11px] font-bold">
                <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>{t("portal.hero.neubrutalism.liveBadge")}</span>
              </div>
            </div>

            {/* Window Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 relative min-h-[360px] sm:min-h-[440px]">
              {/* Left/Main Column: Live Footage Slideshow with Ken Burns Motion */}
              <div className="lg:col-span-8 relative overflow-hidden bg-black min-h-[260px] sm:min-h-[360px]">
                {SAKYASIHA_SLIDES.map((slide, idx) => {
                  const isActive = idx === activeSlide;
                  return (
                    <div
                      key={slide.id}
                      className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                        isActive ? "opacity-100 z-1" : "opacity-0 z-0"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={slide.url}
                        alt={slide.title}
                        className={`h-full w-full object-cover object-center transition-transform duration-[7000ms] ease-out will-change-transform ${
                          isActive ? "scale-105" : "scale-100"
                        }`}
                        loading={idx === 0 ? "eager" : "lazy"}
                      />
                    </div>
                  );
                })}

                {/* Subtle Image Bottom Overlay */}
                <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 sm:p-6 text-white">
                  <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-black bg-amber-400 text-black border border-black mb-1.5">
                    {t("portal.hero.neubrutalism.sticker4")}
                  </span>
                  <h3 className="text-base sm:text-xl font-black text-white drop-shadow-md">
                    {SAKYASIHA_SLIDES[activeSlide].title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-200 drop-shadow-sm line-clamp-1">
                    {SAKYASIHA_SLIDES[activeSlide].subtitle}
                  </p>
                </div>
              </div>

              {/* Right Column: Interactive Mindful Breathing & Controls */}
              <div className="lg:col-span-4 border-t-3 lg:border-t-0 lg:border-l-3 border-black bg-amber-50 dark:bg-zinc-800/90 p-5 sm:p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b-2 border-black/20 pb-3 mb-4">
                    <span className="text-xs font-black uppercase tracking-wider text-foreground">
                      ✦ MINDFUL BREATHING
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsBreathingActive(!isBreathingActive)}
                      className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>
                        {isBreathingActive
                          ? t("portal.hero.neubrutalism.breatheStop")
                          : t("portal.hero.neubrutalism.breatheStart")}
                      </span>
                    </button>
                  </div>

                  {/* Pulsing Breathing Orb */}
                  <div className="flex flex-col items-center justify-center py-4">
                    <div
                      className={`relative flex items-center justify-center rounded-full border-3 border-black bg-emerald-300 dark:bg-emerald-400 shadow-[4px_4px_0px_0px_#000] transition-all duration-[3800ms] ease-in-out ${
                        breathePhase === "in"
                          ? "h-28 w-28 scale-110"
                          : breathePhase === "hold"
                          ? "h-28 w-28 scale-110 rotate-12"
                          : "h-20 w-20 scale-95"
                      }`}
                    >
                      <span className="text-xl">🧘</span>
                    </div>

                    <div className="mt-4 text-center">
                      <span className="inline-block px-3 py-1 rounded-lg border-2 border-black bg-white dark:bg-zinc-900 text-foreground font-black text-xs shadow-[2px_2px_0px_0px_#000]">
                        {breathePhase === "in" &&
                          t("portal.hero.neubrutalism.breatheIn")}
                        {breathePhase === "hold" &&
                          t("portal.hero.neubrutalism.breatheHold")}
                        {breathePhase === "out" &&
                          t("portal.hero.neubrutalism.breatheOut")}
                      </span>
                      <p className="text-[11px] text-muted-foreground mt-2 font-medium">
                        สูดลมหายใจเพื่อสร้างสติ เจริญปัญญาตามแนวพุทธ
                      </p>
                    </div>
                  </div>
                </div>

                {/* Slide Controller Bar */}
                <div className="pt-4 border-t-2 border-black/20 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handlePrevSlide}
                      className="p-1.5 rounded-lg border-2 border-black bg-white dark:bg-zinc-700 hover:bg-zinc-100 shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
                      title={t("portal.hero.motion.prev")}
                      aria-label={t("portal.hero.motion.prev")}
                    >
                      <ChevronLeft className="h-3.5 w-3.5 text-black dark:text-white" />
                    </button>

                    <div className="flex items-center gap-1 px-1">
                      {SAKYASIHA_SLIDES.map((slide, idx) => (
                        <button
                          key={slide.id}
                          type="button"
                          onClick={() => setActiveSlide(idx)}
                          className={`h-2.5 rounded-md border border-black transition-all cursor-pointer ${
                            idx === activeSlide
                              ? "w-6 bg-[var(--brand)]"
                              : "w-2.5 bg-zinc-300 dark:bg-zinc-600"
                          }`}
                          aria-label={`${t("portal.hero.motion.slide")} ${
                            idx + 1
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleNextSlide}
                      className="p-1.5 rounded-lg border-2 border-black bg-white dark:bg-zinc-700 hover:bg-zinc-100 shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
                      title={t("portal.hero.motion.next")}
                      aria-label={t("portal.hero.motion.next")}
                    >
                      <ChevronRight className="h-3.5 w-3.5 text-black dark:text-white" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsSlidePaused(!isSlidePaused)}
                    className="p-1.5 rounded-lg border-2 border-black bg-white dark:bg-zinc-700 hover:bg-zinc-100 shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
                    title={
                      isSlidePaused
                        ? t("portal.hero.motion.play")
                        : t("portal.hero.motion.pause")
                    }
                    aria-label={
                      isSlidePaused
                        ? t("portal.hero.motion.play")
                        : t("portal.hero.motion.pause")
                    }
                  >
                    {isSlidePaused ? (
                      <Play className="h-3.5 w-3.5 text-[var(--brand)]" />
                    ) : (
                      <Pause className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ 3. High-Contrast Neubrutalist Marquee Ticker Strip ═══ */}
        <div className="mt-14 -mx-4 sm:-mx-6 overflow-hidden border-y-3 border-black bg-yellow-300 dark:bg-yellow-400 py-3 shadow-[0px_4px_0px_0px_#000]">
          <div
            className="group relative flex overflow-x-hidden"
            data-testid="hero-activity-ticker"
          >
            <div className="flex gap-6 animate-marquee group-hover:[animation-play-state:paused] whitespace-nowrap will-change-transform text-black font-black text-xs sm:text-sm tracking-widest uppercase select-none">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center gap-6">
                  <span>✦ WELLNESS & WISDOM</span>
                  <span className="text-zinc-800">★ TEPIṬAKA CHANTING</span>
                  <span>✦ มหาวชิราลงกรณบาลีเถรวาทราชวิทยาลัย</span>
                  <span className="text-zinc-800">★ MINDFUL LIVING</span>
                  <span>✦ สังคายนาพระไตรปิฎกสากล</span>
                  <span className="text-zinc-800">★ ๒๐๙ หมุดไม้มงคล</span>
                  <span>✦ ศากยสีหะ บาลีเถรวาท</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ 4. Live Activities Cards Ticker from Sakyasiha.org ═══ */}
        <div className="mt-8 overflow-hidden rounded-2xl border-3 border-black bg-white dark:bg-zinc-900 p-4 shadow-[6px_6px_0px_0px_#000]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-black/15 text-xs">
            <div className="flex items-center gap-2 font-black text-foreground">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 border border-black animate-ping" />
              <span>{t("portal.hero.motion.tickerTitle")}</span>
            </div>
            <a
              href="https://www.sakyasiha.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold text-foreground hover:underline"
            >
              <span>{t("portal.hero.motion.visitSource")}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="group relative flex overflow-x-hidden">
            <div className="flex gap-4 animate-marquee group-hover:[animation-play-state:paused] whitespace-nowrap will-change-transform">
              {[...SAKYASIHA_ACTIVITIES, ...SAKYASIHA_ACTIVITIES].map(
                (act, idx) => (
                  <a
                    key={`${act.id}-${idx}`}
                    href={act.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 rounded-xl border-2 border-black bg-zinc-50 dark:bg-zinc-800 hover:bg-amber-100 dark:hover:bg-zinc-700 p-2.5 pr-4 shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all shrink-0 max-w-[340px] sm:max-w-[380px]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={act.img}
                      alt={act.title}
                      className="h-12 w-16 sm:h-14 sm:w-20 rounded-lg object-cover shrink-0 border-2 border-black"
                      loading="lazy"
                    />
                    <div className="min-w-0 text-left">
                      <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-300 text-black border border-black mb-1">
                        {act.category}
                      </span>
                      <p className="text-xs font-bold text-foreground line-clamp-2 text-wrap leading-tight">
                        {act.title}
                      </p>
                    </div>
                  </a>
                )
              )}
            </div>
          </div>
        </div>

        {/* ═══ 5. Neubrutalist Slogan Band (LEARN • INNOVATE • LEAD) ═══ */}
        <div className="mt-14 sm:mt-18 rounded-3xl border-3 border-black bg-purple-200 dark:bg-purple-950/50 p-6 sm:p-10 shadow-[8px_8px_0px_0px_#000] relative overflow-hidden">
          <div className="relative z-10 text-center space-y-4">
            <div className="inline-block px-4 py-1 rounded-full border-2 border-black bg-black text-white dark:bg-white dark:text-black font-black tracking-[0.2em] text-xs sm:text-sm uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,0.4)]">
              {t("portal.hero.slogan")}
            </div>

            <p className="text-sm sm:text-base lg:text-lg text-foreground font-bold max-w-3xl mx-auto leading-relaxed">
              {t("portal.hero.sloganDesc")}{" "}
              <span className="inline-block px-3 py-0.5 rounded-lg border-2 border-black bg-yellow-300 text-black shadow-[2px_2px_0px_0px_#000] font-black">
                &ldquo;{t("portal.hero.sloganGoal")}&rdquo;
              </span>
            </p>

            <div className="pt-2">
              <Link
                href="/curriculum"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-black bg-white dark:bg-zinc-800 px-6 py-2.5 text-xs sm:text-sm font-black text-foreground shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
              >
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>{t("portal.hero.sloganCta")}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ═══ 6. Why Choose Us - Tactile Neubrutalist Feature Cards ═══ */}
        <div className="mt-14 sm:mt-20">
          <div className="text-center space-y-2 mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground">
              {t("portal.hero.whyTitle")}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-semibold max-w-xl mx-auto">
              {t("portal.hero.whySubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className={`group relative rounded-2xl border-3 border-black ${pillar.color} p-6 shadow-[6px_6px_0px_0px_#000] transition-all duration-200 hover:-translate-y-2 hover:-translate-x-1 hover:shadow-[10px_10px_0px_0px_#000] flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-black bg-black text-white dark:bg-white dark:text-black mb-4 shadow-[3px_3px_0px_0px_#000] group-hover:rotate-6 transition-transform">
                      <Icon className="h-6 w-6" />
                    </div>

                    <h3 className="text-lg font-black text-foreground mb-2">
                      {pillar.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-foreground/80 font-medium leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Neubrutalism Animation Styles */}
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

        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0px) rotate(-3deg);
          }
          50% {
            transform: translateY(-8px) rotate(-1deg);
          }
        }
        .animate-float-slow {
          animation: float-slow 4s ease-in-out infinite;
        }

        @keyframes float-reverse {
          0%, 100% {
            transform: translateY(0px) rotate(3deg);
          }
          50% {
            transform: translateY(8px) rotate(1deg);
          }
        }
        .animate-float-reverse {
          animation: float-reverse 4.5s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-marquee,
          .animate-float-slow,
          .animate-float-reverse {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
}
