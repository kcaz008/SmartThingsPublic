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

  const payload = {
    name: String(formData.get("name") ?? "").trim(),
    service_area: String(formData.get("serviceArea") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    website: String(formData.get("website") ?? "").trim(),
    tone_rules: String(formData.get("toneRules") ?? "").trim(),
    autopilot_mode: autopilotModes.has(autopilotMode) ? autopilotMode : "off",
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
