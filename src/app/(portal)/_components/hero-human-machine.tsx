"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Plus,
  X,
  BookOpen,
  FlaskConical,
  CalendarCheck,
  FileCheck,
  Landmark,
  Target,
  Newspaper,
  Users,
  ArrowUpRight,
} from "lucide-react";

export function HeroHumanMachine() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay may be restricted on some devices
      });
    }
  }, []);

  const menuLinks = [
    { title: "หลักสูตร AI & Bionics", href: "/curriculum", icon: BookOpen, desc: "Curriculum Management" },
    { title: "งานวิจัยและนวัตกรรม", href: "/research", icon: FlaskConical, desc: "Research & Publications" },
    { title: "ระบบจองห้องแล็บและรถ", href: "/booking", icon: CalendarCheck, desc: "Facility & Vehicle Booking" },
    { title: "ระบบเอกสารและคำร้อง", href: "/edoc", icon: FileCheck, desc: "E-Document Workflow" },
    { title: "งบประมาณและการเงิน", href: "/finance", icon: Landmark, desc: "Budget & Fiscal Transparency" },
    { title: "แผนยุทธศาสตร์และ KPI", href: "/strategy", icon: Target, desc: "Strategic Plan & Progress" },
    { title: "ข่าวสารและกิจกรรม", href: "/news", icon: Newspaper, desc: "News & Announcements" },
    { title: "ทำเนียบคณาจารย์", href: "/staff", icon: Users, desc: "Faculty & Staff Directory" },
  ];

  return (
    <section className="relative w-full overflow-hidden bg-[#E9E9EB] text-[#111827] min-h-[90vh] lg:min-h-[96vh] flex flex-col justify-between selection:bg-neutral-900 selection:text-white">
      {/* Background Layer: Animated Loop Video with High-Definition Poster */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Ambient Chromatic Dispersion Center Glow */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[55vw] max-w-[800px] h-[55vw] max-h-[800px] rounded-full bg-gradient-to-tr from-cyan-300/25 via-fuchsia-300/20 to-amber-200/25 blur-3xl opacity-80" />

        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setIsVideoLoaded(true)}
          poster="/images/hero-human-machine.webp"
          className={`h-full w-full object-cover object-center transition-opacity duration-1000 ${
            isVideoLoaded ? "opacity-100" : "opacity-0"
          }`}
        >
          <source src="/videos/humanmachine.mp4" type="video/mp4" />
        </video>

        {/* Fallback Image while video loads */}
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${
            isVideoLoaded ? "opacity-0" : "opacity-100"
          }`}
          style={{ backgroundImage: "url('/images/hero-human-machine.webp')" }}
        />

        {/* Subtle Vignette & Light Grading */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/10" />
      </div>

      {/* Top Navigation Bar: Capsule Pills 100% MotionSites Standard */}
      <div className="relative z-20 w-full px-4 sm:px-8 pt-6 sm:pt-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          {/* Brand Logo & Menu Pill */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 transition hover:opacity-80"
            >
              {/* Slanted Parallel Bars Logo Icon */}
              <div className="flex items-center gap-1">
                <span className="h-4 w-1.5 -rotate-12 rounded-full bg-black inline-block" />
                <span className="h-4 w-1.5 -rotate-12 rounded-full bg-black inline-block" />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-neutral-900 font-sans">
                NeuralKinetics
              </span>
            </Link>

            {/* Menu Trigger Capsule */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="flex items-center gap-2 rounded-full bg-neutral-950 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-neutral-800 active:scale-95"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-neutral-950">
                <Plus className="h-3 w-3 stroke-[3]" />
              </span>
              <span>Menu</span>
            </button>
          </div>

          {/* Center Navigation Capsule Pill */}
          <div className="hidden md:flex items-center gap-6 rounded-full border border-white/60 bg-white/70 px-6 py-2 shadow-xs backdrop-blur-md">
            <Link
              href="/curriculum"
              className="text-xs font-medium tracking-tight text-neutral-700 transition hover:text-neutral-950"
            >
              Advanced Bionics
            </Link>
            <Link
              href="/research"
              className="text-xs font-medium tracking-tight text-neutral-700 transition hover:text-neutral-950"
            >
              Cognitive AI
            </Link>
          </div>

          {/* Right Capsule Pill */}
          <Link
            href="/booking"
            className="flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-xs font-semibold text-neutral-900 shadow-xs backdrop-blur-md transition hover:bg-white hover:shadow-sm"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-950 text-white">
              <Sparkles className="h-3 w-3 fill-current" />
            </span>
            <span className="hidden sm:inline">Adaptive Systems</span>
          </Link>
        </div>
      </div>

      {/* Center Cinematic Headline (Overlay over Hands & Chromatic Dispersion) */}
      <div className="relative z-10 my-auto w-full px-4 text-center">
        <div className="mx-auto max-w-4xl py-12 sm:py-16">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-neutral-900 font-sans leading-[1.08]">
            <span className="block drop-shadow-xs">NeuralKinetics</span>
            <span className="mt-1 block font-semibold text-2xl sm:text-4xl md:text-5xl tracking-tight">
              <span className="text-neutral-500 font-normal">cybernetics</span>{" "}
              <span className="font-extrabold text-neutral-900">made organic</span>
            </span>
          </h1>
        </div>
      </div>

      {/* Bottom Editorial Statement & Category Pills */}
      <div className="relative z-20 w-full px-4 sm:px-8 pb-8 sm:pb-10">
        <div className="mx-auto flex max-w-7xl flex-col lg:flex-row lg:items-end justify-between gap-6">
          {/* Left Editorial Statement */}
          <div className="max-w-md space-y-1.5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 font-mono">
              Autonomous Dynamics
            </div>
            <p className="text-sm sm:text-base font-normal leading-snug text-neutral-900">
              Unifying biological grace with machine intelligence to design the next era of fusion
            </p>
          </div>

          {/* Subtle Vertical Divider on Desktop */}
          <div className="hidden lg:block h-12 w-[1px] bg-neutral-300 self-center" />

          {/* Right Interactive Tags / Pills */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/research"
              className="rounded-full border border-neutral-400/80 bg-white/40 px-5 py-2 text-xs font-medium text-neutral-900 backdrop-blur-xs transition hover:bg-neutral-950 hover:text-white hover:border-neutral-950"
            >
              Neuromorphic
            </Link>
            <Link
              href="/curriculum"
              className="rounded-full border border-neutral-400/80 bg-white/40 px-5 py-2 text-xs font-medium text-neutral-900 backdrop-blur-xs transition hover:bg-neutral-950 hover:text-white hover:border-neutral-950"
            >
              AGI
            </Link>
            <Link
              href="/strategy"
              className="rounded-full border border-neutral-400/80 bg-white/40 px-5 py-2 text-xs font-medium text-neutral-900 backdrop-blur-xs transition hover:bg-neutral-950 hover:text-white hover:border-neutral-950"
            >
              Cybernetics
            </Link>
          </div>
        </div>
      </div>

      {/* Full-Screen Glassmorphic Menu Overlay when clicking "+ Menu" */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl rounded-3xl border border-white/20 bg-[#F3F3F5] p-6 sm:p-8 shadow-2xl text-neutral-900">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="h-4 w-1.5 -rotate-12 rounded-full bg-black inline-block" />
                <span className="h-4 w-1.5 -rotate-12 rounded-full bg-black inline-block" />
                <span className="font-bold text-lg">NeuralKinetics Ecosystem</span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="rounded-full p-1.5 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-950 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {menuLinks.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={idx}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="group flex items-center justify-between p-3.5 rounded-2xl bg-white border border-neutral-200/80 hover:border-neutral-900 hover:shadow-xs transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-900 group-hover:bg-neutral-950 group-hover:text-white transition">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-neutral-900 group-hover:text-black">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-neutral-500 font-mono">
                          {item.desc}
                        </div>
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-neutral-400 group-hover:text-neutral-950 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
