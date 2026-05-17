import { createClient } from "@supabase/supabase-js";

const {
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  SEED_USER_EMAIL,
  SEED_USER_PASSWORD,
  SEED_USER_FULL_NAME = "LocalSignal Owner",
  SEED_BUSINESS_NAME = "Atlantic Climate Systems",
  SEED_BUSINESS_SERVICE_AREA = "Nassau County, Suffolk County, Queens, and western Long Island",
  SEED_BUSINESS_PHONE = "(516) 777-0242",
  SEED_BUSINESS_WEBSITE = "https://example.com",
} = process.env;

if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.",
  );
}

if (!SEED_USER_EMAIL || !SEED_USER_PASSWORD) {
  throw new Error("SEED_USER_EMAIL and SEED_USER_PASSWORD are required.");
}

if (SEED_USER_PASSWORD.length < 10) {
  throw new Error("SEED_USER_PASSWORD must be at least 10 characters.");
}

const supabase = createClient(
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

const { data: business, error: businessError } = await supabase
  .from("businesses")
  .insert({
    name: SEED_BUSINESS_NAME,
    service_area: SEED_BUSINESS_SERVICE_AREA,
    phone: SEED_BUSINESS_PHONE,
    website: SEED_BUSINESS_WEBSITE,
    autopilot_mode: "off",
    tone_rules:
      "Helpful local HVAC pro, clear, specific, never pushy, and no auto-posting claims.",
    services_offered:
      "AC repair, heating repair, maintenance, installations, heat pumps, mini-splits, indoor air quality.",
    emergency_availability:
      "Same-day emergency HVAC help when schedules allow; never promise a slot before dispatch confirms.",
    brands_serviced:
      "Carrier, Trane, Lennox, Rheem, Goodman, Mitsubishi, Fujitsu, Bosch, Navien, and most major brands.",
    financing_options: "Financing may be available for qualifying replacements.",
    warranty_notes:
      "Warranty depends on manufacturer coverage, equipment age, and repair type.",
    preferred_tone:
      "Calm, practical, Long Island local, and helpful without sounding like an ad.",
    phrases_to_avoid:
      "Best in town, cheapest, guaranteed today, call now, we beat any price.",
    cta_phone_rule: "no_cta_if_promo_sensitive",
    tracking_phone: SEED_BUSINESS_PHONE,
  })
  .select("id")
  .single();

if (businessError || !business) {
  throw businessError ?? new Error("Unable to create seed business.");
}

const { data: createdUser, error: userError } =
  await supabase.auth.admin.createUser({
    email: SEED_USER_EMAIL,
    password: SEED_USER_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: SEED_USER_FULL_NAME },
    app_metadata: {
      business_id: business.id,
      role: "owner",
    },
  });

if (userError || !createdUser.user) {
  await supabase.from("businesses").delete().eq("id", business.id);
  throw userError ?? new Error("Unable to create seed user.");
}

const { data: teamMember, error: teamMemberError } = await supabase
  .from("team_members")
  .insert({
    business_id: business.id,
    auth_user_id: createdUser.user.id,
    full_name: SEED_USER_FULL_NAME,
    email: SEED_USER_EMAIL,
    role: "owner",
    phone: SEED_BUSINESS_PHONE,
    facebook_display_name: SEED_USER_FULL_NAME,
    active: true,
  })
  .select("id")
  .single();

if (teamMemberError || !teamMember) {
  await supabase.from("businesses").delete().eq("id", business.id);
  throw teamMemberError ?? new Error("Unable to create seed team member.");
}

await supabase.from("sources").insert([
  {
    business_id: business.id,
    name: "Garden City Moms & Neighbors",
    type: "facebook_group",
    town: "Garden City",
    active: true,
    promo_sensitivity: "high",
    admin_strictness: "medium",
    best_reply_style: "personal",
    phone_safe_in_public: false,
    dm_first_preferred: true,
    second_responder_works: true,
  },
  {
    business_id: business.id,
    name: "Manual intake",
    type: "manual",
    town: "Long Island",
    active: true,
    promo_sensitivity: "low",
    admin_strictness: "low",
    best_reply_style: "company",
    phone_safe_in_public: true,
    dm_first_preferred: false,
    second_responder_works: false,
  },
]);

await supabase.from("connected_accounts").insert({
  business_id: business.id,
  team_member_id: teamMember.id,
  platform: "facebook",
  provider: "facebook_group",
  display_name: SEED_USER_FULL_NAME,
  status: "not_connected",
  connected_groups: ["Garden City Moms & Neighbors"],
  allowed_business_ids: [business.id],
  allowed_groups: ["Garden City Moms & Neighbors"],
  reply_style: "both",
  scopes: ["pages_read_engagement"],
  notes:
    "Seed placeholder only. Use official Meta OAuth/API before connecting.",
});

await supabase.from("target_keywords").insert([
  { business_id: business.id, keyword: "AC not cooling" },
  { business_id: business.id, keyword: "no heat" },
  { business_id: business.id, keyword: "no AC" },
  { business_id: business.id, keyword: "heat not working" },
  { business_id: business.id, keyword: "emergency HVAC" },
  { business_id: business.id, keyword: "AC stopped working" },
  { business_id: business.id, keyword: "boiler not working" },
  { business_id: business.id, keyword: "AC blowing warm air" },
  { business_id: business.id, keyword: "air conditioner leaking" },
  { business_id: business.id, keyword: "furnace quote" },
  { business_id: business.id, keyword: "thermostat blank" },
  { business_id: business.id, keyword: "second opinion HVAC quote" },
  { business_id: business.id, keyword: "heat pump installation" },
  { business_id: business.id, keyword: "mini split installation" },
  { business_id: business.id, keyword: "ductless AC" },
  { business_id: business.id, keyword: "oil to heat pump" },
  { business_id: business.id, keyword: "HVAC financing" },
  { business_id: business.id, keyword: "NYSERDA rebate" },
  { business_id: business.id, keyword: "AC tune up" },
  { business_id: business.id, keyword: "HVAC maintenance plan" },
  { business_id: business.id, keyword: "duct cleaning" },
  { business_id: business.id, keyword: "indoor air quality" },
  { business_id: business.id, keyword: "Garden City HVAC" },
  { business_id: business.id, keyword: "Huntington HVAC" },
  { business_id: business.id, keyword: "Nassau County HVAC" },
  { business_id: business.id, keyword: "Suffolk County HVAC" },
]);

await supabase.from("reputation_memories").insert([
  {
    business_id: business.id,
    memory_type: "tone_works",
    subject: "Emergency AC posts",
    content:
      "Empathetic, practical replies that mention one troubleshooting detail perform better than sales-first messages.",
    score: 84,
    evidence_count: 3,
  },
  {
    business_id: business.id,
    memory_type: "group_dislikes_promo",
    subject: "Garden City Moms & Neighbors",
    content:
      "Avoid promotional language and phone-number-first replies; this group responds better to helpful context and soft offers.",
    score: 91,
    evidence_count: 2,
  },
]);

await supabase.from("competitor_mentions").insert({
  business_id: business.id,
  competitor_name: "Cool Breeze",
  town: "Garden City",
  mention_count: 2,
  mentioned_before_us: true,
  higher_priority: true,
});

await supabase.from("audit_logs").insert({
  business_id: business.id,
  user_id: createdUser.user.id,
  action: "seed.created",
  target_table: "businesses",
  target_id: business.id,
  metadata: { email: SEED_USER_EMAIL },
});

console.log(`Created seed user ${SEED_USER_EMAIL} for business ${business.id}`);
