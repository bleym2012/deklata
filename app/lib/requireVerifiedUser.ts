import { supabase } from "../lib/supabaseClient";

export async function requireVerifiedUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, reason: "not_logged_in" } as const;
  }

  if (!user.email_confirmed_at) {
    return { ok: false, reason: "email_not_verified" } as const;
  }

  // Check onboarding — same logic as add-item page
  const { data: profile } = await supabase
    .from("profiles")
    .select("campus, phone")
    .eq("id", user.id)
    .single();

  const noCampus =
    !profile?.campus ||
    profile.campus === "Not specified" ||
    profile.campus.trim() === "";
  const noPhone = !profile?.phone || profile.phone.trim() === "";

  if (noCampus || noPhone) {
    return { ok: false, reason: "not_onboarded" } as const;
  }

  return { ok: true, user } as const;
}
