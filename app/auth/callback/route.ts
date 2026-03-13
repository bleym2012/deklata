// app/auth/callback/route.ts
//
// Receives the password reset link from Supabase email:
//   GET /auth/callback?token_hash=xxx&type=recovery
//
// Exchanges the token server-side so the browser never sees it.
// Sets a short-lived httpOnly cookie, then redirects to /reset-password.
// The Supabase JS client never gets a chance to process the token.

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  if (!token_hash || type !== "recovery") {
    return NextResponse.redirect(
      `${origin}/forgot-password?error=invalid-link`,
    );
  }

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
    return NextResponse.redirect(
      `${origin}/forgot-password?error=expired-link`,
    );
  }

  const session = await verifyRes.json();

  if (!session?.access_token) {
    return NextResponse.redirect(
      `${origin}/forgot-password?error=invalid-token`,
    );
  }

  const response = NextResponse.redirect(`${origin}/reset-password`);
  response.cookies.set("sb-recovery-token", session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return response;
}
