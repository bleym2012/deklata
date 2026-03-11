// app/reset-password/page.tsx
//
// The user arrives here ONLY after /auth/callback has:
//   1. Verified the PKCE code is genuine
//   2. Confirmed it is a recovery token (not a regular login)
//   3. Set a short-lived httpOnly cookie with the recovery access_token
//
// This page reads that cookie via a small API route, uses the token to
// call updateUser(), then clears the cookie and signs the user out so
// they must log in fresh with their new password.
//
// The Supabase JS client on this page operates with the recovery token
// only — not a full persistent session. The user is never "logged in".

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false); // cookie verified
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Verify the recovery cookie exists via our API route.
    // If it doesn't, the user got here without a valid reset link.
    fetch("/api/auth/verify-recovery")
      .then((r) => {
        if (r.ok) {
          setReady(true);
        } else {
          router.replace("/forgot-password?error=invalid-or-expired");
        }
      })
      .catch(() => router.replace("/forgot-password?error=invalid-or-expired"));
  }, [router]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    setError(null);

    // Call our API route which uses the recovery token from the httpOnly
    // cookie to update the password — the client never touches the token.
    const res = await fetch("/api/auth/update-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to update password. Please try again.");
      setLoading(false);
      return;
    }

    setDone(true);
    setTimeout(() => router.replace("/login"), 2500);
  }

  if (!ready && !done) {
    return (
      <main style={styles.page}>
        <div style={styles.card}>
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔐</div>
            <p
              style={{
                color: "var(--ink-500)",
                fontSize: 14,
                fontFamily: "var(--font-body)",
              }}
            >
              Verifying your reset link…
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (done) {
    return (
      <main style={styles.page}>
        <div style={styles.card}>
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                marginBottom: 8,
                color: "var(--ink-900)",
                fontFamily: "var(--font-display)",
              }}
            >
              Password updated!
            </h2>
            <p
              style={{
                color: "var(--ink-500)",
                fontSize: 14,
                fontFamily: "var(--font-body)",
              }}
            >
              Redirecting you to login…
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.card}>
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
          Set new password
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "var(--ink-500)",
            textAlign: "center",
            marginBottom: 24,
            fontFamily: "var(--font-body)",
          }}
        >
          Choose a strong password you'll remember.
        </p>

        <form onSubmit={handleUpdate} style={{ display: "grid", gap: 12 }}>
          <input
            type="password"
            placeholder="New password (min. 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="form-input"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="form-input"
          />
          <button
            disabled={loading}
            className="btn-primary"
            style={{ marginTop: 4, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Updating…" : "Update password"}
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
      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    background: "var(--background)",
  } as React.CSSProperties,
  card: {
    width: "100%",
    maxWidth: 380,
    background: "var(--card-bg)",
    borderRadius: 18,
    padding: "28px 24px",
    boxShadow: "var(--shadow-modal)",
    border: "1px solid var(--card-border)",
  } as React.CSSProperties,
};
