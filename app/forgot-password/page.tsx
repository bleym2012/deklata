"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // No redirectTo — the email template hardcodes the correct URL.
    // This bypasses Supabase allowlist validation entirely.
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <main style={pageStyle}>
      <div style={cardStyle}>
        {sent ? (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📬</div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "var(--ink-900)",
                fontFamily: "var(--font-display)",
                marginBottom: 8,
              }}
            >
              Check your email
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "var(--ink-500)",
                fontFamily: "var(--font-body)",
                lineHeight: 1.6,
              }}
            >
              If that email is registered, a reset link has been sent. Check
              your inbox and spam folder.
            </p>
            <Link
              href="/login"
              style={{
                display: "inline-block",
                marginTop: 20,
                fontSize: 14,
                color: "var(--green-700)",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                marginBottom: 8,
                textAlign: "center",
                color: "var(--ink-900)",
                fontFamily: "var(--font-display)",
              }}
            >
              Forgot your password?
            </h1>
            <p
              style={{
                fontSize: 14,
                color: "var(--ink-500)",
                textAlign: "center",
                marginBottom: 22,
                fontFamily: "var(--font-body)",
              }}
            >
              Enter your email and we'll send you a reset link.
            </p>

            <form onSubmit={handleReset} style={{ display: "grid", gap: 12 }}>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
              />
              <button
                disabled={loading}
                className="btn-primary"
                style={{ opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>

            {error && (
              <p
                style={{
                  color: "#dc2626",
                  marginTop: 14,
                  fontSize: 14,
                  textAlign: "center",
                  fontFamily: "var(--font-body)",
                }}
              >
                {error}
              </p>
            )}

            <p style={{ marginTop: 20, fontSize: 14, textAlign: "center" }}>
              <Link
                href="/login"
                style={{
                  color: "var(--green-700)",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Back to login
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
  background: "var(--background)",
};
const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 380,
  background: "var(--card-bg)",
  borderRadius: 18,
  padding: "28px 24px",
  boxShadow: "var(--shadow-modal)",
  border: "1px solid var(--card-border)",
};
