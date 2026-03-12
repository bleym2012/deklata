// app/auth/callback/route.ts
//
// Supabase password reset emails send:
//   /auth/callback?token_hash=xxx&type=recovery
//
// We exchange the token_hash server-side using the /auth/v1/verify endpoint,
// confirm it's a recovery type, then set a short-lived httpOnly cookie and
// redirect to /reset-password. The browser never sees the raw token so the
// Supabase JS client cannot auto-establish a session.

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  // Reject anything that isn't a recovery link
  if (!token_hash || type !== "recovery") {
    return NextResponse.redirect(
      `${origin}/forgot-password?error=invalid-link`,
    );
  }

  // Exchange token_hash for a session via Supabase REST API.
  // No extra packages needed — plain fetch.
  const verifyRes = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/verify`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
      body: JSON.stringify({ token_hash, type: "recovery" }),
    },
  );

  if (!verifyRes.ok) {
    // Expired or already-used token
    return NextResponse.redirect(
      `${origin}/forgot-password?error=expired-link`,
    );
  }

  const data = await verifyRes.json();
  const accessToken = data?.access_token;

  if (!accessToken) {
    return NextResponse.redirect(
      `${origin}/forgot-password?error=invalid-token`,
    );
  }

  // Set httpOnly cookie with the recovery access token.
  // httpOnly = JS cannot read it, only server routes can.
  // path="/" = /api/auth/* routes can receive it.
  // maxAge=600 = expires in 10 minutes (matches Supabase token expiry).
  const response = NextResponse.redirect(`${origin}/reset-password`);
  response.cookies.set("sb-recovery-token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return response;
}
