"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Footer() {
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // getSession() reads from localStorage — zero network call, instant
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setAuthChecked(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setAuthChecked(true);
      },
    );
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <footer
      style={{
        borderTop: "1px solid var(--ink-100)",
        marginTop: 80,
        background: "var(--green-900)",
      }}
    >
      <div
        style={{
          maxWidth: 1140,
          margin: "0 auto",
          padding: "48px 24px 32px",
          display: "grid",
          gap: 40,
          fontFamily: "var(--font-body)",
        }}
      >
        {/* TOP */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 40,
            justifyContent: "space-between",
          }}
        >
          {/* BRAND */}
          <div style={{ maxWidth: 280 }}>
            <h3
              style={{
                fontSize: 22,
                fontWeight: 800,
                marginBottom: 10,
                color: "#ffffff",
                fontFamily: "var(--font-display)",
                letterSpacing: "-0.03em",
              }}
            >
              Deklata
            </h3>
            <p
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.75)",
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              Connecting tertiary students in Tamale who have extra items with
              those who need them — safely, simply, and for free.
            </p>

            {/* SOCIAL */}
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              {[
                {
                  href: "https://instagram.com/yourhandle",
                  icon: <InstagramIcon />,
                },
                {
                  href: "https://twitter.com/deklatapp",
                  icon: <TwitterIcon />,
                },
                {
                  href: "https://facebook.com/deklata",
                  icon: <FacebookIcon />,
                },
                {
                  href: "https://tiktok.com/@deklata",
                  icon: <TikTokIcon />,
                },
                {
                  href: "https://wa.me/233202162972",
                  icon: <WhatsAppIcon />,
                },
              ].map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.85)",
                    transition: "all 0.2s ease",
                    textDecoration: "none",
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* LINKS */}
          <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
            <div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  marginBottom: 12,
                  color: "rgba(255,255,255,0.55)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Explore
              </p>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "grid",
                  gap: 10,
                }}
              >
                {[
                  { href: "/", label: "Browse items" },
                  { href: "/how-it-works", label: "How it works" },
                  { href: "/add-item", label: "Give an item" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      style={{
                        fontSize: 14,
                        color: "rgba(255,255,255,0.8)",
                        textDecoration: "none",
                      }}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  marginBottom: 12,
                  color: "rgba(255,255,255,0.55)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Account
              </p>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "grid",
                  gap: 10,
                }}
              >
                {!authChecked ? null : (
                  <>
                    {!user && (
                      <>
                        <li>
                          <Link
                            href="/login"
                            style={{
                              fontSize: 14,
                              color: "rgba(255,255,255,0.8)",
                              textDecoration: "none",
                            }}
                          >
                            Login
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/register"
                            style={{
                              fontSize: 14,
                              color: "rgba(255,255,255,0.8)",
                              textDecoration: "none",
                            }}
                          >
                            Sign up
                          </Link>
                        </li>
                      </>
                    )}
                    {user && (
                      <>
                        <li>
                          <Link
                            href="/dashboard"
                            style={{
                              fontSize: 14,
                              color: "rgba(255,255,255,0.8)",
                              textDecoration: "none",
                            }}
                          >
                            Dashboard
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/my-requests"
                            style={{
                              fontSize: 14,
                              color: "rgba(255,255,255,0.8)",
                              textDecoration: "none",
                            }}
                          >
                            My requests
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/profile"
                            style={{
                              fontSize: 14,
                              color: "rgba(255,255,255,0.8)",
                              textDecoration: "none",
                            }}
                          >
                            Profile
                          </Link>
                        </li>
                      </>
                    )}
                  </>
                )}
              </ul>
            </div>

            <div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  marginBottom: 12,
                  color: "rgba(255,255,255,0.55)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Legal
              </p>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "grid",
                  gap: 10,
                }}
              >
                <li>
                  <Link
                    href="/terms"
                    style={{
                      fontSize: 14,
                      color: "rgba(255,255,255,0.8)",
                      textDecoration: "none",
                    }}
                  >
                    Terms of Use
                  </Link>
                </li>
                <li>
                  <Link
                    href="/guidelines"
                    style={{
                      fontSize: 14,
                      color: "rgba(255,255,255,0.8)",
                      textDecoration: "none",
                    }}
                  >
                    Community Guidelines
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    style={{
                      fontSize: 14,
                      color: "rgba(255,255,255,0.8)",
                      textDecoration: "none",
                    }}
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: 20,
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            justifyContent: "space-between",
            fontSize: 12,
            color: "rgba(255,255,255,0.85)",
          }}
        >
          <span style={{ color: "rgba(255,255,255,0.85)" }}>
            © {new Date().getFullYear()} Deklata. All rights reserved.
          </span>
          <span style={{ color: "rgba(255,255,255,0.85)" }}>
            Made with ❤️ for Ghanaian students
          </span>
        </div>
      </div>
    </footer>
  );
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
      <path d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7zm5 5a5 5 0 110 10 5 5 0 010-10zm6.5-.75a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
      <path d="M22 5.9c-.7.3-1.5.6-2.3.7a4 4 0 001.8-2.2c-.8.5-1.7.9-2.6 1.1A4 4 0 0012 8.8a11.3 11.3 0 01-8.2-4.2 4 4 0 001.2 5.3c-.6 0-1.2-.2-1.7-.4v.1a4 4 0 003.2 3.9c-.4.1-.9.2-1.3.1a4 4 0 003.7 2.8A8.1 8.1 0 012 18.6 11.4 11.4 0 008.2 20c7.4 0 11.5-6.1 11.5-11.5v-.5A8 8 0 0022 5.9z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
      <path d="M22 12a10 10 0 10-11.6 9.9v-7H8v-3h2.4V9.4c0-2.4 1.4-3.7 3.6-3.7 1 0 2 .2 2 .2v2.3h-1.2c-1.2 0-1.6.8-1.6 1.6V12H16l-.4 3h-2.3v7A10 10 0 0022 12z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2h3a4 4 0 004 4v3a7 7 0 01-4-1.3V14a6 6 0 11-6-6h1v3h-1a3 3 0 103 3V2z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 32 32">
      <path d="M16 0C7.2 0 0 7.2 0 16c0 2.8.7 5.4 2 7.8L0 32l8.4-2c2.3 1.2 4.9 1.9 7.6 1.9 8.8 0 16-7.2 16-16S24.8 0 16 0zm8.2 22.4c-.3.9-1.8 1.7-2.5 1.8-.6.1-1.4.1-2.3-.1-.5-.1-1.2-.4-2-.7-3.5-1.5-5.8-5-6-5.3-.2-.2-1.4-1.9-1.4-3.6 0-1.7.9-2.6 1.2-2.9.3-.3.7-.4 1-.4h.7c.2 0 .5 0 .8.6.3.7 1 2.4 1.1 2.6.1.2.2.4 0 .7-.1.2-.2.4-.4.6-.2.2-.4.4-.5.6-.2.2-.4.4-.2.8.2.4 1 1.6 2.1 2.6 1.4 1.3 2.6 1.7 3 1.9.4.2.6.1.8-.1.3-.3.9-1 1.2-1.4.3-.4.5-.3.9-.2.4.1 2.4 1.1 2.8 1.3.4.2.7.3.8.5.1.3.1 1.2-.2 2.1z" />
    </svg>
  );
}
