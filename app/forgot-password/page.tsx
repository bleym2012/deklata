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
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("If this email exists, a password reset link has been sent.");
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
        fontFamily: "var(--font-body)",
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
            }}
          >
            {error}
          </p>
        )}
        {message && (
          <p
            style={{
              color: "var(--green-700)",
              marginTop: 14,
              fontSize: 14,
              textAlign: "center",
              fontWeight: 600,
            }}
          >
            {message}
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
      </div>
    </main>
  );
}
