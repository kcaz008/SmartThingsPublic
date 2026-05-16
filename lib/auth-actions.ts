"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase";
import { logAuditEvent } from "@/lib/audit";

const MIN_PASSWORD_LENGTH = 10;

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/login?error=Email%20and%20password%20are%20required");
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/login?error=Supabase%20environment%20variables%20are%20missing");
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}

export async function signupAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const businessName = String(formData.get("businessName") ?? "").trim();
  const serviceArea = String(formData.get("serviceArea") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();

  if (!email || !password || !fullName || !businessName || !serviceArea) {
    redirect("/signup?error=Please%20fill%20out%20all%20required%20fields");
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    redirect(
      `/signup?error=Password%20must%20be%20at%20least%20${MIN_PASSWORD_LENGTH}%20characters`,
    );
  }

  const serviceClient = createSupabaseServiceClient();

  if (!serviceClient) {
    redirect("/signup?error=SUPABASE_SERVICE_ROLE_KEY%20is%20required%20for%20signup");
  }

  const { data: business, error: businessError } = await serviceClient
    .from("businesses")
    .insert({
      name: businessName,
      service_area: serviceArea,
      phone,
      website,
      autopilot_mode: "off",
      tone_rules: "Helpful local pro, clear, specific, and never pushy.",
      services_offered:
        "AC repair, heating repair, maintenance, heat pumps, mini-splits, installations.",
      emergency_availability: "Same-day emergency help when schedules allow.",
      preferred_tone: "Helpful, practical, local, and not salesy.",
      phrases_to_avoid: "Best in town, cheapest, guaranteed today, call now.",
    })
    .select("id")
    .single();

  if (businessError || !business) {
    redirect(
      `/signup?error=${encodeURIComponent(
        businessError?.message ?? "Unable to create business",
      )}`,
    );
  }

  const { data: createdUser, error: userError } =
    await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
      app_metadata: {
        business_id: business.id,
        role: "owner",
      },
    });

  if (userError || !createdUser.user) {
    await serviceClient.from("businesses").delete().eq("id", business.id);
    redirect(
      `/signup?error=${encodeURIComponent(
        userError?.message ?? "Unable to create user",
      )}`,
    );
  }

  await serviceClient.from("team_members").insert({
    business_id: business.id,
    auth_user_id: createdUser.user.id,
    full_name: fullName,
    email,
    role: "owner",
    phone: phone || null,
    active: true,
  });

  await logAuditEvent({
    businessId: business.id,
    userId: createdUser.user.id,
    action: "auth.signup",
    targetTable: "businesses",
    targetId: business.id,
    metadata: { businessName },
  });

  const authClient = await createSupabaseServerClient();
  await authClient?.auth.signInWithPassword({ email, password });

  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/login");
}
