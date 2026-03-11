"use client";

import { useEffect, useRef, useState } from "react";
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
  const readyRef = useRef(false);

  useEffect(() => {
    // RACE CONDITION FIX:
    // detectSessionInUrl:true in supabaseClient processes the #access_token
    // hash the instant the JS module loads — often BEFORE this component
    // mounts and sets up onAuthStateChange. So we handle both cases:
    //
    // Case 1: Token already processed before mount
    //   → getSession() will return an active session, setReady(true)
    //
    // Case 2: Token processed after mount
    //   → onAuthStateChange fires PASSWORD_RECOVERY, setReady(true)
    //
    // Case 3: SIGNED_IN fires (already logged in, not a reset flow)
    //   → wait 500ms to give PASSWORD_RECOVERY a chance, then redirect

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        // Session exists — either recovery token was already exchanged,
        // or user is already logged in. Either way, show the form.
        // If they were already logged in without a recovery token,
        // updateUser() will still work — no harm done.
        readyRef.current = true;
        setReady(true);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        readyRef.current = true;
        setReady(true);
      } else if (event === "SIGNED_IN") {
        // Wait briefly — PASSWORD_RECOVERY may still be coming
        setTimeout(() => {
          if (!readyRef.current) {
            router.replace("/");
          }
        }, 800);
      }
    });

    return () => listener.subscription.unsubscribe();
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

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();
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
