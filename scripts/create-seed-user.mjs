import { createClient } from "@supabase/supabase-js";

const {
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  SEED_USER_EMAIL,
  SEED_USER_PASSWORD,
  SEED_USER_FULL_NAME = "LocalSignal Owner",
  SEED_BUSINESS_NAME = "Cardinal Heating & Air",
  SEED_BUSINESS_SERVICE_AREA = "St. Louis County, St. Charles County",
  SEED_BUSINESS_PHONE = "(314) 555-0199",
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

await supabase.from("sources").insert([
  {
    business_id: business.id,
    name: "Webster Groves Community",
    type: "facebook_group",
    town: "Webster Groves",
    active: true,
  },
  {
    business_id: business.id,
    name: "Manual intake",
    type: "manual",
    town: "All service areas",
    active: true,
  },
]);

await supabase.from("target_keywords").insert([
  { business_id: business.id, keyword: "AC not cooling" },
  { business_id: business.id, keyword: "furnace quote" },
  { business_id: business.id, keyword: "thermostat blank" },
]);

await supabase.from("audit_logs").insert({
  business_id: business.id,
  user_id: createdUser.user.id,
  action: "seed.created",
  target_table: "businesses",
  target_id: business.id,
  metadata: { email: SEED_USER_EMAIL },
});

console.log(`Created seed user ${SEED_USER_EMAIL} for business ${business.id}`);
