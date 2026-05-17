import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { businesses, currentBusiness, currentUser } from "@/lib/sample-data";
import { createSupabaseServerClient } from "@/lib/supabase";

export type AppRole = "owner" | "admin" | "dispatcher" | "technician";

export type AuthContext = {
  user: User;
  businessId: string | null;
  role: AppRole;
  fullName: string;
};

export async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return getDemoAuthContext();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return {
    user,
    businessId: await resolveActiveBusinessId(
      typeof user.app_metadata?.business_id === "string"
        ? user.app_metadata.business_id
        : null,
    ),
    role: normalizeRole(user.app_metadata?.role),
    fullName:
      typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : user.email ?? "LocalSignal user",
  };
}

async function resolveActiveBusinessId(fallbackBusinessId: string | null) {
  const cookieStore = await cookies();
  return cookieStore.get("localsignal_active_business_id")?.value ?? fallbackBusinessId;
}

export function isDemoAuthEnabled() {
  return (
    process.env.NODE_ENV !== "production" &&
    (!process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

async function getDemoAuthContext(): Promise<AuthContext | null> {
  if (!isDemoAuthEnabled()) {
    return null;
  }

  const cookieStore = await cookies();
  const requestedBusinessId = cookieStore.get("localsignal_active_business_id")?.value;
  const activeBusinessId =
    businesses.find((business) => business.id === requestedBusinessId)?.id ??
    currentBusiness.id;

  return {
    user: {
      id: currentUser.id,
      aud: "authenticated",
      email: currentUser.email,
      app_metadata: {
        business_id: activeBusinessId,
        role: currentUser.role,
      },
      user_metadata: {
        full_name: currentUser.fullName,
      },
      created_at: new Date().toISOString(),
    } as User,
    businessId: activeBusinessId,
    role: currentUser.role,
    fullName: currentUser.fullName,
  };
}

export async function requireAuthContext() {
  const authContext = await getAuthContext();

  if (!authContext) {
    redirect("/login");
  }

  return authContext;
}

export function canManageBusiness(role: AppRole) {
  return role === "owner" || role === "admin";
}

function normalizeRole(role: unknown): AppRole {
  return role === "owner" ||
    role === "admin" ||
    role === "dispatcher" ||
    role === "technician"
    ? role
    : "dispatcher";
}
