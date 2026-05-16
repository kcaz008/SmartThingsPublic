import { createSupabaseServiceClient } from "@/lib/supabase";

export async function logAuditEvent({
  businessId,
  userId,
  action,
  targetTable,
  targetId,
  metadata = {},
}: {
  businessId: string | null;
  userId?: string;
  action: string;
  targetTable?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}) {
  if (!businessId) {
    return;
  }

  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    return;
  }

  await supabase.from("audit_logs").insert({
    business_id: businessId,
    user_id: userId,
    action,
    target_table: targetTable,
    target_id: targetId,
    metadata,
  });
}
