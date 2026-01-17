"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import Image from "next/image";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.push("/");
  }

  const NavLinks = () => (
    <>
      <Link href="/how-it-works" onClick={() => setMenuOpen(false)}>
        How it works
      </Link>

      <Link href="/contact" onClick={() => setMenuOpen(false)}>
        Contact us
      </Link>
      








      {!user && (
        <>
          <Link href="/login" onClick={() => setMenuOpen(false)}>
            Login
          </Link>
          <Link
            href="/register"
            onClick={() => setMenuOpen(false)}
            style={{
              background: "#2563eb",
              color: "#fff",
              padding: "6px 14px",
              borderRadius: 999,
              fontWeight: 600,
              lineHeight: 1.4,
            }}
          >
            Sign up
          </Link>
        </>
      )}

      {user && (
        <>
          <Link href="/add-item" onClick={() => setMenuOpen(false)}>
            Add item
          </Link>
          <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
            Dashboard
          </Link>
          <Link href="/my-requests" onClick={() => setMenuOpen(false)}>
            My requests
          </Link>
          <button
            onClick={handleLogout}
            style={{
              background: "none",
              border: "none",
              color: "#dc2626",
              fontWeight: 600,
              cursor: "pointer",
              padding: 0,
            }}
          >
            Logout
          </button>
        </>
      )}
    </>
  );

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "#fff",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      {/* INNER CONTAINER */}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "8px 20px", // ✅ reduced height
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        {/* LOGO */}
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            lineHeight: 0,
          }}
        >
          <Image
            src="/images/deklata-logo.svg"
            alt="Deklata"
            width={120}   // ✅ optically correct
            height={32}
            priority
          />
        </Link>

        {/* DESKTOP NAV */}
        <nav
          className="desktop-nav"
          style={{
            display: "none",
            gap: 18,
            fontSize: 14,
            alignItems: "center",
          }}
        >
          <NavLinks />
        </nav>

        {/* HAMBURGER */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 22,
            lineHeight: 1,
          }}
        >
          ☰
        </button>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div
          style={{
            borderTop: "1px solid #e5e7eb",
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            fontSize: 15,
            background: "#fff",
          }}
        >
          <NavLinks />
        </div>
      )}

      {/* RESPONSIVE RULES */}
      <style jsx>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          button[aria-label="Toggle menu"] {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
