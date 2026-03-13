"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Supabase sends the reset link to /reset-password with the token in the URL.
    // The JS client picks it up via detectSessionInUrl and fires one of:
    //   PASSWORD_RECOVERY → user clicked a reset link → show the form ✅
    //   SIGNED_IN         → something else → reject, don't show form ✅
    //   INITIAL_SESSION   → no token in URL, user navigated here directly → reject ✅
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      } else if (event === "SIGNED_IN") {
        // Recovery token auto-logged them in but we don't want that.
        // Sign out silently — the SIGNED_OUT listener won't redirect
        // because /reset-password is in the pathname guard.
        supabase.auth.signOut();
      }
    });

    // If no PASSWORD_RECOVERY fires within 5 seconds the user
    // navigated here directly — send them to forgot-password.
    const timeout = setTimeout(() => {
      router.replace("/forgot-password");
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
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

    // supabase.auth.updateUser uses the active PASSWORD_RECOVERY session.
    // This is the official Supabase way to update password from a reset link.
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Sign out after update so user logs in fresh with new password.
    await supabase.auth.signOut();
    setDone(true);
    setTimeout(() => router.replace("/login"), 2500);
  }

  if (!ready && !done) {
    return (
      <main style={pageStyle}>
        <div style={cardStyle}>
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
      <main style={pageStyle}>
        <div style={cardStyle}>
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
    <main style={pageStyle}>
      <div style={cardStyle}>
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
