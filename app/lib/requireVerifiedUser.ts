import { supabase } from "../lib/supabaseClient";

export async function requireVerifiedUser() {
  // getSession() reads from localStorage — instant and always returns
  // the correct session for both Google OAuth and email/password users.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return { ok: false, reason: "not_logged_in" } as const;
  }

  const user = session.user;

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
