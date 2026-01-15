"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont",
        background: "#f9fafb",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#fff",
          padding: 32,
          borderRadius: 16,
          boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
        }}
      >
        {/* 🔙 BACK */}
        <Link
          href="/"
          style={{
            display: "inline-block",
            marginBottom: 20,
            fontSize: 14,
            color: "#2563eb",
            textDecoration: "none",
          }}
        >
          ← Back to Home
        </Link>

        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            marginBottom: 6,
          }}
        >
          Welcome back
        </h1>
        <p style={{ color: "#555", marginBottom: 24 }}>
          Log in to continue using Deklata
        </p>

        <form onSubmit={handleLogin} style={{ display: "grid", gap: 14 }}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />

<div
  style={{
    textAlign: "right",
    marginBottom: 16,
  }}
>
  <Link
    href="/forgot-password"
    style={{
      fontSize: 14,
      color: "#2563eb",
      textDecoration: "none",
    }}
  >
    Forgot password?
  </Link>
</div>





          <button
            disabled={loading}
            style={{
              marginTop: 10,
              padding: "12px",
              borderRadius: 12,
              border: "none",
              background: "#2563eb",
              color: "#fff",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Logging in…" : "Log in"}
          </button>

          {error && (
            <p style={{ color: "#dc2626", fontSize: 14 }}>{error}</p>
          )}
        </form>

        <p style={{ marginTop: 20, fontSize: 14, color: "#555" }}>
          Don’t have an account?{" "}
          <Link
            href="/register"
            style={{ color: "#2563eb", fontWeight: 600 }}
          >
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #d1d5db",
  fontSize: 15,
  outline: "none",
};
