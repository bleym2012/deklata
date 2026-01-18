"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ContactPage() {
  const [type, setType] = useState("complaint");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function submitMessage(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);

    const { error } = await supabase.from("contact_messages").insert({
      type,
      email,
      message,
    });

    setSending(false);

    if (!error) {
      setSent(true);
      setEmail("");
      setMessage("");
      setType("issue");
    } else {
      alert("Failed to send message. Please try again.");
    }
  }

  return (
    <main
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "60px 20px",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont",
      }}
    >
      <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>
        Contact & Support
      </h1>

      <p style={{ color: "#555", fontSize: 16, marginBottom: 32 }}>
        Have an issue, suggestion, complaint, or want to partner with Deklata?
        Send us a message — we read every one.
      </p>

      {sent && (
        <div
          style={{
            background: "#ecfdf5",
            color: "#065f46",
            padding: 16,
            borderRadius: 14,
            marginBottom: 24,
            fontWeight: 600,
          }}
        >
          ✅ Message sent successfully. We’ll get back to you.
        </div>
      )}

      <form
        onSubmit={submitMessage}
        style={{
          background: "#fff",
          padding: 32,
          borderRadius: 18,
          boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
        }}
      >
        {/* TYPE */}
        <label style={{ fontWeight: 600, fontSize: 14 }}>Message type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
          style={{
            width: "100%",
            padding: 12,
            marginTop: 6,
            marginBottom: 20,
            borderRadius: 10,
            border: "1px solid #e5e7eb",
          }}
        >
          <option value="complaint">Complaint</option>
          <option value="issue">Issue / Bug</option>
          <option value="suggestion">Suggestion</option>
          <option value="partnership">Partnership</option>
        </select>

        {/* EMAIL */}
        <label style={{ fontWeight: 600, fontSize: 14 }}>Your email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={{
            width: "100%",
            padding: 12,
            marginTop: 6,
            marginBottom: 20,
            borderRadius: 10,
            border: "1px solid #e5e7eb",
          }}
        />

        {/* MESSAGE */}
        <label style={{ fontWeight: 600, fontSize: 14 }}>Message</label>
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          placeholder="Tell us what’s on your mind…"
          style={{
            width: "100%",
            padding: 12,
            marginTop: 6,
            marginBottom: 24,
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            resize: "vertical",
          }}
        />

        <button
          type="submit"
          disabled={sending}
          style={{
            width: "100%",
            padding: 14,
            background: "#111",
            color: "#fff",
            border: "none",
            borderRadius: 14,
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
            opacity: sending ? 0.7 : 1,
          }}
        >
          {sending ? "Sending…" : "Send Message"}
        </button>
      </form>
    </main>
  );
}
