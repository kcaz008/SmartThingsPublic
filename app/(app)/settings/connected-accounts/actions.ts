"use server";

import { revalidatePath } from "next/cache";
import { requireAuthContext } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import { formatCompanyKnowledgeForAi } from "@/lib/company-knowledge";
import { getBusiness, getReputationMemorySummary } from "@/lib/data";
import { createAiAnalysis } from "@/lib/openai";
import { createSupabaseServerClient } from "@/lib/supabase";
import type { Platform, TeamMember } from "@/lib/types";

const supportedPlatforms = new Set<Platform>([
  "facebook",
  "nextdoor",
  "reddit",
  "manual",
  "other",
]);

const supportedRoles = new Set<TeamMember["role"]>([
  "owner",
  "admin",
  "dispatcher",
  "technician",
]);

const supportedStatuses = new Set([
  "not_connected",
  "connected",
  "needs_reauth",
  "pending_oauth",
  "error",
]);

function parseList(value: string) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function addTeamMemberAction(formData: FormData) {
  const authContext = await requireAuthContext();
  const supabase = await createSupabaseServerClient();

  if (!supabase || !authContext.businessId) {
    return;
  }

  const role = String(formData.get("role") ?? "dispatcher") as TeamMember["role"];
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const facebookDisplayName = String(
    formData.get("facebookDisplayName") ?? "",
  ).trim();

  if (!fullName || !email) {
    return;
  }

  const { data } = await supabase
    .from("team_members")
    .insert({
      business_id: authContext.businessId,
      full_name: fullName,
      email,
      role: supportedRoles.has(role) ? role : "dispatcher",
      phone: phone || null,
      facebook_display_name: facebookDisplayName || null,
      active: true,
    })
    .select("id")
    .single();

  await logAuditEvent({
    businessId: authContext.businessId,
    userId: authContext.user.id,
    action: "team_member.created",
    targetTable: "team_members",
    targetId: data?.id,
    metadata: { email, role },
  });

  revalidatePath("/settings/connected-accounts");
}

export async function addConnectedAccountAction(formData: FormData) {
  const authContext = await requireAuthContext();
  const supabase = await createSupabaseServerClient();

  if (!supabase || !authContext.businessId) {
    return;
  }

  const platform = String(formData.get("platform") ?? "facebook") as Platform;
  const status = String(formData.get("status") ?? "not_connected");
  const teamMemberId = String(formData.get("teamMemberId") ?? "").trim();
  const externalAccountId = String(
    formData.get("externalAccountId") ?? "",
  ).trim();
  const displayName = String(formData.get("displayName") ?? "").trim();
  const connectedGroups = parseList(String(formData.get("connectedGroups") ?? ""));
  const notes = String(formData.get("notes") ?? "").trim();

  if (!displayName) {
    return;
  }

  const safePlatform = supportedPlatforms.has(platform) ? platform : "other";
  const { data } = await supabase
    .from("connected_accounts")
    .insert({
      business_id: authContext.businessId,
      team_member_id: teamMemberId || null,
      platform: safePlatform,
      provider: safePlatform === "facebook" ? "facebook_group" : safePlatform,
      external_account_id: externalAccountId || null,
      display_name: displayName,
      status: supportedStatuses.has(status) ? status : "not_connected",
      connected_groups: connectedGroups,
      scopes: safePlatform === "facebook" ? ["pages_read_engagement"] : [],
      connected_at: status === "connected" ? new Date().toISOString() : null,
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
    metadata: { platform: safePlatform, displayName, teamMemberId },
  });

  revalidatePath("/settings/connected-accounts");
}

