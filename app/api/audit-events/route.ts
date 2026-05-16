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
  const eventType = String(body.event_type ?? "").trim();

  if (!eventType) {
    return NextResponse.json(
      { error: "event_type is required" },
      { status: 400, headers: corsHeaders },
    );
  }

  const event = {
    business_id: String(body.business_id ?? currentBusiness.id),
    opportunity_id: body.opportunity_id ? String(body.opportunity_id) : null,
    event_type: eventType,
    event_summary: String(body.event_summary ?? eventType),
    metadata:
      body.metadata && typeof body.metadata === "object" ? body.metadata : {},
  };
  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    return NextResponse.json(
      { accepted: true, stored: false, event },
      { headers: corsHeaders },
    );
  }

  const { error } = await supabase.from("audit_events").insert(event);

  return NextResponse.json(
    { accepted: true, stored: !error, event },
    { headers: corsHeaders },
  );
}
