import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("sb-recovery-token")?.value;

  if (!token) {
    return NextResponse.json({ error: "No recovery token" }, { status: 401 });
  }

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
    const response = NextResponse.json(
      { error: "Token expired" },
      { status: 401 },
    );
    response.cookies.set("sb-recovery-token", "", { maxAge: 0, path: "/" });
    return response;
  }

  return NextResponse.json({ ok: true });
}
