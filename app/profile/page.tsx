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
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setEmail(user.email ?? "");

    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, name, campus")
      .eq("id", user.id)
      .single();

    const { data: pointsData } = await supabase
      .from("user_points")
      .select("points_total")
      .eq("user_id", user.id)
      .single();

    setProfile(profileData);
    setPoints(pointsData?.points_total ?? 0);
    setLoading(false);
  }

  function getTier(points: number) {
    if (points >= 500) return "Gold Giver 🥇";
    if (points >= 200) return "Silver Giver 🥈";
    if (points >= 50) return "Bronze Giver 🥉";
    return "New Giver 🌱";
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <main style={{ padding: 40, textAlign: "center", color: "#666" }}>
        Loading profile…
      </main>
    );
  }

  return (
    <main
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "40px 20px",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont",
      }}
    >
      <Link href="/" style={{ fontSize: 14, color: "#2563eb" }}>
        ← Back to Home
      </Link>

      <div
        style={{
          marginTop: 24,
          background: "#fff",
          borderRadius: 20,
          padding: 32,
          boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
        }}
      >
        {/* HEADER */}
        <div style={{ display: "flex", gap: 20, marginBottom: 24 }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "#111",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            {profile?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <div>
            <h1 style={{ fontSize: 26, margin: 0 }}>
              {profile?.name}
            </h1>
            <p style={{ color: "#666", marginTop: 4 }}>
              {profile?.campus}
            </p>
          </div>
        </div>

        {/* POINTS */}
        <div style={badgeStyle}>⭐ {points} Points</div>
        <p style={{ fontWeight: 600, color: "#16a34a" }}>
          {getTier(points)}
        </p>
        <p style={{ fontSize: 13, color: "#666", marginBottom: 24 }}>
          Points are earned by successfully giving items to others.
        </p>

        {/* INFO */}
        <div style={infoBox}>
          <p>
            <strong>Email:</strong> {email}
          </p>
          <p style={{ marginTop: 8 }}>
            <strong>Campus:</strong> {profile?.campus}
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
          }}
        >
          Profile details are locked for security reasons.
          Contact support if a correction is required.
        </div>

        <button onClick={logout} style={logoutBtn}>
          Log out
        </button>
      </div>
    </main>
  );
}

/* STYLES */
const badgeStyle = {
  display: "inline-flex",
  padding: "12px 18px",
  borderRadius: 999,
  background: "#111",
  color: "#fff",
  fontWeight: 600,
  marginBottom: 8,
};

const infoBox = {
  background: "#f9fafb",
  padding: 20,
  borderRadius: 14,
  margin: "24px 0",
};

const logoutBtn = {
  width: "100%",
  padding: "14px",
  background: "#dc2626",
  color: "#fff",
  border: "none",
  borderRadius: 14,
  fontWeight: 600,
  cursor: "pointer",
};
