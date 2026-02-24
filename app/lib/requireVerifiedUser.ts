import { supabase } from "../lib/supabaseClient";

export async function requireVerifiedUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, reason: "not_logged_in" };
  }

  if (!user.email_confirmed_at) {
    return { ok: false, reason: "email_not_verified" };
  }

  return { ok: true, user };
}