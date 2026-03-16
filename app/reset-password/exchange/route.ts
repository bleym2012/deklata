import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      `${origin}/forgot-password?error=missing-code`,
    );
  }

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

  const session = await exchangeRes.json();

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
