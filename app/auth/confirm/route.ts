// app/auth/confirm/route.ts
//
// This route receives the password reset link click.
// Supabase appends: ?token_hash=xxx&type=recovery to the redirectTo URL.
//
// We exchange the token here server-side, confirm it's a recovery type,
// then redirect to /reset-password with the session cookie set.
// The reset-password page then sees an active session and shows the form.
// No race condition, no auto-login to homepage.

import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  if (token_hash && type === "recovery") {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              );
            } catch {}
          },
        },
      },
    );

    const { error } = await supabase.auth.verifyOtp({
      type: "recovery",
      token_hash,
    });

    if (!error) {
      // Token exchanged, session cookie set — send to reset form
      return NextResponse.redirect(new URL("/reset-password", request.url));
    }
  }

  // Invalid or expired token
  return NextResponse.redirect(
    new URL("/forgot-password?error=invalid-link", request.url),
  );
}
