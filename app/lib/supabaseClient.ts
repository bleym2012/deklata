import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
});

// Silently redirect to login on session expiry
// instead of throwing an unhandled error that crashes the app
let isSigningOut = false;
let sessionInitialised = false;

supabase.auth.onAuthStateChange((event) => {
  if (event === "INITIAL_SESSION") {
    sessionInitialised = true;
    return;
  }
  if (!sessionInitialised) return;
  if (event === "SIGNED_OUT") {
    if (isSigningOut) {
      isSigningOut = false;
      return;
    }
    if (
      typeof window !== "undefined" &&
      !window.location.pathname.startsWith("/login") &&
      !window.location.pathname.startsWith("/register") &&
      !window.location.pathname.startsWith("/reset-password")
    ) {
      window.location.href = "/login";
    }
  }
});

export function prepareSignOut() {
  isSigningOut = true;
}
