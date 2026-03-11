"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // Point to the auth confirm route which safely exchanges the token
      // and redirects to reset-password — avoids the auto-login race condition
      redirectTo: `${window.location.origin}/auth/confirm`,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage(
        "If this email exists, a password reset link has been sent. Check your inbox.",
      );
    }

    setLoading(false);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background: "var(--background)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          background: "var(--card-bg)",
          borderRadius: 18,
          padding: "28px 24px",
          boxShadow: "var(--shadow-modal)",
          border: "1px solid var(--card-border)",
        }}
      >
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
              fontFamily: "var(--font-body)",
            }}
          >
            {error}
          </p>
        )}
        {message && (
          <p
            style={{
              color: "#15803d",
              marginTop: 14,
              fontSize: 14,
              fontFamily: "var(--font-body)",
            }}
          >
            {message}
          </p>
        )}

        <p
          style={{
            marginTop: 20,
            fontSize: 14,
            textAlign: "center",
            fontFamily: "var(--font-body)",
          }}
        >
          <Link href="/login" style={{ color: "var(--green-800)" }}>
            Back to login
          </Link>
        </p>
      </div>
    </main>
  );
}
