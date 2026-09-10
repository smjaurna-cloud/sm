-- CreateEnum
CREATE TYPE "ResearchStatus" AS ENUM ('PROPOSED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PublicationType" AS ENUM ('JOURNAL_INTERNATIONAL', 'JOURNAL_NATIONAL', 'CONFERENCE_INTERNATIONAL', 'CONFERENCE_NATIONAL', 'PATENT');

-- CreateEnum
CREATE TYPE "DocumentPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ApprovalAction" AS ENUM ('SUBMIT', 'REVIEW', 'APPROVE', 'REJECT', 'REQUEST_CHANGE', 'COMMENT');

-- CreateTable
CREATE TABLE "research_projects" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "title_th" VARCHAR(500) NOT NULL,
    "title_en" VARCHAR(500) NOT NULL,
    "abstract_th" TEXT,
    "abstract_en" TEXT,
    "leader_id" UUID,
    "leader_name" VARCHAR(255) NOT NULL,
    "members" JSONB NOT NULL DEFAULT '[]',
    "department_id" UUID,
    "budget" DECIMAL(12,2),
    "funding_source" VARCHAR(255),
    "start_date" TIMESTAMPTZ NOT NULL,
    "end_date" TIMESTAMPTZ,
    "status" "ResearchStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "cover_image_url" VARCHAR(500),
    "output_file_url" VARCHAR(500),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "research_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publications" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "project_id" UUID,
    "title" VARCHAR(500) NOT NULL,
    "authors" VARCHAR(500) NOT NULL,
    "journal_or_conference" VARCHAR(500) NOT NULL,
    "publication_type" "PublicationType" NOT NULL DEFAULT 'JOURNAL_INTERNATIONAL',
    "tier" VARCHAR(50),
    "doi" VARCHAR(255),
    "year" INTEGER NOT NULL DEFAULT 2026,
    "url" VARCHAR(500),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "publications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_templates" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name_th" VARCHAR(255) NOT NULL,
    "name_en" VARCHAR(255) NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "form_fields" JSONB NOT NULL DEFAULT '[]',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "order_seq" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "document_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_requests" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "request_number" VARCHAR(50) NOT NULL,
    "template_id" UUID,
    "title" VARCHAR(500) NOT NULL,
    "requester_id" UUID NOT NULL,
    "department_id" UUID,
    "priority" "DocumentPriority" NOT NULL DEFAULT 'NORMAL',
    "form_data" JSONB NOT NULL DEFAULT '{}',
    "attachment_urls" JSONB NOT NULL DEFAULT '[]',
    "status" "ApprovalStatus" NOT NULL DEFAULT 'SUBMITTED',
    "current_approver_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "approval_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_histories" (
    "id" UUID NOT NULL,
    "request_id" UUID NOT NULL,
    "actor_id" UUID NOT NULL,
    "action" "ApprovalAction" NOT NULL DEFAULT 'SUBMIT',
    "comments" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "approval_histories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "research_projects_tenant_id_status_idx" ON "research_projects"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "research_projects_tenant_id_department_id_idx" ON "research_projects"("tenant_id", "department_id");

-- CreateIndex
CREATE UNIQUE INDEX "research_projects_tenant_id_code_key" ON "research_projects"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "publications_tenant_id_publication_type_idx" ON "publications"("tenant_id", "publication_type");

-- CreateIndex
CREATE INDEX "publications_tenant_id_year_idx" ON "publications"("tenant_id", "year");

-- CreateIndex
CREATE INDEX "document_templates_tenant_id_is_active_idx" ON "document_templates"("tenant_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "document_templates_tenant_id_code_key" ON "document_templates"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "approval_requests_tenant_id_status_idx" ON "approval_requests"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "approval_requests_requester_id_idx" ON "approval_requests"("requester_id");

-- CreateIndex
CREATE UNIQUE INDEX "approval_requests_tenant_id_request_number_key" ON "approval_requests"("tenant_id", "request_number");

-- CreateIndex
CREATE INDEX "approval_histories_request_id_created_at_idx" ON "approval_histories"("request_id", "created_at");

-- AddForeignKey
ALTER TABLE "research_projects" ADD CONSTRAINT "research_projects_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_projects" ADD CONSTRAINT "research_projects_leader_id_fkey" FOREIGN KEY ("leader_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_projects" ADD CONSTRAINT "research_projects_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publications" ADD CONSTRAINT "publications_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publications" ADD CONSTRAINT "publications_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "research_projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_templates" ADD CONSTRAINT "document_templates_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_requests" ADD CONSTRAINT "approval_requests_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_requests" ADD CONSTRAINT "approval_requests_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "document_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_requests" ADD CONSTRAINT "approval_requests_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_requests" ADD CONSTRAINT "approval_requests_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_requests" ADD CONSTRAINT "approval_requests_current_approver_id_fkey" FOREIGN KEY ("current_approver_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_histories" ADD CONSTRAINT "approval_histories_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "approval_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_histories" ADD CONSTRAINT "approval_histories_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
