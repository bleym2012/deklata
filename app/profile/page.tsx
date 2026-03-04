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
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      router.push("/login");
      return;
    }
    setAuthChecking(false);
    loadProfile();
  }

  async function loadProfile() {
    setLoading(true);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      router.push("/login");
      return;
    }

    setEmail(user.email ?? "");

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, name, campus")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
    }

    if (profileData && (!profileData.name || !profileData.campus)) {
      const updates: any = {};

      if (!profileData.name) {
        updates.name = user.email?.split("@")[0];
      }

      if (!profileData.campus) {
        router.push("/onboarding");
        return;
      }
      if (false) {
        updates.campus = "Not specified";
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (updateError) {
        console.error("Profile auto-fix error:", updateError);
      }

      setProfile({ ...profileData, ...updates });
    } else {
      setProfile(profileData);
    }

    const { data: pointsRow, error: pointsError } = await supabase
      .from("user_points")
      .select("total_points")
      .eq("user_id", user.id)
      .maybeSingle();

    if (pointsError) {
      console.error("Points fetch error:", pointsError);
      setPoints(0);
    } else {
      setPoints(pointsRow?.total_points ?? 0);
    }

    setLoading(false);
  }

  function getTier(points: number) {
    if (points >= 500) return "Gold Giver 🥇";
    if (points >= 250) return "Silver Giver 🥈";
    if (points >= 50) return "Bronze Giver 🥉";
    return "New Giver 🌱";
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (authChecking) return null;

  if (loading) {
    return (
      <main style={{ maxWidth: 800, margin: "0 auto", padding: "24px 16px" }}>
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "var(--ink-100)",
            marginBottom: 24,
            animation: "pulse 1.5s infinite",
          }}
        />
        <div
          style={{
            height: 24,
            width: "60%",
            background: "var(--ink-100)",
            borderRadius: 8,
            marginBottom: 12,
            animation: "pulse 1.5s infinite",
          }}
        />
        <div
          style={{
            height: 18,
            width: "40%",
            background: "var(--ink-100)",
            borderRadius: 8,
            marginBottom: 24,
            animation: "pulse 1.5s infinite",
          }}
        />
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            style={{
              height: 100,
              borderRadius: 16,
              background: "var(--ink-100)",
              marginBottom: 16,
              animation: "pulse 1.5s infinite",
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
        padding: "40px 20px 80px",
        fontFamily: "var(--font-body)",
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
          padding: 32,
          boxShadow: "var(--shadow-card)",
          border: "1px solid var(--ink-100)",
        }}
      >
        {/* HEADER */}
        <div style={{ display: "flex", gap: 20, marginBottom: 24 }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "var(--green-800)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {profile?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <div>
            <h1
              style={{
                fontSize: 26,
                margin: 0,
                color: "var(--ink-900)",
                fontFamily: "var(--font-display)",
              }}
            >
              {profile?.name}
            </h1>
            <p
              style={{
                color: "var(--ink-500)",
                marginTop: 4,
                fontFamily: "var(--font-body)",
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
            <div style={{ marginBottom: 20, marginTop: 8 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 12,
                  color: "var(--ink-500)",
                  marginBottom: 6,
                  fontFamily: "var(--font-body)",
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
            padding: 20,
            borderRadius: 14,
            margin: "24px 0",
            border: "1px solid var(--green-100)",
          }}
        >
          <p style={{ color: "var(--ink-700)", margin: 0 }}>
            <strong style={{ color: "var(--ink-900)" }}>Email:</strong> {email}
          </p>
          <p style={{ marginTop: 8, color: "var(--ink-700)" }}>
            <strong style={{ color: "var(--ink-900)" }}>Campus:</strong>{" "}
            {profile?.campus}
          </p>
        </div>

        {/* GOVERNANCE NOTE */}
        <div
          style={{
            background: "#fef3c7",
            padding: 14,
            borderRadius: 12,
            fontSize: 13,
            color: "#92400e",
            marginBottom: 20,
            border: "1px solid #fcd34d",
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
