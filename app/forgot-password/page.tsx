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
      setMessage(
        "If this email exists, a password reset link has been sent."
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
        background: "#f9fafb",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          background: "#fff",
          borderRadius: 18,
          padding: "28px 24px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
        }}
      >
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          Forgot your password?
        </h1>

        <p
          style={{
            fontSize: 14,
            color: "#555",
            textAlign: "center",
            marginBottom: 22,
          }}
        >
          Enter your email and we’ll send you a reset link.
        </p>

        <form onSubmit={handleReset}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid #d1d5db",
              marginBottom: 14,
              fontSize: 14,
            }}
          />

          <button
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 12,
              border: "none",
              background: "#2563eb",
              color: "#fff",
              fontWeight: 600,
              fontSize: 15,
              cursor: "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </form>

        {error && (
          <p style={{ color: "#dc2626", marginTop: 14, fontSize: 14 }}>
            {error}
          </p>
        )}

        {message && (
          <p style={{ color: "#15803d", marginTop: 14, fontSize: 14 }}>
            {message}
          </p>
        )}

        <p
          style={{
            marginTop: 20,
            fontSize: 14,
            textAlign: "center",
          }}
        >
          <Link href="/login" style={{ color: "#2563eb" }}>
            Back to login
          </Link>
        </p>
      </div>
    </main>
  );
}
