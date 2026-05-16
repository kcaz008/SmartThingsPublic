"use server";

import { revalidatePath } from "next/cache";
import { requireAuthContext } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import { createSupabaseServerClient } from "@/lib/supabase";
import type { SourceType } from "@/lib/types";

const supportedProviders = new Set<SourceType>([
  "facebook_group",
  "nextdoor",
  "reddit",
  "manual",
  "other",
]);

export async function addConnectedAccountAction(formData: FormData) {
  const authContext = await requireAuthContext();
  const supabase = await createSupabaseServerClient();

  if (!supabase || !authContext.businessId) {
    return;
  }

  const provider = String(formData.get("provider") ?? "facebook_group") as SourceType;
  const displayName = String(formData.get("displayName") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!displayName) {
    return;
  }

  const safeProvider = supportedProviders.has(provider) ? provider : "other";
  const { data } = await supabase
    .from("connected_accounts")
    .insert({
      business_id: authContext.businessId,
      provider: safeProvider,
      display_name: displayName,
      status: "pending_oauth",
      notes: notes || null,
    })
    .select("id")
    .single();

  await logAuditEvent({
    businessId: authContext.businessId,
    userId: authContext.user.id,
    action: "connected_account.placeholder_created",
    targetTable: "connected_accounts",
    targetId: data?.id,
    metadata: { provider: safeProvider, displayName },
  });

  revalidatePath("/settings/connected-accounts");
}
