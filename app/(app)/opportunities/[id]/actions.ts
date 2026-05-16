"use server";

import { revalidatePath } from "next/cache";
import { requireAuthContext } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import { createSupabaseServerClient } from "@/lib/supabase";

export async function reviewReplyAction(formData: FormData) {
  const authContext = await requireAuthContext();
  const supabase = await createSupabaseServerClient();

  if (!supabase || !authContext.businessId) {
    return;
  }

  const opportunityId = String(formData.get("opportunityId") ?? "");
  const replyId = String(formData.get("replyId") ?? "");
  const action = String(formData.get("action") ?? "");
  const draftText = String(formData.get("draftText") ?? "").trim();

  if (!opportunityId || !replyId || !draftText) {
    return;
  }

  const status =
    action === "reject" ? "ignored" : action === "approve" ? "approved" : "drafted";
  const approved = action === "approve";

  await supabase
    .from("ai_replies")
    .update({ draft_text: draftText, approved })
    .eq("id", replyId);

  await supabase
    .from("opportunities")
    .update({ status })
    .eq("id", opportunityId)
    .eq("business_id", authContext.businessId);

  await logAuditEvent({
    businessId: authContext.businessId,
    userId: authContext.user.id,
    action:
      action === "reject"
        ? "reply.rejected"
        : action === "approve"
          ? "reply.approved"
          : "reply.edited",
    targetTable: "ai_replies",
    targetId: replyId,
    metadata: { opportunityId, status },
  });

  revalidatePath(`/opportunities/${opportunityId}`);
  revalidatePath("/dashboard");
}
