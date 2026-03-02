"use client";

import { useState, useEffect } from "react";
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
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState(300);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) console.error("Google sign-in error:", error.message);
  };

  useEffect(() => {
    if (!success) return;
    setRedirectCountdown(300);
    const interval = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push("/login");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [success, router]);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!campus) {
      setError("Please select a campus");
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, phone, campus } },
    });

    if (signUpError || !data.user) {
      setError(signUpError?.message || "Registration failed");
      setLoading(false);
      return;
    }
    setLoading(false);
    setSuccess(true);
  }

  async function handleResendConfirmation() {
    if (!email) return;
    setResending(true);
    setResendMessage(null);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) {
      setResendMessage("Failed to resend confirmation email. Try again.");
    } else {
      setResendMessage(
        "Confirmation email resent. Please check your inbox/spam.",
      );
    }
    setResending(false);
  }

  return (
    <main
      style={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        background: "var(--cream)",
      }}
    >
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: 280,
          height: 280,
          borderRadius: "0 100% 0 0",
          background: "linear-gradient(45deg, var(--green-100), transparent)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 440,
          background: "var(--white)",
          padding: "36px 32px",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-modal)",
          border: "1px solid var(--ink-100)",
        }}
      >
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 28,
            fontSize: 13,
            color: "var(--ink-500)",
            fontFamily: "var(--font-body)",
            fontWeight: 500,
          }}
        >
          ← Home
        </Link>

        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, marginBottom: 6 }}>Create your account</h1>
          <p
            style={{
              color: "var(--ink-500)",
              fontSize: 15,
              margin: 0,
              fontFamily: "var(--font-body)",
            }}
          >
            Join Deklata — give and receive items safely
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
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <div style={{ flex: 1, height: 1, background: "var(--ink-100)" }} />
          <span
            style={{
              fontSize: 12,
              color: "var(--ink-300)",
              fontFamily: "var(--font-body)",
            }}
          >
            or
          </span>
          <div style={{ flex: 1, height: 1, background: "var(--ink-100)" }} />
        </div>

        {!success && (
          <form onSubmit={handleRegister} style={{ display: "grid", gap: 12 }}>
            <input
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="form-input"
            />
            <input
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="form-input"
            />
            <select
              value={campus}
              onChange={(e) => setCampus(e.target.value)}
              required
              className="form-input"
            >
              <option value="">Select campus</option>
              <option value="UDS-Tamale">UDS – Tamale</option>
              <option value="UDS-Nyankpala">UDS – Nyankpala</option>
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
              className="form-input"
            />
            <input
              type="password"
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
            />

            <button
              disabled={loading}
              className="btn-primary"
              style={{ marginTop: 6 }}
            >
              {loading ? "Creating account…" : "Create account"}
            </button>

            {error && (
              <p
                style={{
                  fontSize: 13,
                  color: "#dc2626",
                  fontFamily: "var(--font-body)",
                  textAlign: "center",
                }}
              >
                {error}
              </p>
            )}
          </form>
        )}

        {success && (
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
            <p
              style={{
                color: "var(--green-700)",
                fontSize: 15,
                fontWeight: 600,
                fontFamily: "var(--font-display)",
                marginBottom: 8,
              }}
            >
              Account created!
            </p>
            <p
              style={{
                color: "var(--ink-500)",
                fontSize: 14,
                fontFamily: "var(--font-body)",
                marginBottom: 16,
              }}
            >
              Check your email (inbox or spam) to confirm your account before
              logging in.
            </p>
            <button
              type="button"
              onClick={handleResendConfirmation}
              disabled={resending}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--green-700)",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "var(--font-body)",
              }}
            >
              {resending ? "Resending..." : "Resend confirmation email"}
            </button>
            {resendMessage && (
              <p
                style={{
                  marginTop: 8,
                  fontSize: 13,
                  color: resendMessage.includes("Failed")
                    ? "#dc2626"
                    : "#15803d",
                  fontFamily: "var(--font-body)",
                }}
              >
                {resendMessage}
              </p>
            )}
            <p
              style={{
                marginTop: 16,
                fontSize: 13,
                color: "var(--ink-300)",
                fontFamily: "var(--font-body)",
              }}
            >
              Redirecting to login in {redirectCountdown}s…
            </p>
          </div>
        )}

        <p
          style={{
            marginTop: 20,
            fontSize: 14,
            color: "var(--ink-500)",
            textAlign: "center",
            fontFamily: "var(--font-body)",
          }}
        >
          Already have an account?{" "}
          <Link
            href="/login"
            style={{ color: "var(--green-700)", fontWeight: 700 }}
          >
            Log in
          </Link>
        </p>

        <p
          style={{
            marginTop: 12,
            fontSize: 12,
            color: "var(--ink-300)",
            textAlign: "center",
            fontFamily: "var(--font-body)",
          }}
        >
          By signing up you agree to our{" "}
          <Link href="/terms" style={{ color: "var(--ink-500)" }}>
            Terms of Use
          </Link>{" "}
          and{" "}
          <Link href="/guidelines" style={{ color: "var(--ink-500)" }}>
            Community Guidelines
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
