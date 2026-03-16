import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      `${origin}/forgot-password?error=missing-code`,
    );
  }

  // Try PKCE exchange first
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

  const exchangeBody = await exchangeRes.json();

  // Log for debugging — remove after confirming fix works
  console.log("EXCHANGE STATUS:", exchangeRes.status);
  console.log("EXCHANGE BODY:", JSON.stringify(exchangeBody));

  if (!exchangeRes.ok || !exchangeBody?.access_token) {
    // PKCE failed — try authorization_code grant as fallback
    const fallbackRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=authorization_code`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        },
        body: JSON.stringify({ code }),
      },
    );

    const fallbackBody = await fallbackRes.json();
    console.log("FALLBACK STATUS:", fallbackRes.status);
    console.log("FALLBACK BODY:", JSON.stringify(fallbackBody));

    if (!fallbackRes.ok || !fallbackBody?.access_token) {
      return NextResponse.redirect(
        `${origin}/forgot-password?error=expired-link&pkce=${exchangeRes.status}&fallback=${fallbackRes.status}`,
      );
    }

    const response = NextResponse.redirect(`${origin}/reset-password`);
    response.cookies.set("sb-recovery-token", fallbackBody.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });
    return response;
  }

  const response = NextResponse.redirect(`${origin}/reset-password`);
  response.cookies.set("sb-recovery-token", exchangeBody.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
