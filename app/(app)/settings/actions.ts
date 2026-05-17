"use server";

import { revalidatePath } from "next/cache";
import { canManageBusiness, requireAuthContext } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import { createSupabaseServerClient } from "@/lib/supabase";
import type { AutopilotMode } from "@/lib/types";

const autopilotModes = new Set<AutopilotMode>([
  "off",
  "draft_only",
  "approval_required",
  "post_when_connected",
]);
const ctaPhoneRules = new Set([
  "always_include_phone",
  "usually_include_phone",
  "dm_only",
  "never_first_public",
  "tracking_number",
  "employee_phone",
  "no_cta_if_promo_sensitive",
]);

export async function updateBusinessSettingsAction(formData: FormData) {
  const authContext = await requireAuthContext();
  const supabase = await createSupabaseServerClient();

  if (!supabase || !authContext.businessId || !canManageBusiness(authContext.role)) {
    return;
  }

  const autopilotMode = String(
    formData.get("autopilotMode") ?? "off",
  ) as AutopilotMode;
  const ctaPhoneRule = String(
    formData.get("ctaPhoneRule") ?? "usually_include_phone",
  );

  const payload = {
    name: String(formData.get("name") ?? "").trim(),
    service_area: String(formData.get("serviceArea") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    website: String(formData.get("website") ?? "").trim(),
    tone_rules: String(formData.get("toneRules") ?? "").trim(),
    autopilot_mode: autopilotModes.has(autopilotMode) ? autopilotMode : "off",
    services_offered: String(formData.get("servicesOffered") ?? "").trim(),
    emergency_availability: String(
      formData.get("emergencyAvailability") ?? "",
    ).trim(),
    brands_serviced: String(formData.get("brandsServiced") ?? "").trim(),
    financing_options: String(formData.get("financingOptions") ?? "").trim(),
    warranty_notes: String(formData.get("warrantyNotes") ?? "").trim(),
    preferred_tone: String(formData.get("preferredTone") ?? "").trim(),
    phrases_to_avoid: String(formData.get("phrasesToAvoid") ?? "").trim(),
    cta_phone_rule: ctaPhoneRules.has(ctaPhoneRule)
      ? ctaPhoneRule
      : "usually_include_phone",
    tracking_phone: String(formData.get("trackingPhone") ?? "").trim(),
    brand_color: String(formData.get("brandColor") ?? "#2563eb").trim(),
  };

  if (!payload.name || !payload.service_area || !payload.tone_rules) {
    return;
  }

  await supabase
    .from("businesses")
    .update(payload)
    .eq("id", authContext.businessId);

  await logAuditEvent({
    businessId: authContext.businessId,
    userId: authContext.user.id,
    action: "business.updated",
    targetTable: "businesses",
    targetId: authContext.businessId,
    metadata: { autopilotMode: payload.autopilot_mode },
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
}
