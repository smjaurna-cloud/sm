import { Metadata } from "next";
import {
  getActiveStrategicPlan,
  resolveCurrentTenantId,
} from "@/features/strategy/server";
import { StrategyClient } from "./_components/strategy-client";

export const metadata: Metadata = {
  title: "แผนยุทธศาสตร์และตัวชี้วัด (Strategic Plan & KPIs) | Faculty Web Platform",
  description: "วิสัยทัศน์ พันธกิจ เสาหลักการพัฒนา และความก้าวหน้าตามตัวชี้วัดผลการดำเนินงานของคณะ",
};

export default async function StrategyPortalPage() {
  const tenantId = await resolveCurrentTenantId();
  const plan = await getActiveStrategicPlan(tenantId);

  return <StrategyClient plan={plan} />;
}
