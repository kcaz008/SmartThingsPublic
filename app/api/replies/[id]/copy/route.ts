import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import { checkRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authContext = await getAuthContext();

  if (!authContext || !authContext.businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = checkRateLimit({
    key: `reply-copy:${authContext.user.id}`,
    limit: 60,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many copy events" },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ ok: true });
  }

  const { error } = await supabase
    .from("ai_replies")
    .update({ copied: true })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logAuditEvent({
    businessId: authContext.businessId,
    userId: authContext.user.id,
    action: "reply.copied",
    targetTable: "ai_replies",
    targetId: id,
  });

  return NextResponse.json({ ok: true });
}
