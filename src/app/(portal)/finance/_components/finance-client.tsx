"use client";

import { useState } from "react";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { formatDate } from "@/shared/lib/format";
import type { BudgetSummaryDto, BudgetPlanDto, BudgetCategory } from "@/features/finance";
import {
  Landmark,
  Coins,
  TrendingUp,
  PieChart,
  Search,
  CheckCircle2,
  FileSpreadsheet,
  ShieldCheck,
} from "lucide-react";

interface FinanceClientProps {
  summary: BudgetSummaryDto;
  plans: BudgetPlanDto[];
}

export function FinanceClient({ summary, plans }: FinanceClientProps) {
  const t = useT();
  const locale = useLocale();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const categories: { key: BudgetCategory; label: string }[] = [
    { key: "PERSONNEL", label: t("finance.category.personnel") },
    { key: "OPERATING", label: t("finance.category.operating") },
    { key: "INVESTMENT", label: t("finance.category.investment") },
    { key: "SUBSIDY", label: t("finance.category.subsidy") },
    { key: "OTHER", label: t("finance.category.other") },
  ];

  const filteredPlans = plans.filter((plan) => {
    const matchesCategory =
      selectedCategory === "ALL" || plan.category === selectedCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      plan.code.toLowerCase().includes(query) ||
      plan.nameTh.toLowerCase().includes(query) ||
      plan.nameEn.toLowerCase().includes(query) ||
      (plan.departmentNameTh && plan.departmentNameTh.toLowerCase().includes(query)) ||
      (plan.departmentNameEn && plan.departmentNameEn.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(locale === "th" ? "th-TH" : "en-US", {
      style: "currency",
      currency: "THB",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getCategoryLabel = (cat: BudgetCategory) => {
    switch (cat) {
      case "PERSONNEL":
        return t("finance.category.personnel");
      case "OPERATING":
        return t("finance.category.operating");
      case "INVESTMENT":
        return t("finance.category.investment");
      case "SUBSIDY":
        return t("finance.category.subsidy");
      case "OTHER":
        return t("finance.category.other");
      default:
        return cat;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Banner */}
      <section className="border-b bg-muted/20 py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-semibold text-primary">
                <Landmark className="h-3.5 w-3.5" />
                <span>
                  {t("finance.fiscalYear")} {summary.fiscalYear?.year ?? 2569}
                </span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
                {t("finance.title")}
              </h1>
              <p className="max-w-2xl text-muted-foreground text-sm sm:text-base">
                {t("finance.subtitle")}
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-xs">
              <ShieldCheck className="h-10 w-10 text-emerald-600 shrink-0" />
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  ความโปร่งใสด้านงบประมาณ
                </div>
                <div className="text-sm font-bold text-foreground">
                  Open Fiscal Transparency Data
                </div>
                <div className="text-xs text-muted-foreground">
                  ข้อมูลอัปเดตตามไตรมาสล่าสุด
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Overview */}
      <section className="py-8">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border bg-card p-5 shadow-xs">
              <div className="flex items-center justify-between text-muted-foreground mb-3">
                <span className="text-xs font-medium">{t("finance.totalBudget")}</span>
                <Coins className="h-4 w-4 text-primary" />
              </div>
              <div className="text-2xl font-black tracking-tight text-foreground">
                {formatCurrency(summary.totalBudget)}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                กรอบวงเงินงบประมาณประจำปี
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-5 shadow-xs">
              <div className="flex items-center justify-between text-muted-foreground mb-3">
                <span className="text-xs font-medium">{t("finance.allocatedBudget")}</span>
                <PieChart className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-2xl font-black tracking-tight text-blue-600 dark:text-blue-400">
                {formatCurrency(summary.allocatedBudget)}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {summary.totalBudget > 0
                  ? `${((summary.allocatedBudget / summary.totalBudget) * 100).toFixed(1)}% ของงบรวม`
                  : "0%"}
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-5 shadow-xs">
              <div className="flex items-center justify-between text-muted-foreground mb-3">
                <span className="text-xs font-medium">{t("finance.spentBudget")}</span>
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
                {formatCurrency(summary.spentBudget)}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {t("finance.executionRate")}: {summary.executionRate}%
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-5 shadow-xs">
              <div className="flex items-center justify-between text-muted-foreground mb-3">
                <span className="text-xs font-medium">{t("finance.remainingBudget")}</span>
                <CheckCircle2 className="h-4 w-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black tracking-tight text-foreground">
                {formatCurrency(summary.remainingBudget)}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                คงเหลือพร้อมเบิกจ่าย
              </div>
            </div>
          </div>

          {/* Overall Execution Progress Bar */}
          <div className="mt-6 rounded-2xl border bg-card p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="font-bold text-foreground text-base">
                  อัตราการเบิกจ่ายงบประมาณภาพรวม (Overall Execution)
                </h3>
                <p className="text-xs text-muted-foreground">
                  เทียบยอดเบิกจ่ายจริงกับงบประมาณรวมทั้งสิ้น
                </p>
              </div>
              <div className="text-xl font-extrabold text-primary">
                {summary.executionRate}%
              </div>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  summary.executionRate >= 70
                    ? "bg-emerald-500"
                    : summary.executionRate >= 40
                    ? "bg-blue-500"
                    : "bg-amber-500"
                }`}
                style={{ width: `${Math.min(100, Math.max(0, summary.executionRate))}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Breakdown */}
      <section className="py-6">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {t("finance.category")} (Allocation by Category)
            </h2>
            <p className="text-xs text-muted-foreground">
              การกระจายงบประมาณตามหมวดหมู่รายจ่ายหลัก 5 หมวด
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {summary.categoryStats.map((stat) => (
              <div
                key={stat.category}
                className="rounded-2xl border bg-card p-4 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {getCategoryLabel(stat.category)}
                  </span>
                  <div className="mt-3">
                    <div className="text-xs text-muted-foreground">{t("finance.allocatedBudget")}</div>
                    <div className="font-bold text-sm text-foreground">
                      {formatCurrency(stat.allocated)}
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-xs text-muted-foreground">{t("finance.spentBudget")}</div>
                    <div className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(stat.spent)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">เบิกจ่ายแล้ว</span>
                    <span className="font-bold">{stat.executionRate}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${Math.min(100, Math.max(0, stat.executionRate))}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans List & Directory */}
      <section className="py-8">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                {t("finance.plans")}
              </h2>
              <p className="text-xs text-muted-foreground">
                รายการแผนงานและโครงการงบประมาณประจำปีทั้งหมด ({filteredPlans.length} รายการ)
              </p>
            </div>

            {/* Search and Category Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t("finance.search")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-full rounded-lg border bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-9 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="ALL">ทุกหมวดหมู่งบประมาณ</option>
                {categories.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredPlans.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
              <FileSpreadsheet className="mx-auto h-10 w-10 stroke-1 mb-2" />
              <p>{t("finance.empty")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="rounded-2xl border bg-card p-5 shadow-xs flex flex-col justify-between hover:border-primary/40 transition"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-xs font-bold text-muted-foreground">
                        {plan.code}
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {getCategoryLabel(plan.category)}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-foreground leading-snug">
                      {locale === "th" ? plan.nameTh : plan.nameEn}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {locale === "th" ? plan.nameEn : plan.nameTh}
                    </p>

                    {plan.departmentNameTh && (
                      <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>
                          {locale === "th" ? plan.departmentNameTh : plan.departmentNameEn}
                        </span>
                      </div>
                    )}

                    <div className="mt-4 grid grid-cols-2 gap-3 p-3 rounded-xl bg-muted/40 text-xs">
                      <div>
                        <div className="text-muted-foreground">{t("finance.allocatedBudget")}</div>
                        <div className="font-bold text-foreground">
                          {formatCurrency(plan.allocatedAmount)}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">{t("finance.spentBudget")}</div>
                        <div className="font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(plan.spentAmount)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="text-muted-foreground">เบิกจ่ายแล้ว</span>
                      <span className="font-bold text-foreground">{plan.executionRate}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.max(0, plan.executionRate))}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recent Transparency Disbursements */}
      {summary.recentTransactions.length > 0 && (
        <section className="py-10 border-t bg-muted/10">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  {t("finance.transactions")} (Disbursement Tracking)
                </h2>
                <p className="text-xs text-muted-foreground">
                  รายการเบิกจ่ายงบประมาณล่าสุดเพื่อความโปร่งใสและตรวจสอบได้
                </p>
              </div>
            </div>

            <div className="rounded-2xl border bg-card overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="py-3 px-4 font-semibold">วันที่</th>
                      <th className="py-3 px-4 font-semibold">แผนงาน / โครงการ</th>
                      <th className="py-3 px-4 font-semibold">รายการเบิกจ่าย</th>
                      <th className="py-3 px-4 font-semibold">เอกสารอ้างอิง</th>
                      <th className="py-3 px-4 font-semibold text-right">จำนวนเงิน</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {summary.recentTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-muted/30 transition">
                        <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                          {formatDate(new Date(tx.txDate), locale)}
                        </td>
                        <td className="py-3 px-4 font-medium text-foreground whitespace-nowrap">
                          {locale === "th" ? tx.planNameTh : tx.planNameEn}
                        </td>
                        <td className="py-3 px-4 text-foreground max-w-xs truncate">
                          {tx.description}
                        </td>
                        <td className="py-3 px-4 font-mono text-muted-foreground">
                          {tx.referenceDoc ?? "-"}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          {formatCurrency(tx.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
