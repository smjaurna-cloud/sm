-- CreateEnum
CREATE TYPE "BudgetCategory" AS ENUM ('PERSONNEL', 'OPERATING', 'INVESTMENT', 'SUBSIDY', 'OTHER');

-- CreateEnum
CREATE TYPE "BudgetTxType" AS ENUM ('ALLOCATION', 'EXPENSE', 'TRANSFER');

-- CreateEnum
CREATE TYPE "KpiStatus" AS ENUM ('ON_TRACK', 'AT_RISK', 'OFF_TRACK', 'ACHIEVED');

-- CreateTable
CREATE TABLE "fiscal_years" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "total_budget" DECIMAL(14,2) NOT NULL,
    "allocated_budget" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "spent_budget" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "start_date" TIMESTAMPTZ NOT NULL,
    "end_date" TIMESTAMPTZ NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "fiscal_years_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_plans" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "fiscal_year_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name_th" VARCHAR(255) NOT NULL,
    "name_en" VARCHAR(255) NOT NULL,
    "category" "BudgetCategory" NOT NULL DEFAULT 'OPERATING',
    "department_id" UUID,
    "allocated_amount" DECIMAL(12,2) NOT NULL,
    "spent_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "order_seq" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "budget_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_transactions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "type" "BudgetTxType" NOT NULL DEFAULT 'EXPENSE',
    "tx_date" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reference_doc" VARCHAR(100),
    "recorded_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "budget_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strategic_plans" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name_th" VARCHAR(255) NOT NULL,
    "name_en" VARCHAR(255) NOT NULL,
    "start_year" INTEGER NOT NULL,
    "end_year" INTEGER NOT NULL,
    "vision_th" TEXT NOT NULL,
    "vision_en" TEXT NOT NULL,
    "mission_th" TEXT NOT NULL,
    "mission_en" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "strategic_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strategic_pillars" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "order_seq" INTEGER NOT NULL DEFAULT 0,
    "code" VARCHAR(20) NOT NULL,
    "title_th" VARCHAR(255) NOT NULL,
    "title_en" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "strategic_pillars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strategic_kpis" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "pillar_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name_th" VARCHAR(255) NOT NULL,
    "name_en" VARCHAR(255) NOT NULL,
    "target_value" DOUBLE PRECISION NOT NULL,
    "actual_value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit" VARCHAR(50) NOT NULL,
    "status" "KpiStatus" NOT NULL DEFAULT 'ON_TRACK',
    "period" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "strategic_kpis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fiscal_years_tenant_id_is_active_idx" ON "fiscal_years"("tenant_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "fiscal_years_tenant_id_year_key" ON "fiscal_years"("tenant_id", "year");

-- CreateIndex
CREATE INDEX "budget_plans_tenant_id_fiscal_year_id_idx" ON "budget_plans"("tenant_id", "fiscal_year_id");

-- CreateIndex
CREATE INDEX "budget_plans_tenant_id_category_idx" ON "budget_plans"("tenant_id", "category");

-- CreateIndex
CREATE UNIQUE INDEX "budget_plans_tenant_id_code_key" ON "budget_plans"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "budget_transactions_tenant_id_plan_id_tx_date_idx" ON "budget_transactions"("tenant_id", "plan_id", "tx_date");

-- CreateIndex
CREATE INDEX "strategic_plans_tenant_id_is_active_idx" ON "strategic_plans"("tenant_id", "is_active");

-- CreateIndex
CREATE INDEX "strategic_pillars_tenant_id_order_seq_idx" ON "strategic_pillars"("tenant_id", "order_seq");

-- CreateIndex
CREATE UNIQUE INDEX "strategic_pillars_tenant_id_plan_id_code_key" ON "strategic_pillars"("tenant_id", "plan_id", "code");

-- CreateIndex
CREATE INDEX "strategic_kpis_tenant_id_status_idx" ON "strategic_kpis"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "strategic_kpis_tenant_id_code_key" ON "strategic_kpis"("tenant_id", "code");

-- AddForeignKey
ALTER TABLE "fiscal_years" ADD CONSTRAINT "fiscal_years_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_plans" ADD CONSTRAINT "budget_plans_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_plans" ADD CONSTRAINT "budget_plans_fiscal_year_id_fkey" FOREIGN KEY ("fiscal_year_id") REFERENCES "fiscal_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_plans" ADD CONSTRAINT "budget_plans_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_transactions" ADD CONSTRAINT "budget_transactions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_transactions" ADD CONSTRAINT "budget_transactions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "budget_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_transactions" ADD CONSTRAINT "budget_transactions_recorded_by_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strategic_plans" ADD CONSTRAINT "strategic_plans_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strategic_pillars" ADD CONSTRAINT "strategic_pillars_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strategic_pillars" ADD CONSTRAINT "strategic_pillars_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "strategic_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strategic_kpis" ADD CONSTRAINT "strategic_kpis_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strategic_kpis" ADD CONSTRAINT "strategic_kpis_pillar_id_fkey" FOREIGN KEY ("pillar_id") REFERENCES "strategic_pillars"("id") ON DELETE CASCADE ON UPDATE CASCADE;
