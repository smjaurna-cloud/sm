-- CreateEnum
CREATE TYPE "DegreeLevel" AS ENUM ('BACHELOR', 'MASTER', 'DOCTORAL', 'CERTIFICATE');

-- CreateTable
CREATE TABLE "curriculums" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "department_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name_th" VARCHAR(255) NOT NULL,
    "name_en" VARCHAR(255) NOT NULL,
    "degree_th" VARCHAR(255) NOT NULL,
    "degree_en" VARCHAR(255) NOT NULL,
    "level" "DegreeLevel" NOT NULL DEFAULT 'BACHELOR',
    "duration_years" INTEGER NOT NULL DEFAULT 4,
    "total_credits" INTEGER NOT NULL,
    "tuition_fee_per_term" VARCHAR(100),
    "language" VARCHAR(100),
    "description_th" TEXT,
    "description_en" TEXT,
    "career_opportunities" JSONB NOT NULL DEFAULT '[]',
    "study_plan_structure" JSONB NOT NULL DEFAULT '[]',
    "cover_image_url" VARCHAR(500),
    "brochure_url" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "order_seq" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "curriculums_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "curriculums_tenant_id_level_idx" ON "curriculums"("tenant_id", "level");

-- CreateIndex
CREATE INDEX "curriculums_tenant_id_department_id_idx" ON "curriculums"("tenant_id", "department_id");

-- CreateIndex
CREATE UNIQUE INDEX "curriculums_tenant_id_code_key" ON "curriculums"("tenant_id", "code");

-- AddForeignKey
ALTER TABLE "curriculums" ADD CONSTRAINT "curriculums_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculums" ADD CONSTRAINT "curriculums_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
