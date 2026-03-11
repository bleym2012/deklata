// app/auth/callback/route.ts
//
// PKCE code exchange for ALL auth flows.
// Recovery → sets httpOnly cookie, goes to /reset-password (no session)
// OAuth/email → redirects to /auth/complete which exchanges code client-side

import { NextRequest, NextResponse } from "next/server";

const ALLOWED_NEXT = ["/", "/onboarding", "/dashboard", "/reset-password"];

function safeNext(next: string | null): string {
  if (!next) return "/";
  const decoded = decodeURIComponent(next);
  if (
    decoded.startsWith("/") &&
    ALLOWED_NEXT.some((p) => decoded.startsWith(p))
  )
    return decoded;
  return "/";
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(
      `${origin}/forgot-password?error=missing-code`,
    );
  }

  // Exchange code server-side to inspect the token type
  const exchangeRes = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=pkce`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
      body: JSON.stringify({ auth_code: code }),
    },
  );

  if (!exchangeRes.ok) {
    return NextResponse.redirect(
      `${origin}/forgot-password?error=expired-link`,
    );
  }

  const data = await exchangeRes.json();
  const isRecovery = data?.type === "recovery";

  if (isRecovery) {
    // Recovery: cookie-only, no session, redirect to password form
    const response = NextResponse.redirect(`${origin}/reset-password`);
    response.cookies.set("sb-recovery-token", data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/", // "/" so /api/auth/* routes can read it
    });
    return response;
  }

  // OAuth / email confirmation: redirect to client-side page that
  // calls supabase.auth.exchangeCodeForSession(code) properly.
  // We pass the code and next destination as query params.
  // This lets Supabase JS set up the session correctly in the browser.
  const completeUrl = new URL(`${origin}/auth/complete`);
  completeUrl.searchParams.set("code", code);
  completeUrl.searchParams.set("next", next);
  return NextResponse.redirect(completeUrl.toString());
}
