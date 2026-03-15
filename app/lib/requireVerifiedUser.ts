import { supabase } from "../lib/supabaseClient";

export async function requireVerifiedUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not logged in at all
  if (!user) {
    return { ok: false, reason: "not_logged_in" } as const;
  }

  // If user is logged in, their email is verified.
  // Email/password users must confirm before Supabase lets them log in.
  // Google OAuth users are verified by Google.
  // No need to check email_confirmed_at separately.

  // Check onboarding — must have campus and phone set
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
