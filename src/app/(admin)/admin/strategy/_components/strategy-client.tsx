"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import type {
  StrategicPlanDto,
  StrategicKpiDto,
  KpiStatus,
} from "@/features/strategy";
import {
  createStrategicKpiAction,
  updateKpiActualAction,
  deleteStrategicKpiAction,
} from "@/features/strategy/actions";
import {
  Target,
  Plus,
  Trash2,
  Edit3,
  Search,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertCircle,
  Award,
} from "lucide-react";

interface AdminStrategyClientProps {
  plan: StrategicPlanDto | null;
  kpis: StrategicKpiDto[];
  canManage: boolean;
}

export function AdminStrategyClient({
  plan,
  kpis,
  canManage,
}: AdminStrategyClientProps) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPillarId, setSelectedPillarId] = useState<string>("ALL");

  // Add KPI Dialog State
  const [isAddKpiOpen, setIsAddKpiOpen] = useState(false);
  const [newPillarId, setNewPillarId] = useState(plan?.pillars[0]?.id ?? "");
  const [newKpiCode, setNewKpiCode] = useState("");
  const [newKpiNameTh, setNewKpiNameTh] = useState("");
  const [newKpiNameEn, setNewKpiNameEn] = useState("");
  const [newKpiTarget, setNewKpiTarget] = useState("");
  const [newKpiActual, setNewKpiActual] = useState("0");
  const [newKpiUnit, setNewKpiUnit] = useState("%");
  const [newKpiPeriod, setNewKpiPeriod] = useState("2569");
  const [isSubmittingKpi, setIsSubmittingKpi] = useState(false);
  const [kpiError, setKpiError] = useState("");

  // Update Actual Dialog State
  const [isUpdateActualOpen, setIsUpdateActualOpen] = useState(false);
  const [editingKpi, setEditingKpi] = useState<StrategicKpiDto | null>(null);
  const [updateActualValue, setUpdateActualValue] = useState("");
  const [isSubmittingActual, setIsSubmittingActual] = useState(false);
  const [updateError, setUpdateError] = useState("");

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

  const filteredKpis = kpis.filter((kpi) => {
    const matchesPillar =
      selectedPillarId === "ALL" || kpi.pillarId === selectedPillarId;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      kpi.code.toLowerCase().includes(query) ||
      kpi.nameTh.toLowerCase().includes(query) ||
      kpi.nameEn.toLowerCase().includes(query) ||
      kpi.pillarCode.toLowerCase().includes(query);
    return matchesPillar && matchesSearch;
  });

  const handleCreateKpi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPillarId) {
      setKpiError("กรุณาเลือกเสาหลักยุทธศาสตร์");
      return;
    }
    setIsSubmittingKpi(true);
    setKpiError("");

    const targetVal = parseFloat(newKpiTarget) || 0;
    const actualVal = parseFloat(newKpiActual) || 0;

    const res = await createStrategicKpiAction({
      pillarId: newPillarId,
      code: newKpiCode.trim(),
      nameTh: newKpiNameTh.trim(),
      nameEn: newKpiNameEn.trim(),
      targetValue: targetVal,
      actualValue: actualVal,
      unit: newKpiUnit.trim(),
      status: actualVal >= targetVal ? "ACHIEVED" : "ON_TRACK",
      period: newKpiPeriod.trim(),
    });

    setIsSubmittingKpi(false);
    if (!res.ok) {
      setKpiError(res.error?.message ?? "เกิดข้อผิดพลาดในการบันทึกตัวชี้วัด");
    } else {
      setIsAddKpiOpen(false);
      setNewKpiCode("");
      setNewKpiNameTh("");
      setNewKpiNameEn("");
      setNewKpiTarget("");
      setNewKpiActual("0");
      router.refresh();
    }
  };

  const handleUpdateActual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKpi) return;

    setIsSubmittingActual(true);
    setUpdateError("");

    const actualVal = parseFloat(updateActualValue) || 0;

    const res = await updateKpiActualAction({
      id: editingKpi.id,
      actualValue: actualVal,
    });

    setIsSubmittingActual(false);
    if (!res.ok) {
      setUpdateError(res.error?.message ?? "เกิดข้อผิดพลาดในการอัปเดตผลงาน");
    } else {
      setIsUpdateActualOpen(false);
      setEditingKpi(null);
      setUpdateActualValue("");
      router.refresh();
    }
  };

  const handleDeleteKpi = async (id: string, code: string) => {
    if (!confirm(`ต้องการลบตัวชี้วัด ${code} ใช่หรือไม่?`)) return;

    const res = await deleteStrategicKpiAction({ id });
    if (!res.ok) {
      alert(res.error?.message ?? "ไม่สามารถลบตัวชี้วัดได้");
    } else {
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {t("strategy.title")}
            </h1>
            {plan && (
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {plan.startYear} - {plan.endYear}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            จัดการเสาหลักยุทธศาสตร์ ตัวชี้วัดผลการดำเนินงาน (KPIs) และอัปเดตผลสัมฤทธิ์
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => {
              if (plan?.pillars[0]?.id) setNewPillarId(plan.pillars[0].id);
              setIsAddKpiOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition"
          >
            <Plus className="h-4 w-4" />
            <span>{t("strategy.addKpi")}</span>
          </button>
        )}
      </div>

      {/* KPI Overview Cards */}
      {plan && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="rounded-2xl border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-medium">{t("strategy.overallProgress")}</span>
              <Award className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-black text-primary">
              {plan.overallAchievementRate}%
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-medium">ตัวชี้วัดทั้งหมด</span>
              <Target className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-black text-foreground">
              {plan.totalKpis} <span className="text-xs font-normal">รายการ</span>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-medium">{t("strategy.status.achieved")}</span>
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {plan.kpiStatusCounts.achieved}
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-medium">{t("strategy.status.on_track")}</span>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {plan.kpiStatusCounts.onTrack}
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-medium">ความเสี่ยง / หลุดเป้า</span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {plan.kpiStatusCounts.atRisk + plan.kpiStatusCounts.offTrack}
            </div>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="rounded-2xl border bg-card shadow-xs overflow-hidden">
        <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative min-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("strategy.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-lg border bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {plan && (
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
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b bg-muted/50 text-muted-foreground">
              <tr>
                <th className="py-3 px-4 font-semibold">รหัส KPI</th>
                <th className="py-3 px-4 font-semibold">เสาหลัก</th>
                <th className="py-3 px-4 font-semibold">ชื่อตัวชี้วัด</th>
                <th className="py-3 px-4 font-semibold text-right">เป้าหมาย</th>
                <th className="py-3 px-4 font-semibold text-right">ผลงานจริง</th>
                <th className="py-3 px-4 font-semibold text-center">สถานะ</th>
                <th className="py-3 px-4 font-semibold text-center">ความสำเร็จ</th>
                {canManage && <th className="py-3 px-4 font-semibold text-right">จัดการ</th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredKpis.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    {t("strategy.empty")}
                  </td>
                </tr>
              ) : (
                filteredKpis.map((kpi) => (
                  <tr key={kpi.id} className="hover:bg-muted/30 transition">
                    <td className="py-3 px-4 font-mono font-bold text-primary">
                      {kpi.code}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-muted-foreground">
                      {kpi.pillarCode}
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-semibold text-foreground">{kpi.nameTh}</div>
                      <div className="text-[11px] text-muted-foreground">{kpi.nameEn}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-foreground whitespace-nowrap">
                      {kpi.targetValue} {kpi.unit}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {kpi.actualValue} {kpi.unit}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {getStatusBadge(kpi.status)}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${Math.min(100, Math.max(0, kpi.achievementRate))}%` }}
                          />
                        </div>
                        <span className="font-bold text-[11px]">{kpi.achievementRate}%</span>
                      </div>
                    </td>
                    {canManage && (
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingKpi(kpi);
                              setUpdateActualValue(kpi.actualValue.toString());
                              setIsUpdateActualOpen(true);
                            }}
                            className="p-1 text-muted-foreground hover:text-primary rounded-md hover:bg-primary/10 transition"
                            title={t("strategy.updateKpi")}
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteKpi(kpi.id, kpi.code)}
                            className="p-1 text-muted-foreground hover:text-destructive rounded-md hover:bg-destructive/10 transition"
                            title={t("strategy.deleteKpi")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add KPI Modal */}
      {isAddKpiOpen && plan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border bg-card p-6 shadow-xl">
            <h2 className="text-lg font-bold text-foreground mb-4">
              {t("strategy.addKpi")}
            </h2>
            {kpiError && (
              <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
                {kpiError}
              </div>
            )}
            <form onSubmit={handleCreateKpi} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  เสาหลักยุทธศาสตร์ (Pillar)
                </label>
                <select
                  value={newPillarId}
                  onChange={(e) => setNewPillarId(e.target.value)}
                  className="h-9 w-full rounded-lg border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20"
                >
                  {plan.pillars.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code}: {locale === "th" ? p.titleTh : p.titleEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  รหัสตัวชี้วัด (KPI Code)
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น KPI-1.3"
                  value={newKpiCode}
                  onChange={(e) => setNewKpiCode(e.target.value)}
                  className="h-9 w-full rounded-lg border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  ชื่อตัวชี้วัด (ภาษาไทย)
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น จำนวนทุนวิจัยที่ได้รับจัดสรร"
                  value={newKpiNameTh}
                  onChange={(e) => setNewKpiNameTh(e.target.value)}
                  className="h-9 w-full rounded-lg border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  ชื่อตัวชี้วัด (English)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Number of funded research grants"
                  value={newKpiNameEn}
                  onChange={(e) => setNewKpiNameEn(e.target.value)}
                  className="h-9 w-full rounded-lg border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t("strategy.target")}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="100"
                    value={newKpiTarget}
                    onChange={(e) => setNewKpiTarget(e.target.value)}
                    className="h-9 w-full rounded-lg border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t("strategy.actual")}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="0"
                    value={newKpiActual}
                    onChange={(e) => setNewKpiActual(e.target.value)}
                    className="h-9 w-full rounded-lg border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t("strategy.unit")}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น %, คน"
                    value={newKpiUnit}
                    onChange={(e) => setNewKpiUnit(e.target.value)}
                    className="h-9 w-full rounded-lg border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    รอบปี (Period)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="2569"
                    value={newKpiPeriod}
                    onChange={(e) => setNewKpiPeriod(e.target.value)}
                    className="h-9 w-full rounded-lg border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddKpiOpen(false)}
                  className="rounded-lg border px-4 py-2 text-xs font-semibold hover:bg-muted"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingKpi}
                  className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSubmittingKpi ? "กำลังบันทึก..." : "บันทึกตัวชี้วัด"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Actual Value Modal */}
      {isUpdateActualOpen && editingKpi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl">
            <h2 className="text-lg font-bold text-foreground mb-2">
              {t("strategy.updateKpi")}
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              {editingKpi.code}: {editingKpi.nameTh}
            </p>
            {updateError && (
              <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
                {updateError}
              </div>
            )}
            <form onSubmit={handleUpdateActual} className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>ค่าเป้าหมาย:</span>
                  <span className="font-bold text-foreground">
                    {editingKpi.targetValue} {editingKpi.unit}
                  </span>
                </div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  {t("strategy.actual")} ({editingKpi.unit})
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={updateActualValue}
                  onChange={(e) => setUpdateActualValue(e.target.value)}
                  className="h-10 w-full rounded-lg border bg-background px-3 text-base font-bold focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsUpdateActualOpen(false)}
                  className="rounded-lg border px-4 py-2 text-xs font-semibold hover:bg-muted"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingActual}
                  className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSubmittingActual ? "กำลังอัปเดต..." : "อัปเดตผลงาน"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
