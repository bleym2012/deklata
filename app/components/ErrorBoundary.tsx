"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  isAuthError: boolean;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, isAuthError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    const isAuthError =
      error?.message?.includes("JWT") ||
      error?.message?.includes("session") ||
      error?.message?.includes("auth") ||
      error?.message?.includes("token") ||
      error?.message?.includes("Session") ||
      error?.message?.includes("Auth");
    return { hasError: true, isAuthError };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Deklata ErrorBoundary caught:", error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false, isAuthError: false });
    window.location.href = "/";
  };

  handleLogin = () => {
    window.location.href = "/login";
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          background: "var(--background, #faf9f6)",
          fontFamily: "var(--font-body, sans-serif)",
        }}
      >
        <div
          style={{
            maxWidth: 420,
            width: "100%",
            background: "var(--white, #fff)",
            borderRadius: 20,
            padding: "40px 32px",
            boxShadow: "0 4px 32px rgba(15,61,34,0.10)",
            border: "1px solid var(--ink-100, #e8e4dc)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>
            {this.state.isAuthError ? "🔐" : "⚠️"}
          </div>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 800,
              fontFamily: "var(--font-display, sans-serif)",
              color: "var(--ink-900, #1a1208)",
              marginBottom: 10,
            }}
          >
            {this.state.isAuthError
              ? "Your session expired"
              : "Something went wrong"}
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "var(--ink-500, #6b6355)",
              marginBottom: 28,
              lineHeight: 1.6,
            }}
          >
            {this.state.isAuthError
              ? "You've been away for a while. Please log in again to continue."
              : "An unexpected error occurred. This has been noted. Try refreshing the page."}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {this.state.isAuthError ? (
              <>
                <button
                  onClick={this.handleLogin}
                  style={{
                    padding: "13px",
                    background: "var(--green-800, #1a5c3a)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 12,
                    fontFamily: "var(--font-display, sans-serif)",
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: "pointer",
                  }}
                >
                  Log in again
                </button>
                <button
                  onClick={this.handleReload}
                  style={{
                    padding: "13px",
                    background: "transparent",
                    color: "var(--ink-500, #6b6355)",
                    border: "1.5px solid var(--ink-100, #e8e4dc)",
                    borderRadius: 12,
                    fontFamily: "var(--font-body, sans-serif)",
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  Go to homepage
                </button>
              </>
            ) : (
              <button
                onClick={this.handleReload}
                style={{
                  padding: "13px",
                  background: "var(--green-800, #1a5c3a)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  fontFamily: "var(--font-display, sans-serif)",
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: "pointer",
                }}
              >
                Back to homepage
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
}
