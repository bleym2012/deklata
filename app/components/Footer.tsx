"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";


export default function Footer() {
  const [user, setUser] =
  useState<any>(null)
   
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


  return (
    <footer
      style={{
        borderTop: "1px solid #e5e7eb",
        marginTop: 60,
        background: "#fff",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "32px 20px",
          display: "grid",
          gap: 24,
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont",
        }}
      >
        {/* TOP */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 24,
            justifyContent: "space-between",
          }}
        >
          {/* BRAND */}
          <div>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 800,
                marginBottom: 8,
                letterSpacing: "-0.3px",
              }}
            >
              Deklata
            </h3>
            <p style={{ fontSize: 14, color: "#555", maxWidth: 320 }}>
              A student-to-student sharing platform that helps you give what you
              no longer need and receive what you do — safely and simply.
            </p>
          </div>

          {/* LINKS */}
          <div
            style={{
              display: "flex",
              gap: 40,
              flexWrap: "wrap",
            }}
          >
            <div>
              <p style={sectionTitle}>Explore</p>
              <ul style={listStyle}>
                <li><Link href="/">Home</Link></li>
                <li><Link href="/how-it-works">How it works</Link></li>
                <li><Link href="/add-item">Add item</Link></li>
              </ul>
            </div>

            <div>
              <p style={sectionTitle}>Account</p>
              <ul style={listStyle}>
                <li><Link href="/login">Login</Link></li>
                <li><Link href="/register">Sign up</Link></li>
                <li> {user && <Link href="/dashboard">Dashboard</Link>} </li>
                <li> {user && <Link href="/my-requests">My requests</Link>} </li>
              </ul>
            </div>

            <div>
              <p style={sectionTitle}>Legal</p>
              <ul style={listStyle}>
                <li><Link href="/terms">Terms of Use</Link></li>
                <li><Link href="/guidelines">Community Guidelines</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div
          style={{
            borderTop: "1px solid #e5e7eb",
            paddingTop: 16,
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            justifyContent: "space-between",
            fontSize: 13,
            color: "#666",
          }}
        >
          <span>© {new Date().getFullYear()} Deklata. All rights reserved.</span>
          <span>Built for students • Safe item exchange</span>
        </div>
      </div>
    </footer>
  );
}

const sectionTitle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  marginBottom: 10,
};

const listStyle: React.CSSProperties = {
  listStyle: "none",
  padding: 0,
  margin: 0,
  display: "grid",
  gap: 8,
  fontSize: 14,
};
