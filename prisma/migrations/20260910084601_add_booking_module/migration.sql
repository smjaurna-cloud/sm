-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('ROOM', 'VEHICLE', 'EQUIPMENT');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED');

-- CreateTable
CREATE TABLE "booking_resources" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name_th" VARCHAR(255) NOT NULL,
    "name_en" VARCHAR(255) NOT NULL,
    "type" "ResourceType" NOT NULL DEFAULT 'ROOM',
    "capacity" INTEGER NOT NULL DEFAULT 0,
    "location" VARCHAR(255),
    "facilities" JSONB NOT NULL DEFAULT '[]',
    "image_url" VARCHAR(500),
    "requires_approval" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "order_seq" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "booking_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_bookings" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "resource_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "booking_number" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "start_at" TIMESTAMPTZ NOT NULL,
    "end_at" TIMESTAMPTZ NOT NULL,
    "attendees_count" INTEGER NOT NULL DEFAULT 1,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "contact_phone" VARCHAR(50),
    "notes" TEXT,
    "rejection_reason" TEXT,
    "approved_by_id" UUID,
    "approved_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "resource_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "booking_resources_tenant_id_type_idx" ON "booking_resources"("tenant_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "booking_resources_tenant_id_code_key" ON "booking_resources"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "resource_bookings_tenant_id_resource_id_start_at_end_at_idx" ON "resource_bookings"("tenant_id", "resource_id", "start_at", "end_at");

-- CreateIndex
CREATE INDEX "resource_bookings_tenant_id_status_idx" ON "resource_bookings"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "resource_bookings_user_id_idx" ON "resource_bookings"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "resource_bookings_tenant_id_booking_number_key" ON "resource_bookings"("tenant_id", "booking_number");

-- AddForeignKey
ALTER TABLE "booking_resources" ADD CONSTRAINT "booking_resources_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_bookings" ADD CONSTRAINT "resource_bookings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_bookings" ADD CONSTRAINT "resource_bookings_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "booking_resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_bookings" ADD CONSTRAINT "resource_bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_bookings" ADD CONSTRAINT "resource_bookings_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
