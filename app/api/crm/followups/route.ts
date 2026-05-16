import { NextResponse } from "next/server";
import { currentBusiness } from "@/lib/sample-data";
import { createSupabaseServiceClient } from "@/lib/supabase";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const summary = String(body.summary ?? "").trim();

  if (!summary) {
    return NextResponse.json(
      { error: "summary is required" },
      { status: 400, headers: corsHeaders },
    );
  }

  const followup = {
    business_id: String(body.business_id ?? currentBusiness.id),
    opportunity_id: body.opportunity_id ? String(body.opportunity_id) : null,
    channel: String(body.channel ?? "crm"),
    summary,
    due_at: body.due_at ? String(body.due_at) : null,
    completed: Boolean(body.completed ?? false),
  };
  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    return NextResponse.json(
      { accepted: true, stored: false, followup },
      { headers: corsHeaders },
    );
  }

  const { error } = await supabase.from("crm_followups").insert(followup);

  return NextResponse.json(
    { accepted: true, stored: !error, followup },
    { headers: corsHeaders },
  );
}
