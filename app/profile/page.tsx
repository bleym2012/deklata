"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    // ── 1. Single auth call ───────────────────────────────────────────────
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      router.push("/login");
      return;
    }

    setEmail(user.email ?? "");

    // ── 2. Profile + points IN PARALLEL — saves ~600-800ms ───────────────
    const [profileResult, pointsResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, name, campus")
        .eq("id", user.id)
        .single(),
      supabase
        .from("user_points")
        .select("total_points")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

    // Points
    if (pointsResult.error) {
      console.error("Points fetch error:", pointsResult.error);
    } else {
      setPoints(pointsResult.data?.total_points ?? 0);
    }

    // Profile
    const profileData = profileResult.data;
    if (profileResult.error) {
      console.error("Profile fetch error:", profileResult.error);
    }

    if (profileData && (!profileData.name || !profileData.campus)) {
      const updates: any = {};
      if (!profileData.name) updates.name = user.email?.split("@")[0];
      if (!profileData.campus) {
        router.push("/onboarding");
        return;
      }

      await supabase.from("profiles").update(updates).eq("id", user.id);
      setProfile({ ...profileData, ...updates });
    } else {
      setProfile(profileData);
    }

    setLoading(false);
  }

  function getTier(pts: number) {
    if (pts >= 500) return "Gold Giver 🥇";
    if (pts >= 250) return "Silver Giver 🥈";
    if (pts >= 50) return "Bronze Giver 🥉";
    return "New Giver 🌱";
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main style={{ maxWidth: 680, margin: "0 auto", padding: "24px 20px" }}>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "var(--ink-100)",
            marginBottom: 24,
            animation: "pulse 1.5s infinite",
          }}
        />
        <div
          style={{
            height: 24,
            width: "55%",
            background: "var(--ink-100)",
            borderRadius: 8,
            marginBottom: 12,
            animation: "pulse 1.5s infinite",
          }}
        />
        <div
          style={{
            height: 16,
            width: "35%",
            background: "var(--ink-100)",
            borderRadius: 8,
            marginBottom: 24,
            animation: "pulse 1.5s infinite",
          }}
        />
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            style={{
              height: 80,
              borderRadius: 14,
              background: "var(--ink-100)",
              marginBottom: 14,
              animation: "pulse 1.5s infinite",
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </main>
    );
  }

  return (
    <main
      style={{
        maxWidth: 680,
        margin: "0 auto",
        padding: "40px 16px 80px",
        fontFamily: "var(--font-body)",
        boxSizing: "border-box",
        width: "100%",
      }}
    >
      <Link
        href="/"
        style={{
          fontSize: 14,
          color: "var(--green-700)",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        ← Back to Home
      </Link>

      <div
        style={{
          marginTop: 24,
          background: "var(--white)",
          borderRadius: 20,
          padding: "24px 20px",
          boxShadow: "var(--shadow-card)",
          border: "1px solid var(--ink-100)",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* HEADER — avatar + name */}
        <div
          style={{
            display: "flex",
            gap: 16,
            marginBottom: 24,
            alignItems: "flex-start",
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "var(--green-800)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {profile?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>

          {/* Name + campus — minWidth:0 is critical so flex child can shrink */}
          <div style={{ minWidth: 0, flex: 1 }}>
            <h1
              style={{
                fontSize: "clamp(18px, 5vw, 26px)",
                margin: 0,
                color: "var(--ink-900)",
                fontFamily: "var(--font-display)",
                wordBreak: "break-word",
                overflowWrap: "break-word",
                lineHeight: 1.2,
              }}
            >
              {profile?.name}
            </h1>
            <p
              style={{
                color: "var(--ink-500)",
                marginTop: 5,
                fontFamily: "var(--font-body)",
                fontSize: 13,
                wordBreak: "break-word",
              }}
            >
              {profile?.campus}
            </p>
          </div>
        </div>

        {/* POINTS BADGE */}
        <div
          style={{
            display: "inline-flex",
            padding: "10px 18px",
            borderRadius: 999,
            background: "var(--green-800)",
            color: "#fff",
            fontWeight: 700,
            marginBottom: 8,
            fontSize: 15,
            fontFamily: "var(--font-display)",
          }}
        >
          ⭐ {points} Points
        </div>
        <p
          style={{
            fontWeight: 700,
            color: "var(--green-700)",
            fontFamily: "var(--font-display)",
            marginBottom: 4,
          }}
        >
          {getTier(points)}
        </p>

        {/* POINTS PROGRESS BAR */}
        {(() => {
          const tiers = [
            { label: "Bronze Giver 🥉", min: 0, max: 50 },
            { label: "Silver Giver 🥈", min: 50, max: 250 },
            { label: "Gold Giver 🥇", min: 250, max: 500 },
          ];
          const current =
            tiers.find((t) => points >= t.min && points < t.max) || tiers[2];
          const next = tiers.find((t) => t.min > (current?.min ?? 0));
          if (!next)
            return (
              <p
                style={{
                  fontSize: 13,
                  color: "var(--green-700)",
                  fontWeight: 600,
                  marginBottom: 20,
                }}
              >
                🏆 Maximum tier reached!
              </p>
            );
          const pct = Math.min(
            100,
            Math.round(
              ((points - current.min) / (next.min - current.min)) * 100,
            ),
          );
          return (
            <div style={{ marginBottom: 20, marginTop: 10 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 11,
                  color: "var(--ink-500)",
                  marginBottom: 6,
                  fontFamily: "var(--font-body)",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <span>{current.label}</span>
                <span>
                  {next.min - points} pts to {next.label}
                </span>
              </div>
              <div
                style={{
                  height: 8,
                  background: "var(--ink-100)",
                  borderRadius: 999,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    background: "var(--green-700)",
                    borderRadius: 999,
                    transition: "width 0.6s ease",
                  }}
                />
              </div>
            </div>
          );
        })()}

        <p
          style={{
            fontSize: 13,
            color: "var(--ink-500)",
            marginBottom: 24,
            fontFamily: "var(--font-body)",
          }}
        >
          Points are earned by successfully giving items to others.
        </p>

        {/* INFO BOX */}
        <div
          style={{
            background: "var(--green-50)",
            padding: "16px 18px",
            borderRadius: 14,
            margin: "0 0 20px",
            border: "1px solid var(--green-100)",
          }}
        >
          <p
            style={{
              color: "var(--ink-700)",
              margin: 0,
              fontSize: 14,
              wordBreak: "break-word",
            }}
          >
            <strong style={{ color: "var(--ink-900)" }}>Email:</strong> {email}
          </p>
          <p style={{ marginTop: 10, color: "var(--ink-700)", fontSize: 14 }}>
            <strong style={{ color: "var(--ink-900)" }}>Campus:</strong>{" "}
            {profile?.campus}
          </p>
        </div>

        {/* GOVERNANCE NOTE */}
        <div
          style={{
            background: "#fef3c7",
            padding: "12px 16px",
            borderRadius: 12,
            fontSize: 13,
            color: "#92400e",
            marginBottom: 20,
            border: "1px solid #fcd34d",
            lineHeight: 1.5,
          }}
        >
          Profile details are locked. Contact support if you want to make a
          correction.
        </div>

        <button onClick={logout} style={logoutBtn}>
          Log out
        </button>
      </div>
    </main>
  );
}

const logoutBtn = {
  width: "100%",
  padding: "14px",
  background: "#dc2626",
  color: "#fff",
  border: "none",
  borderRadius: 14,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "var(--font-display)",
  fontSize: 15,
} as const;