export async function importManualFacebookPostAction(formData: FormData) {
  const authContext = await requireAuthContext();
  const supabase = await createSupabaseServerClient();

  if (!supabase || !authContext.businessId) {
    return;
  }

  const teamMemberId = String(formData.get("teamMemberId") ?? "").trim();
  const externalPostId = String(formData.get("externalPostId") ?? "").trim();
  const postUrl = String(formData.get("postUrl") ?? "").trim();
  const authorName = String(formData.get("authorName") ?? "").trim();
  const postText = String(formData.get("postText") ?? "").trim();
  const commentCount = Math.max(
    Number.parseInt(String(formData.get("commentCount") ?? "0"), 10) || 0,
    0,
  );
  const commentsAgo = Math.max(
    Number.parseInt(String(formData.get("commentsAgo") ?? "0"), 10) || 0,
    0,
  );
  const manualResponse = String(formData.get("manualResponse") ?? "").trim();

  if (!teamMemberId || !postText) {
    return;
  }

  let manualPostId: string | undefined;
  const duplicateQuery = supabase
    .from("facebook_manual_posts")
    .select("id")
    .eq("business_id", authContext.businessId)
    .limit(1);

  const duplicatePost = externalPostId
    ? await duplicateQuery.eq("external_post_id", externalPostId).maybeSingle()
    : postUrl
      ? await duplicateQuery.eq("post_url", postUrl).maybeSingle()
      : await duplicateQuery.eq("post_text", postText).maybeSingle();

  if (duplicatePost.data?.id) {
    manualPostId = duplicatePost.data.id;
  } else {
    const { data: insertedPost } = await supabase
      .from("facebook_manual_posts")
      .insert({
        business_id: authContext.businessId,
        external_post_id: externalPostId || null,
        post_url: postUrl || null,
        author_name: authorName || null,
        post_text: postText,
        comment_count: commentCount,
      })
      .select("id")
      .single();

    manualPostId = insertedPost?.id;
  }

  if (!manualPostId) {
    return;
  }

  const { data: existingReply } = await supabase
    .from("facebook_reply_history")
    .select("id")
    .eq("manual_post_id", manualPostId)
    .eq("team_member_id", teamMemberId)
    .maybeSingle();

  if (existingReply) {
    await logAuditEvent({
      businessId: authContext.businessId,
      userId: authContext.user.id,
      action: "facebook_reply.duplicate_prevented",
      targetTable: "facebook_manual_posts",
      targetId: manualPostId,
      metadata: { teamMemberId, externalPostId, postUrl },
    });
    revalidatePath("/settings/connected-accounts");
    return;
  }

  const [business, reputationMemory] = await Promise.all([
    getBusiness(authContext.businessId),
    getReputationMemorySummary(authContext.businessId),
  ]);
  const aiAnalysis = await createAiAnalysis({
    post_text: postText,
    source_name: "Manual Facebook import",
    source_type: "facebook_group",
    service_area: business.serviceArea,
    company_name: business.name,
    company_phone: business.phone,
    tone_rules: [
      business.toneRules,
      formatCompanyKnowledgeForAi(business),
      reputationMemory ? `Reputation memory:\n${reputationMemory}` : "",
    ]
      .filter(Boolean)
      .join("\n\n"),
  });

  const { data: opportunity } = await supabase
    .from("opportunities")
    .insert({
      business_id: authContext.businessId,
      original_text: postText,
      post_url: postUrl || null,
      author_name: authorName || null,
      detected_town: aiAnalysis.detected_town,
      service_type: aiAnalysis.service_type,
      urgency: aiAnalysis.urgency,
      lead_score: aiAnalysis.lead_score,
      sentiment: aiAnalysis.sentiment,
      intent_type: aiAnalysis.intent_type,
      status: aiAnalysis.is_relevant ? "drafted" : "ignored",
    })
    .select("id")
    .single();

  let aiReplyId: string | undefined;
  const responseText = manualResponse || aiAnalysis.suggested_reply;

  if (opportunity?.id) {
    const { data: aiReply } = await supabase
      .from("ai_replies")
      .insert({
        opportunity_id: opportunity.id,
        draft_text: aiAnalysis.suggested_reply,
        approved: false,
      })
      .select("id")
      .single();
    aiReplyId = aiReply?.id;
  }

  const { data: history } = await supabase
    .from("facebook_reply_history")
    .insert({
      business_id: authContext.businessId,
      manual_post_id: manualPostId,
      team_member_id: teamMemberId,
      ai_reply_id: aiReplyId ?? null,
      response_text: responseText,
      comments_ago: commentsAgo,
    })
    .select("id")
    .single();

  await logAuditEvent({
    businessId: authContext.businessId,
    userId: authContext.user.id,
    action: "facebook_manual_post.imported",
    targetTable: "facebook_reply_history",
    targetId: history?.id,
    metadata: {
      manualPostId,
      teamMemberId,
      opportunityId: opportunity?.id,
      commentsAgo,
      duplicateProtected: true,
    },
  });

  revalidatePath("/settings/connected-accounts");
  revalidatePath("/dashboard");
}
