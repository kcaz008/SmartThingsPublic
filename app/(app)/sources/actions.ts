"use server";

import { revalidatePath } from "next/cache";
import { requireAuthContext } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import { recommendedKeywords } from "@/lib/default-keywords";
import { createSupabaseServerClient } from "@/lib/supabase";
import type { SourceType } from "@/lib/types";

const sourceTypes = new Set<SourceType>([
  "facebook_group",
  "nextdoor",
  "reddit",
  "manual",
  "other",
]);

export async function addSourceAction(formData: FormData) {
  const authContext = await requireAuthContext();
  const supabase = await createSupabaseServerClient();

  if (!supabase || !authContext.businessId) {
    return;
  }

  const type = String(formData.get("type") ?? "manual") as SourceType;
  const sourceType = sourceTypes.has(type) ? type : "manual";
  const name = String(formData.get("name") ?? "").trim();
  const town = String(formData.get("town") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();

  if (!name) {
    return;
  }

  const { data } = await supabase
    .from("sources")
    .insert({
      business_id: authContext.businessId,
      name,
      type: sourceType,
      town,
      url: url || null,
      active: true,
    })
    .select("id")
    .single();

  await logAuditEvent({
    businessId: authContext.businessId,
    userId: authContext.user.id,
    action: "source.created",
    targetTable: "sources",
    targetId: data?.id,
    metadata: { name, type: sourceType, town },
  });

  revalidatePath("/sources");
}

export async function addKeywordAction(formData: FormData) {
  const authContext = await requireAuthContext();
  const supabase = await createSupabaseServerClient();

  if (!supabase || !authContext.businessId) {
    return;
  }

  const keyword = String(formData.get("keyword") ?? "").trim();

  if (!keyword) {
    return;
  }

  const { data } = await supabase
    .from("target_keywords")
    .insert({
      business_id: authContext.businessId,
      keyword,
    })
    .select("id")
    .single();

  await logAuditEvent({
    businessId: authContext.businessId,
    userId: authContext.user.id,
    action: "keyword.created",
    targetTable: "target_keywords",
    targetId: data?.id,
    metadata: { keyword },
  });

  revalidatePath("/sources");
}

export async function addRecommendedKeywordsAction() {
  const authContext = await requireAuthContext();
  const supabase = await createSupabaseServerClient();

  if (!supabase || !authContext.businessId) {
    return;
  }

  await supabase.from("target_keywords").upsert(
    recommendedKeywords.map((keyword) => ({
      business_id: authContext.businessId,
      keyword,
    })),
    { onConflict: "business_id,keyword" },
  );

  await logAuditEvent({
    businessId: authContext.businessId,
    userId: authContext.user.id,
    action: "keyword.recommended_set_added",
    targetTable: "target_keywords",
    metadata: { count: recommendedKeywords.length },
  });

  revalidatePath("/sources");
}
