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
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/onboarding` },
    });
    if (error) console.error("Google sign-in error:", error.message);
  };

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNeedsVerification(false);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        setError("Please verify your email address before logging in.");
        setNeedsVerification(true);
      } else if (error.message.toLowerCase().includes("invalid login")) {
        setError("Invalid email or password.");
      } else {
        setError("Login failed. Please try again.");
      }
      setLoading(false);
      return;
    }
    router.push("/");
  }

  async function resendVerificationEmail() {
    if (!email) return;
    setResendLoading(true);
    setResendMessage(null);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) {
      setResendMessage("Could not resend verification email. Please try again later.");
    } else {
      setResendMessage("Verification email resent. Check your inbox or spam folder.");
    }
    setResendLoading(false);
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
      {/* DECORATIVE ACCENT */}
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
        padding: "36px 32px",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-modal)",
        border: "1px solid var(--ink-100)",
      }}>
        {/* BACK */}
        <Link href="/" style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 28,
          fontSize: 13,
          color: "var(--ink-500)",
          fontFamily: "var(--font-body)",
          fontWeight: 500,
        }}>
          ← Home
        </Link>

        {/* HEADER */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, marginBottom: 6 }}>Welcome back</h1>
          <p style={{ color: "var(--ink-500)", fontSize: 15, margin: 0 }}>
            Log in to continue on Deklata
          </p>
        </div>

        {/* GOOGLE */}
        <button
          onClick={signInWithGoogle}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            border: "1.5px solid var(--ink-100)",
            background: "var(--white)",
            color: "var(--ink-900)",
            fontFamily: "var(--font-body)",
            fontSize: 15,
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            marginBottom: 20,
            transition: "background 0.15s ease",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* DIVIDER */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: "var(--ink-100)" }} />
          <span style={{ fontSize: 12, color: "var(--ink-300)", fontFamily: "var(--font-body)" }}>or</span>
          <div style={{ flex: 1, height: 1, background: "var(--ink-100)" }} />
        </div>

        {/* ERROR */}
        {error && !needsVerification && (
          <div style={{
            marginBottom: 16,
            padding: "12px 14px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "var(--radius-md)",
          }}>
            <p style={{ fontSize: 14, color: "#dc2626", fontWeight: 500, margin: 0, fontFamily: "var(--font-body)" }}>
              {error}
            </p>
          </div>
        )}

        {needsVerification && (
          <div style={{
            marginBottom: 16,
            padding: "12px 14px",
            background: "#fff7ed",
            border: "1px solid #fed7aa",
            borderRadius: "var(--radius-md)",
          }}>
            <p style={{ fontSize: 14, color: "#9a3412", marginBottom: 8, fontWeight: 500, fontFamily: "var(--font-body)" }}>
              Please verify your email before logging in.
            </p>
            <button
              type="button"
              onClick={resendVerificationEmail}
              disabled={resendLoading}
              style={{
                background: "transparent",
                color: resendLoading ? "#9ca3af" : "#ea580c",
                border: "none",
                padding: 0,
                cursor: resendLoading ? "default" : "pointer",
                fontWeight: 600,
                fontSize: 14,
                fontFamily: "var(--font-body)",
              }}
            >
              {resendLoading ? "Sending…" : "Resend verification email"}
            </button>
            {resendMessage && (
              <p style={{ marginTop: 8, fontSize: 13, color: resendMessage.startsWith("Verification") ? "#15803d" : "#dc2626", fontFamily: "var(--font-body)" }}>
                {resendMessage}
              </p>
            )}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleLogin} style={{ display: "grid", gap: 12 }}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-input"
          />

          <div style={{ textAlign: "right" }}>
            <Link href="/forgot-password" style={{
              fontSize: 13,
              color: "var(--green-700)",
              fontFamily: "var(--font-body)",
              fontWeight: 500,
            }}>
              Forgot password?
            </Link>
          </div>

          <button
            disabled={loading}
            className="btn-primary"
            style={{ marginTop: 4 }}
          >
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p style={{ marginTop: 20, fontSize: 14, color: "var(--ink-500)", textAlign: "center", fontFamily: "var(--font-body)" }}>
          Don't have an account?{" "}
          <Link href="/register" style={{ color: "var(--green-700)", fontWeight: 700 }}>
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
