"use server";

import { revalidatePath } from "next/cache";
import { requireAuthContext } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import { createSupabaseServerClient } from "@/lib/supabase";
import type { ReputationMemoryType } from "@/lib/types";

const memoryTypes = new Set<ReputationMemoryType>([
  "tone_works",
  "reply_converts",
  "employee_closes",
  "group_dislikes_promo",
]);

export async function addReputationMemoryAction(formData: FormData) {
  const authContext = await requireAuthContext();
  const supabase = await createSupabaseServerClient();

  if (!supabase || !authContext.businessId) {
    return;
  }

  const memoryType = String(
    formData.get("memoryType") ?? "tone_works",
  ) as ReputationMemoryType;
  const subject = String(formData.get("subject") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const sourceId = String(formData.get("sourceId") ?? "").trim();
  const teamMemberId = String(formData.get("teamMemberId") ?? "").trim();
  const score = Math.min(
    Math.max(Number.parseInt(String(formData.get("score") ?? "50"), 10) || 50, 0),
    100,
  );
  const evidenceCount = Math.max(
    Number.parseInt(String(formData.get("evidenceCount") ?? "1"), 10) || 1,
    0,
  );

  if (!subject || !content) {
    return;
  }

  const { data } = await supabase
    .from("reputation_memories")
    .insert({
      business_id: authContext.businessId,
      memory_type: memoryTypes.has(memoryType) ? memoryType : "tone_works",
      subject,
      content,
      source_id: sourceId || null,
      team_member_id: teamMemberId || null,
      score,
      evidence_count: evidenceCount,
      active: true,
    })
    .select("id")
    .single();

  await logAuditEvent({
    businessId: authContext.businessId,
    userId: authContext.user.id,
    action: "reputation_memory.created",
    targetTable: "reputation_memories",
    targetId: data?.id,
    metadata: { memoryType, subject, score, evidenceCount },
  });

  revalidatePath("/settings/reputation-memory");
}
