"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [campus, setCampus] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError || !data.user) {
      setError(signUpError?.message || "Registration failed");
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      name,
      phone,
      campus,
    });

    if (profileError) {
      setError(profileError.message);
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
          maxWidth: 440,
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
          Create your account
        </h1>
        <p style={{ color: "#555", marginBottom: 24 }}>
          Join Deklata to give and receive items safely
        </p>

        <form onSubmit={handleRegister} style={{ display: "grid", gap: 14 }}>
          <input
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={inputStyle}
          />

          <input
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            style={inputStyle}
          />

          <select
            value={campus}
            onChange={(e) => setCampus(e.target.value)}
            required
            style={inputStyle}
          >
            <option value="">Select campus</option>
            <option value="UDS Tamale">UDS Tamale</option>
            <option value="Tamale Technical University">
              Tamale Technical University
            </option>
          </select>

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
            {loading ? "Creating account…" : "Create account"}
          </button>

          {error && (
            <p style={{ color: "#dc2626", fontSize: 14 }}>{error}</p>
          )}
        </form>

        <p
          style={{
            marginTop: 20,
            fontSize: 14,
            color: "#555",
            textAlign: "center",
          }}
        >
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#2563eb", fontWeight: 600 }}>
            Log in
          </Link>
        </p>

        <p
          style={{
            marginTop: 14,
            fontSize: 13,
            color: "#666",
            textAlign: "center",
          }}
        >
          By creating an account, you agree to our{" "}
          <Link href="/terms">Terms of Use</Link> and{" "}
          <Link href="/guidelines">Community Guidelines</Link>.
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
