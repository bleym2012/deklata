"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase, prepareSignOut } from "../lib/supabaseClient";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const fetchId = useRef(0);

  async function syncPendingCount(uid) {
    const id = ++fetchId.current;
    const { data: reqs } = await supabase
      .from("requests")
      .select("id, items!inner(owner_id)", { count: "exact", head: false })
      .eq("items.owner_id", uid)
      .eq("status", "pending");
    if (id !== fetchId.current) return;
    setPendingCount(reqs?.length ?? 0);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      document.documentElement.setAttribute("data-auth", u ? "user" : "guest");
      if (u) syncPendingCount(u.id);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const u = session?.user ?? null;
        document.documentElement.setAttribute(
          "data-auth",
          u ? "user" : "guest",
        );
        if (u) {
          syncPendingCount(u.id);
        } else {
          setPendingCount(0);
        }
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  async function handleLogout() {
    setMenuOpen(false);
    prepareSignOut();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "var(--filter-bar-bg)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--ink-100)",
      }}
    >
      <div
        style={{
          maxWidth: 1140,
          margin: "0 auto",
          padding: "0 20px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* LOGO */}
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <picture>
            <source
              srcSet="/images/deklata-logo-dark.svg"
              media="(prefers-color-scheme: dark)"
            />
            <img
              src="/images/deklata-logo-light.svg"
              alt="Deklata"
              width={160}
              height={40}
              style={{ display: "block" }}
            />
          </picture>
        </Link>

        <nav
          className="header-desktop-nav"
          style={{ display: "flex", gap: 4, alignItems: "center" }}
        >
          <NavLinks
            mobile={false}
            pendingCount={pendingCount}
            onLogout={handleLogout}
          />
        </nav>

        {/* HAMBURGER */}
        <button
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          className="header-hamburger-btn"
          style={{
            background: menuOpen ? "var(--green-50)" : "none",
            border: "1.5px solid",
            borderColor: menuOpen ? "var(--green-100)" : "var(--ink-100)",
            borderRadius: 10,
            cursor: "pointer",
            padding: "8px 10px",
            flexDirection: "column",
            gap: 5,
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
          }}
        >
          <span
            style={{
              display: "block",
              width: 20,
              height: 2,
              background: "var(--ink-900)",
              borderRadius: 2,
              transition: "all 0.25s ease",
              transform: menuOpen
                ? "rotate(45deg) translate(5px, 5px)"
                : "none",
            }}
          />
          <span
            style={{
              display: "block",
              width: 20,
              height: 2,
              background: "var(--ink-900)",
              borderRadius: 2,
              transition: "all 0.25s ease",
              opacity: menuOpen ? 0 : 1,
            }}
          />
          <span
            style={{
              display: "block",
              width: 20,
              height: 2,
              background: "var(--ink-900)",
              borderRadius: 2,
              transition: "all 0.25s ease",
              transform: menuOpen
                ? "rotate(-45deg) translate(5px, -5px)"
                : "none",
            }}
          />
        </button>
      </div>

      {menuOpen && (
        <div
          style={{
            borderTop: "1px solid var(--ink-100)",
            padding: "20px 20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 6,
            background: "var(--filter-bar-bg)",
            animation: "header-slideDown 0.18s ease",
          }}
        >
          <NavLinks
            mobile={true}
            pendingCount={pendingCount}
            onLogout={handleLogout}
          />
        </div>
      )}
    </header>
  );
}

function NavLinks({ mobile, pendingCount, onLogout }) {
  return (
    <>
      {/* Shared */}
      <Link href="/how-it-works" style={mobile ? mobileLink : desktopLink}>
        How it works
      </Link>

      {/* User only */}
      <span className="nav-user">
        <Link href="/add-item" style={mobile ? mobileLink : desktopLink}>
          {mobile ? (
            "Add item"
          ) : (
            <span
              style={{
                background: "var(--gold)",
                color: "var(--white)",
                padding: "7px 16px",
                borderRadius: 999,
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: "0.2px",
              }}
            >
              + Add item
            </span>
          )}
        </Link>
        <Link
          href="/dashboard"
          style={mobile ? mobileLink : { ...desktopLink, position: "relative" }}
        >
          Dashboard
          {pendingCount > 0 && !mobile && (
            <span
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                background: "var(--gold)",
                color: "#fff",
                fontSize: 9,
                fontWeight: 800,
                width: 16,
                height: 16,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-display)",
              }}
            >
              {pendingCount > 9 ? "9+" : pendingCount}
            </span>
          )}
          {pendingCount > 0 && mobile && (
            <span
              style={{
                marginLeft: 8,
                background: "var(--gold)",
                color: "#fff",
                fontSize: 10,
                fontWeight: 800,
                padding: "1px 7px",
                borderRadius: 999,
                fontFamily: "var(--font-display)",
              }}
            >
              {pendingCount}
            </span>
          )}
        </Link>
        <Link href="/my-requests" style={mobile ? mobileLink : desktopLink}>
          My requests
        </Link>
        <Link href="/profile" style={mobile ? mobileLink : desktopLink}>
          Profile
        </Link>
      </span>

      <Link href="/contact" style={mobile ? mobileLink : desktopLink}>
        Contact
      </Link>

      {/* Guest only */}
      <span className="nav-guest">
        <Link href="/login" style={mobile ? mobileLink : desktopLink}>
          Log in
        </Link>
        <Link
          href="/register"
          style={{
            ...(mobile ? mobileLink : desktopLink),
            ...(mobile
              ? {}
              : {
                  background: "var(--green-800)",
                  color: "var(--white)",
                  padding: "7px 18px",
                  borderRadius: 999,
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 13,
                }),
          }}
        >
          Sign up
        </Link>
      </span>

      {/* Logout */}
      <span className="nav-user">
        <button
          onClick={onLogout}
          style={{
            background: "none",
            border: "none",
            color: "#dc2626",
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            fontSize: mobile ? 15 : 13,
            cursor: "pointer",
            padding: mobile ? "4px 0" : 0,
          }}
        >
          Logout
        </button>
      </span>
    </>
  );
}

const desktopLink = {
  color: "var(--ink-700)",
  fontFamily: "var(--font-body)",
  fontSize: 13,
  fontWeight: 500,
  padding: "6px 10px",
  borderRadius: 8,
  transition: "color 0.15s ease, background 0.15s ease",
  textDecoration: "none",
};

const mobileLink = {
  color: "var(--ink-700)",
  fontFamily: "var(--font-body)",
  fontSize: 15,
  fontWeight: 500,
  padding: "10px 0",
  borderBottom: "1px solid var(--ink-100)",
  display: "block",
  textDecoration: "none",
};
