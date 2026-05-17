"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { recommendedKeywords } from "@/lib/default-keywords";
import { requireAuthContext } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
} from "@/lib/supabase";

export async function addClientBusinessAction(formData: FormData) {
  const authContext = await requireAuthContext();
  const supabase = createSupabaseServiceClient() ?? (await createSupabaseServerClient());

  if (!supabase || !authContext.businessId) {
    return;
  }

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();
  const serviceArea = String(formData.get("serviceArea") ?? "").trim();
  const brandColor = String(formData.get("brandColor") ?? "#2563eb").trim();
  const toneRules = String(formData.get("toneRules") ?? "").trim();

  if (!name || !serviceArea) {
    return;
  }

  const payload = {
      name,
      phone,
      website,
      service_area: serviceArea,
      tone_rules:
        toneRules || "Helpful local service pro, clear, specific, never pushy.",
      brand_color: brandColor || "#2563eb",
      cta_phone_rule: "usually_include_phone",
      tracking_phone: phone || null,
      autopilot_mode: "draft_only",
  };

  let { data, error } = await supabase
    .from("businesses")
    .insert(payload)
    .select("id")
    .single();

  if (error?.message.includes("brand_color")) {
    const fallbackPayload = {
      name: payload.name,
      phone: payload.phone,
      website: payload.website,
      service_area: payload.service_area,
      tone_rules: payload.tone_rules,
      cta_phone_rule: payload.cta_phone_rule,
      tracking_phone: payload.tracking_phone,
      autopilot_mode: payload.autopilot_mode,
    };
    const fallback = await supabase
      .from("businesses")
      .insert(fallbackPayload)
      .select("id")
      .single();
    data = fallback.data;
    error = fallback.error;
  }

  if (error) {
    redirect(`/settings/clients?error=${encodeURIComponent(error.message)}`);
  }

  if (data?.id) {
    await supabase.from("target_keywords").upsert(
      recommendedKeywords.slice(0, 20).map((keyword) => ({
        business_id: data.id,
        keyword,
      })),
      { onConflict: "business_id,keyword" },
    );
  }

  await logAuditEvent({
    businessId: authContext.businessId,
    userId: authContext.user.id,
    action: "client_business.created",
    targetTable: "businesses",
    targetId: data?.id,
    metadata: { name, serviceArea, brandColor },
  });

  revalidatePath("/settings/clients");
  revalidatePath("/dashboard");
  redirect("/settings/clients?created=1");
}

export async function addClientKeywordAction(formData: FormData) {
  const authContext = await requireAuthContext();
  const supabase = createSupabaseServiceClient() ?? (await createSupabaseServerClient());

  if (!supabase || !authContext.businessId) {
    return;
  }

  const businessId = String(formData.get("businessId") ?? "").trim();
  const keyword = String(formData.get("keyword") ?? "").trim();

  if (!businessId || !keyword) {
    return;
  }

  const { data } = await supabase
    .from("target_keywords")
    .upsert({ business_id: businessId, keyword }, { onConflict: "business_id,keyword" })
    .select("id")
    .single();

  await logAuditEvent({
    businessId: authContext.businessId,
    userId: authContext.user.id,
    action: "client_keyword.created",
    targetTable: "target_keywords",
    targetId: data?.id,
    metadata: { targetBusinessId: businessId, keyword },
  });

  revalidatePath("/settings/clients");
  redirect("/settings/clients?keyword=1");
}

export async function addRecommendedKeywordsToClientAction(formData: FormData) {
  const authContext = await requireAuthContext();
  const supabase = createSupabaseServiceClient() ?? (await createSupabaseServerClient());

  if (!supabase || !authContext.businessId) {
    return;
  }

  const businessId = String(formData.get("businessId") ?? "").trim();

  if (!businessId) {
    return;
  }

  await supabase.from("target_keywords").upsert(
    recommendedKeywords.map((keyword) => ({
      business_id: businessId,
      keyword,
    })),
    { onConflict: "business_id,keyword" },
  );

  await logAuditEvent({
    businessId: authContext.businessId,
    userId: authContext.user.id,
    action: "client_keyword.recommended_set_added",
    targetTable: "target_keywords",
    metadata: { targetBusinessId: businessId, count: recommendedKeywords.length },
  });

  revalidatePath("/settings/clients");
  redirect("/settings/clients?recommended=1");
}
