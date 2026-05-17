"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function switchActiveBusinessAction(formData: FormData) {
  const businessId = String(formData.get("businessId") ?? "").trim();

  if (businessId) {
    const cookieStore = await cookies();
    cookieStore.set("localsignal_active_business_id", businessId, {
      path: "/",
      sameSite: "lax",
    });
  }

  redirect("/dashboard");
}
