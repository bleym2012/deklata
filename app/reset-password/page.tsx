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
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function markReady() {
    if (readyRef.current) return;
    readyRef.current = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setReady(true);
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token_hash = params.get("token_hash");
    const type = params.get("type");

    if (token_hash && type === "recovery") {
      supabase.auth
        .verifyOtp({ token_hash, type: "recovery" })
        .then(({ error }) => {
          if (error) {
            router.replace("/forgot-password?error=expired");
          } else {
            markReady();
          }
        });
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "PASSWORD_RECOVERY") && session) {
        markReady();
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) markReady();
    });

    timeoutRef.current = setTimeout(() => {
      router.replace("/forgot-password");
    }, 10000);

    return () => {
      subscription.unsubscribe();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
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

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Show success immediately — don't await signOut, run it in background.
    // This makes the UI feel instant instead of hanging for a second network call.
    setDone(true);
    supabase.auth.signOut(); // fire and forget
    setTimeout(() => router.replace("/login"), 2000);
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
            <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
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
            {/* Progress bar so user sees something happening */}
            <div
              style={{
                marginTop: 20,
                height: 4,
                background: "var(--ink-100)",
                borderRadius: 999,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  background: "var(--green-700)",
                  borderRadius: 999,
                  animation: "progressBar 2s linear forwards",
                }}
              />
            </div>
            <style>{`
              @keyframes progressBar {
                from { width: 0% }
                to   { width: 100% }
              }
            `}</style>
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
            style={{
              marginTop: 4,
              opacity: loading ? 0.7 : 1,
              transition: "opacity 0.2s",
            }}
          >
            {loading ? (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    width: 14,
                    height: 14,
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                    display: "inline-block",
                  }}
                />
                Updating…
              </span>
            ) : (
              "Update password"
            )}
          </button>
        </form>

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg) }
          }
        `}</style>

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
