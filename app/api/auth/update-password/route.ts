// app/api/auth/update-password/route.ts
//
// Uses the recovery token from the httpOnly cookie to update the password.
// Verifies the token is still valid with Supabase before accepting it.
// Clears the cookie on success AND failure to prevent reuse.

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("sb-recovery-token")?.value;

  if (!token) {
    return NextResponse.json(
      { error: "Recovery session expired. Please request a new reset link." },
      { status: 401 },
    );
  }

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { password } = body;

  if (!password || typeof password !== "string" || password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }

  // Always clear the cookie — whether success or failure.
  // This prevents any possibility of token reuse.
  const clearCookie = (response: NextResponse) => {
    response.cookies.set("sb-recovery-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });
    return response;
  };

  // Update password via Supabase REST API using the recovery token as Bearer.
  // Supabase validates the token server-side — if it's expired or already used,
  // this call will fail with 401 and we return an appropriate error.
  const updateRes = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ password }),
    },
  );

  if (!updateRes.ok) {
    const err = await updateRes.json().catch(() => ({}));
    const response = NextResponse.json(
      {
        error:
          err?.message ||
          "Failed to update password. The link may have expired.",
      },
      { status: 400 },
    );
    return clearCookie(response);
  }

  const response = NextResponse.json({ ok: true }, { status: 200 });
  return clearCookie(response);
}
