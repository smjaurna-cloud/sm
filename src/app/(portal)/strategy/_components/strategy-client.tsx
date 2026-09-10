"use client";

import { useState } from "react";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import type {
  StrategicPlanDto,
  KpiStatus,
} from "@/features/strategy";
import {
  Target,
  Compass,
  Award,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Search,
  BookOpen,
} from "lucide-react";

interface StrategyClientProps {
  plan: StrategicPlanDto | null;
}

export function StrategyClient({ plan }: StrategyClientProps) {
  const t = useT();
  const locale = useLocale();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPillarId, setSelectedPillarId] = useState<string>("ALL");

  if (!plan) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Target className="mx-auto h-12 w-12 text-muted-foreground stroke-1 mb-3" />
          <h2 className="text-lg font-bold">{t("strategy.empty")}</h2>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: KpiStatus) => {
    switch (status) {
      case "ACHIEVED":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <CheckCircle className="h-3 w-3" />
            {t("strategy.status.achieved")}
          </span>
        );
      case "ON_TRACK":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            <TrendingUp className="h-3 w-3" />
            {t("strategy.status.on_track")}
          </span>
        );
      case "AT_RISK":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            <Clock className="h-3 w-3" />
            {t("strategy.status.at_risk")}
          </span>
        );
      case "OFF_TRACK":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
            <AlertCircle className="h-3 w-3" />
            {t("strategy.status.off_track")}
          </span>
        );
    }
  };

  const filteredPillars = plan.pillars
    .filter((pillar) => selectedPillarId === "ALL" || pillar.id === selectedPillarId)
    .map((pillar) => {
      const query = searchQuery.toLowerCase();
      const filteredKpis = pillar.kpis.filter((kpi) => {
        if (!query) return true;
        return (
          kpi.code.toLowerCase().includes(query) ||
          kpi.nameTh.toLowerCase().includes(query) ||
          kpi.nameEn.toLowerCase().includes(query)
        );
      });
      return { ...pillar, kpis: filteredKpis };
    })
    .filter((pillar) => pillar.kpis.length > 0 || !searchQuery);

  return (
    <div className="min-h-screen bg-background">
      {/* Header Banner */}
      <section className="border-b bg-muted/20 py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-semibold text-primary">
                <Target className="h-3.5 w-3.5" />
                <span>
                  พ.ศ. {plan.startYear} - {plan.endYear} (
                  {plan.startYear - 543} - {plan.endYear - 543})
                </span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
                {locale === "th" ? plan.nameTh : plan.nameEn}
              </h1>
              <p className="max-w-3xl text-muted-foreground text-sm sm:text-base">
                {t("strategy.subtitle")}
              </p>
            </div>

            {/* Overall Achievement Card */}
            <div className="rounded-2xl border bg-card p-5 shadow-xs shrink-0 md:min-w-[260px]">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-1">
                <span>{t("strategy.overallProgress")}</span>
                <Award className="h-4 w-4 text-primary" />
              </div>
              <div className="text-3xl font-black text-primary">
                {plan.overallAchievementRate}%
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden mt-3 mb-2">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${plan.overallAchievementRate}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>ตัวชี้วัดทั้งหมด: {plan.totalKpis} รายการ</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {plan.kpiStatusCounts.achieved + plan.kpiStatusCounts.onTrack} ผ่านเป้า
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Cards */}
      <section className="py-8">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border bg-card p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-primary font-bold mb-3">
                  <Compass className="h-5 w-5" />
                  <span className="text-base tracking-wide uppercase">
                    {t("strategy.vision")}
                  </span>
                </div>
                <p className="text-foreground font-semibold text-base leading-relaxed">
                  &ldquo;{locale === "th" ? plan.visionTh : plan.visionEn}&rdquo;
                </p>
              </div>
              <div className="mt-4 pt-3 border-t text-xs text-muted-foreground italic">
                {locale === "th" ? plan.visionEn : plan.visionTh}
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-primary font-bold mb-3">
                  <BookOpen className="h-5 w-5" />
                  <span className="text-base tracking-wide uppercase">
                    {t("strategy.mission")}
                  </span>
                </div>
                <div className="text-foreground text-xs sm:text-sm leading-relaxed whitespace-pre-line space-y-1">
                  {locale === "th" ? plan.missionTh : plan.missionEn}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KPIs & Pillars Section */}
      <section className="py-8">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                {t("strategy.pillars")} & {t("strategy.kpis")}
              </h2>
              <p className="text-xs text-muted-foreground">
                ผลการดำเนินงานเปรียบเทียบค่าเป้าหมายและผลสัมฤทธิ์ในแต่ละยุทธศาสตร์
              </p>
            </div>

            {/* Search and Pillar filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t("strategy.search")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-full rounded-lg border bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <select
                value={selectedPillarId}
                onChange={(e) => setSelectedPillarId(e.target.value)}
                className="h-9 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="ALL">ทุกเสาหลักยุทธศาสตร์</option>
                {plan.pillars.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code}: {locale === "th" ? p.titleTh : p.titleEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pillars and KPIs list */}
          <div className="space-y-8">
            {filteredPillars.map((pillar) => (
              <div
                key={pillar.id}
                className="rounded-2xl border bg-card p-6 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                        {pillar.code}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-foreground">
                        {locale === "th" ? pillar.titleTh : pillar.titleEn}
                      </h3>
                    </div>
                    {pillar.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {pillar.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 sm:text-right shrink-0">
                    <div>
                      <div className="text-[11px] text-muted-foreground">ความสำเร็จยุทธศาสตร์</div>
                      <div className="text-sm font-bold text-primary">
                        {pillar.achievementRate}%
                      </div>
                    </div>
                    <div className="w-20 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${pillar.achievementRate}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* KPIs Cards */}
                {pillar.kpis.length === 0 ? (
                  <div className="py-4 text-center text-xs text-muted-foreground">
                    ไม่พบตัวชี้วัดที่ค้นหาในยุทธศาสตร์นี้
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                    {pillar.kpis.map((kpi) => (
                      <div
                        key={kpi.id}
                        className="rounded-xl border bg-muted/20 p-4 flex flex-col justify-between hover:border-primary/40 transition"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="font-mono text-xs font-bold text-primary">
                              {kpi.code}
                            </span>
                            {getStatusBadge(kpi.status)}
                          </div>

                          <h4 className="font-semibold text-sm text-foreground leading-snug">
                            {locale === "th" ? kpi.nameTh : kpi.nameEn}
                          </h4>
                          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                            {locale === "th" ? kpi.nameEn : kpi.nameTh}
                          </p>

                          <div className="mt-4 grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-background border text-xs">
                            <div>
                              <div className="text-[10px] text-muted-foreground">
                                {t("strategy.target")}
                              </div>
                              <div className="font-bold text-foreground">
                                {kpi.targetValue} {kpi.unit}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] text-muted-foreground">
                                {t("strategy.actual")}
                              </div>
                              <div className="font-bold text-emerald-600 dark:text-emerald-400">
                                {kpi.actualValue} {kpi.unit}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-2 border-t text-xs">
                          <div className="flex justify-between items-center mb-1 text-[11px]">
                            <span className="text-muted-foreground">
                              รอบปี {kpi.period}
                            </span>
                            <span className="font-bold text-foreground">
                              {kpi.achievementRate}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${kpi.achievementRate}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
