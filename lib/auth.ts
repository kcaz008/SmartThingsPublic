import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { currentBusiness, currentUser } from "@/lib/sample-data";
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
    businessId:
      typeof user.app_metadata?.business_id === "string"
        ? user.app_metadata.business_id
        : null,
    role: normalizeRole(user.app_metadata?.role),
    fullName:
      typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : user.email ?? "LocalSignal user",
  };
}

export function isDemoAuthEnabled() {
  return (
    process.env.NODE_ENV !== "production" &&
    (!process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

function getDemoAuthContext(): AuthContext | null {
  if (!isDemoAuthEnabled()) {
    return null;
  }

  return {
    user: {
      id: currentUser.id,
      aud: "authenticated",
      email: currentUser.email,
      app_metadata: {
        business_id: currentBusiness.id,
        role: currentUser.role,
      },
      user_metadata: {
        full_name: currentUser.fullName,
      },
      created_at: new Date().toISOString(),
    } as User,
    businessId: currentBusiness.id,
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
