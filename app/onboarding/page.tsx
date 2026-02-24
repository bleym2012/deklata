"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

const CAMPUSES = [
  { value: "UDS-Tamale", label: "UDS – Tamale" },
  { value: "UDS-Nyankpala", label: "UDS – Nyankpala" },
  { value: "Tamale Technical University", label: "Tamale Technical University" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [campus, setCampus] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [userName, setUserName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      // Get their name for a friendly greeting
      const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "there";
      setUserName(name.split(" ")[0]); // First name only

      // Check if they already have a campus set
      const { data: profile } = await supabase
        .from("profiles")
        .select("campus")
        .eq("id", user.id)
        .single();

      const hasCampus = profile?.campus && profile.campus !== "Not specified" && profile.campus.trim() !== "";
      if (hasCampus) {
        // Already has campus — send to home
        router.push("/");
        return;
      }

      setChecking(false);
    }
    checkUser();
  }, [router]);

  async function handleSave() {
    if (!campus) { setError("Please select your campus to continue."); return; }
    if (!phone.trim()) { setError("Please enter your phone number so owners can contact you."); return; }
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ campus, phone: phone.trim() })
      .eq("id", user.id);

    if (updateError) {
      setError("Could not save your details. Please try again.");
      setLoading(false);
      return;
    }

    router.push("/");
  }

  if (checking) {
    return (
      <main style={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--cream)",
      }}>
        <div style={{ textAlign: "center" }}>
          <div className="skeleton" style={{ width: 48, height: 48, borderRadius: "50%", margin: "0 auto 16px" }} />
          <p style={{ color: "var(--ink-400)", fontFamily: "var(--font-body)" }}>Just a moment…</p>
        </div>
      </main>
    );
  }

  return (
    <main style={{
      minHeight: "calc(100vh - 64px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      background: "var(--cream)",
    }}>
      {/* Decorative accent */}
      <div style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: 320,
        height: 320,
        borderRadius: "0 0 0 100%",
        background: "linear-gradient(135deg, var(--green-100), transparent)",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      <div style={{
        position: "relative",
        zIndex: 1,
        width: "100%",
        maxWidth: 420,
        background: "var(--white)",
        padding: "40px 32px",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-modal)",
        border: "1px solid var(--ink-100)",
        textAlign: "center",
      }}>

        {/* Icon */}
        <div style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "var(--green-100)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
          fontSize: 28,
        }}>
          🎓
        </div>

        {/* Heading */}
        <h1 style={{ fontSize: 26, marginBottom: 10 }}>
          Welcome, {userName}!
        </h1>
        <p style={{
          color: "var(--ink-500)",
          fontSize: 15,
          marginBottom: 32,
          fontFamily: "var(--font-body)",
          lineHeight: 1.6,
        }}>
          One last thing — which campus are you on? This helps you see items available near you.
        </p>

        {/* Campus selector */}
        <div style={{ display: "grid", gap: 12, marginBottom: 24 }}>
          {CAMPUSES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCampus(c.value)}
              style={{
                width: "100%",
                padding: "14px 20px",
                borderRadius: "var(--radius-md)",
                border: campus === c.value
                  ? "2px solid var(--green-700)"
                  : "1.5px solid var(--ink-100)",
                background: campus === c.value
                  ? "var(--green-50)"
                  : "var(--white)",
                color: campus === c.value
                  ? "var(--green-800)"
                  : "var(--ink-700)",
                fontFamily: "var(--font-body)",
                fontSize: 15,
                fontWeight: campus === c.value ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.15s ease",
                display: "flex",
                alignItems: "center",
                gap: 10,
                textAlign: "left",
              }}
            >
              <span style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                border: campus === c.value
                  ? "6px solid var(--green-700)"
                  : "2px solid var(--ink-200)",
                flexShrink: 0,
                transition: "all 0.15s ease",
              }} />
              {c.label}
            </button>
          ))}
        </div>

        {/* Phone input */}
        <div style={{ marginBottom: 16, textAlign: "left" }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--ink-700)", fontFamily: "var(--font-display)", marginBottom: 6 }}>
            Phone number
          </label>
          <input
            type="tel"
            placeholder="e.g. 0244123456"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="form-input"
          />
          <p style={{ fontSize: 12, color: "var(--ink-400)", marginTop: 6, fontFamily: "var(--font-body)" }}>
            Only shared with owners when your request is approved.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            marginBottom: 16,
            padding: "12px 14px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "var(--radius-md)",
          }}>
            <p style={{ fontSize: 14, color: "#dc2626", margin: 0, fontFamily: "var(--font-body)" }}>
              {error}
            </p>
          </div>
        )}

        {/* Continue button */}
        <button
          onClick={handleSave}
          disabled={loading || !campus}
          className="btn-primary"
          style={{ width: "100%", opacity: !campus ? 0.5 : 1 }}
        >
          {loading ? "Saving…" : "Continue to Deklata →"}
        </button>

        <p style={{
          marginTop: 16,
          fontSize: 13,
          color: "var(--ink-400)",
          fontFamily: "var(--font-body)",
        }}>
          You can update this later in your profile.
        </p>
      </div>
    </main>
  );
}
