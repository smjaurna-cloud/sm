"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import type {
  BudgetSummaryDto,
  BudgetPlanDto,
  BudgetCategory,
} from "@/features/finance";
import {
  createBudgetPlanAction,
  deleteBudgetPlanAction,
  recordTransactionAction,
} from "@/features/finance/actions";
import {
  Plus,
  Trash2,
  Receipt,
  Search,
  CheckCircle2,
  TrendingUp,
  PieChart,
  Coins,
} from "lucide-react";

interface AdminFinanceClientProps {
  summary: BudgetSummaryDto;
  plans: BudgetPlanDto[];
  canManage: boolean;
  canCreate: boolean;
}

export function AdminFinanceClient({
  summary,
  plans,
  canManage,
  canCreate,
}: AdminFinanceClientProps) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Add Plan Dialog State
  const [isAddPlanOpen, setIsAddPlanOpen] = useState(false);
  const [newPlanCode, setNewPlanCode] = useState("");
  const [newPlanNameTh, setNewPlanNameTh] = useState("");
  const [newPlanNameEn, setNewPlanNameEn] = useState("");
  const [newPlanCategory, setNewPlanCategory] = useState<BudgetCategory>("OPERATING");
  const [newPlanAmount, setNewPlanAmount] = useState("");
  const [isSubmittingPlan, setIsSubmittingPlan] = useState(false);
  const [planError, setPlanError] = useState("");

  // Record Transaction Dialog State
  const [isRecordTxOpen, setIsRecordTxOpen] = useState(false);
  const [txPlanId, setTxPlanId] = useState(plans[0]?.id ?? "");
  const [txDescription, setTxDescription] = useState("");
  const [txAmount, setTxAmount] = useState("");
  const [txReferenceDoc, setTxReferenceDoc] = useState("");
  const [isSubmittingTx, setIsSubmittingTx] = useState(false);
  const [txError, setTxError] = useState("");

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

  const filteredPlans = plans.filter((plan) => {
    const matchesCategory =
      selectedCategory === "ALL" || plan.category === selectedCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      plan.code.toLowerCase().includes(query) ||
      plan.nameTh.toLowerCase().includes(query) ||
      plan.nameEn.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.fiscalYear?.id) {
      setPlanError("ไม่พบข้อมูลปีงบประมาณที่เปิดใช้งาน");
      return;
    }
    setIsSubmittingPlan(true);
    setPlanError("");

    const res = await createBudgetPlanAction({
      fiscalYearId: summary.fiscalYear.id,
      code: newPlanCode.trim(),
      nameTh: newPlanNameTh.trim(),
      nameEn: newPlanNameEn.trim(),
      category: newPlanCategory,
      allocatedAmount: parseFloat(newPlanAmount) || 0,
      orderSeq: plans.length + 1,
    });

    setIsSubmittingPlan(false);
    if (!res.ok) {
      setPlanError(res.error?.message ?? "เกิดข้อผิดพลาดในการสร้างแผนงาน");
    } else {
      setIsAddPlanOpen(false);
      setNewPlanCode("");
      setNewPlanNameTh("");
      setNewPlanNameEn("");
      setNewPlanAmount("");
      router.refresh();
    }
  };

  const handleRecordTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txPlanId) {
      setTxError("กรุณาเลือกแผนงานงบประมาณ");
      return;
    }
    setIsSubmittingTx(true);
    setTxError("");

    const res = await recordTransactionAction({
      planId: txPlanId,
      description: txDescription.trim(),
      amount: parseFloat(txAmount) || 0,
      type: "EXPENSE",
      referenceDoc: txReferenceDoc.trim() || undefined,
    });

    setIsSubmittingTx(false);
    if (!res.ok) {
      setTxError(res.error?.message ?? "เกิดข้อผิดพลาดในการบันทึกรายการ");
    } else {
      setIsRecordTxOpen(false);
      setTxDescription("");
      setTxAmount("");
      setTxReferenceDoc("");
      router.refresh();
    }
  };

  const handleDeletePlan = async (id: string, code: string) => {
    if (!confirm(`ต้องการลบแผนงาน ${code} ใช่หรือไม่? ยอดงบประมาณจะถูกหักออกจากปีงบประมาณ`)) {
      return;
    }
    const res = await deleteBudgetPlanAction({ id });
    if (!res.ok) {
      alert(res.error?.message ?? "ไม่สามารถลบแผนงานได้");
    } else {
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {t("finance.title")}
            </h1>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              ปี {summary.fiscalYear?.year ?? 2569}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            จัดการแผนงบประมาณ การจัดสรรวงเงิน และการบันทึกรายการเบิกจ่ายของคณะ
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canCreate && (
            <button
              onClick={() => {
                if (plans.length > 0) setTxPlanId(plans[0].id);
                setIsRecordTxOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-xs hover:bg-muted transition"
            >
              <Receipt className="h-4 w-4 text-emerald-600" />
              <span>{t("finance.addTx")}</span>
            </button>
          )}

          {canManage && (
            <button
              onClick={() => setIsAddPlanOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition"
            >
              <Plus className="h-4 w-4" />
              <span>{t("finance.addPlan")}</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">{t("finance.totalBudget")}</span>
            <Coins className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-black text-foreground">
            {formatCurrency(summary.totalBudget)}
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">{t("finance.allocatedBudget")}</span>
            <PieChart className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
            {formatCurrency(summary.allocatedBudget)}
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">{t("finance.spentBudget")}</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatCurrency(summary.spentBudget)}
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">{t("finance.executionRate")}</span>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-black text-primary">
            {summary.executionRate}%
          </div>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="rounded-2xl border bg-card shadow-xs overflow-hidden">
        <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative min-w-[260px]">
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
            <option value="PERSONNEL">{t("finance.category.personnel")}</option>
            <option value="OPERATING">{t("finance.category.operating")}</option>
            <option value="INVESTMENT">{t("finance.category.investment")}</option>
            <option value="SUBSIDY">{t("finance.category.subsidy")}</option>
            <option value="OTHER">{t("finance.category.other")}</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b bg-muted/50 text-muted-foreground">
              <tr>
                <th className="py-3 px-4 font-semibold">รหัสแผนงาน</th>
                <th className="py-3 px-4 font-semibold">ชื่อแผนงานและโครงการ</th>
                <th className="py-3 px-4 font-semibold">หมวดหมู่</th>
                <th className="py-3 px-4 font-semibold text-right">งบจัดสรร</th>
                <th className="py-3 px-4 font-semibold text-right">เบิกจ่ายแล้ว</th>
                <th className="py-3 px-4 font-semibold text-right">คงเหลือ</th>
                <th className="py-3 px-4 font-semibold text-center">ร้อยละเบิกจ่าย</th>
                {canManage && <th className="py-3 px-4 font-semibold text-right">จัดการ</th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredPlans.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    {t("finance.empty")}
                  </td>
                </tr>
              ) : (
                filteredPlans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-muted/30 transition">
                    <td className="py-3 px-4 font-mono font-bold text-foreground">
                      {plan.code}
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-semibold text-foreground">{plan.nameTh}</div>
                      <div className="text-[11px] text-muted-foreground">{plan.nameEn}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {getCategoryLabel(plan.category)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-foreground">
                      {formatCurrency(plan.allocatedAmount)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(plan.spentAmount)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-foreground">
                      {formatCurrency(plan.remainingAmount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${Math.min(100, Math.max(0, plan.executionRate))}%` }}
                          />
                        </div>
                        <span className="font-bold text-[11px]">{plan.executionRate}%</span>
                      </div>
                    </td>
                    {canManage && (
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeletePlan(plan.id, plan.code)}
                          className="p-1 text-muted-foreground hover:text-destructive rounded-md hover:bg-destructive/10 transition"
                          title={t("finance.deletePlan")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Plan Dialog Modal */}
      {isAddPlanOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border bg-card p-6 shadow-xl">
            <h2 className="text-lg font-bold text-foreground mb-4">
              {t("finance.addPlan")}
            </h2>
            {planError && (
              <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
                {planError}
              </div>
            )}
            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  รหัสแผนงาน (Code)
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น PLAN-69-006"
                  value={newPlanCode}
                  onChange={(e) => setNewPlanCode(e.target.value)}
                  className="h-9 w-full rounded-lg border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  ชื่อแผนงาน/โครงการ (ภาษาไทย)
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น โครงการส่งเสริมนวัตกรรมนักศึกษา"
                  value={newPlanNameTh}
                  onChange={(e) => setNewPlanNameTh(e.target.value)}
                  className="h-9 w-full rounded-lg border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  ชื่อแผนงาน/โครงการ (English)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Student Innovation Grant Program"
                  value={newPlanNameEn}
                  onChange={(e) => setNewPlanNameEn(e.target.value)}
                  className="h-9 w-full rounded-lg border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t("finance.category")}
                  </label>
                  <select
                    value={newPlanCategory}
                    onChange={(e) => setNewPlanCategory(e.target.value as BudgetCategory)}
                    className="h-9 w-full rounded-lg border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="OPERATING">{t("finance.category.operating")}</option>
                    <option value="PERSONNEL">{t("finance.category.personnel")}</option>
                    <option value="INVESTMENT">{t("finance.category.investment")}</option>
                    <option value="SUBSIDY">{t("finance.category.subsidy")}</option>
                    <option value="OTHER">{t("finance.category.other")}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    งบประมาณจัดสรร (บาท)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    required
                    placeholder="เช่น 1000000"
                    value={newPlanAmount}
                    onChange={(e) => setNewPlanAmount(e.target.value)}
                    className="h-9 w-full rounded-lg border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddPlanOpen(false)}
                  className="rounded-lg border px-4 py-2 text-xs font-semibold hover:bg-muted"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPlan}
                  className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSubmittingPlan ? "กำลังบันทึก..." : "บันทึกแผนงาน"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Transaction Dialog Modal */}
      {isRecordTxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border bg-card p-6 shadow-xl">
            <h2 className="text-lg font-bold text-foreground mb-4">
              {t("finance.addTx")}
            </h2>
            {txError && (
              <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
                {txError}
              </div>
            )}
            <form onSubmit={handleRecordTx} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  เลือกแผนงานงบประมาณ
                </label>
                <select
                  value={txPlanId}
                  onChange={(e) => setTxPlanId(e.target.value)}
                  className="h-9 w-full rounded-lg border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} - {p.nameTh} (คงเหลือ {formatCurrency(p.remainingAmount)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  รายละเอียดรายการเบิกจ่าย
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น จัดซื้อวัสดุอุปกรณ์ห้องปฏิบัติการ"
                  value={txDescription}
                  onChange={(e) => setTxDescription(e.target.value)}
                  className="h-9 w-full rounded-lg border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    จำนวนเงินเบิกจ่าย (บาท)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    placeholder="เช่น 50000"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className="h-9 w-full rounded-lg border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    เลขที่เอกสารอ้างอิง
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น PO-2569-0099"
                    value={txReferenceDoc}
                    onChange={(e) => setTxReferenceDoc(e.target.value)}
                    className="h-9 w-full rounded-lg border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsRecordTxOpen(false)}
                  className="rounded-lg border px-4 py-2 text-xs font-semibold hover:bg-muted"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTx}
                  className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSubmittingTx ? "กำลังบันทึก..." : "บันทึกการเบิกจ่าย"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
