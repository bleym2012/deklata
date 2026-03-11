// app/api/auth/verify-recovery/route.ts
//
// Verifies the recovery cookie exists AND the token is still valid
// by checking it against Supabase. Prevents showing the reset form
// for expired tokens that haven't been cleared yet.

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("sb-recovery-token")?.value;

  if (!token) {
    return NextResponse.json({ error: "No recovery token" }, { status: 401 });
  }

  // Verify the token is still valid with Supabase — not just that it exists.
  // GET /auth/v1/user returns the user if the token is valid, 401 if expired.
  const verifyRes = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`,
    {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!verifyRes.ok) {
    // Token expired or invalid — clear the stale cookie
    const response = NextResponse.json(
      { error: "Recovery token expired." },
      { status: 401 },
    );
    response.cookies.set("sb-recovery-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });
    return response;
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
