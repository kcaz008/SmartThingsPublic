import { createClient } from "@supabase/supabase-js";

for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // It is fine if a local env file is absent; CI may inject env directly.
  }
}

const requiredEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];

const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length) {
  console.error(`Missing required Supabase env: ${missingEnv.join(", ")}`);
  process.exit(1);
}

const serviceClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

const requiredTables = [
  "businesses",
  "sources",
  "opportunities",
  "ai_replies",
  "team_members",
  "target_keywords",
  "connected_accounts",
  "facebook_manual_posts",
  "facebook_reply_history",
  "reputation_memories",
  "competitor_mentions",
  "audit_logs",
];

for (const table of requiredTables) {
  const { error } = await serviceClient.from(table).select("*").limit(1);

  if (error) {
    console.error(`Supabase table check failed for ${table}: ${error.message}`);
    process.exit(1);
  }
}

console.log("Supabase database tables are reachable.");

if (process.env.CHECK_USER_EMAIL || process.env.CHECK_USER_PASSWORD) {
  if (!process.env.CHECK_USER_EMAIL || !process.env.CHECK_USER_PASSWORD) {
    console.error("Set both CHECK_USER_EMAIL and CHECK_USER_PASSWORD.");
    process.exit(1);
  }

  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  const { data, error } = await anonClient.auth.signInWithPassword({
    email: process.env.CHECK_USER_EMAIL,
    password: process.env.CHECK_USER_PASSWORD,
  });

  if (error || !data.user) {
    console.error(`Supabase login check failed: ${error?.message}`);
    process.exit(1);
  }

  if (!data.user.app_metadata?.business_id) {
    console.error("Login worked, but user is missing app_metadata.business_id.");
    process.exit(1);
  }

  console.log(
    `Supabase login works for ${process.env.CHECK_USER_EMAIL}; business_id is present.`,
  );
}
