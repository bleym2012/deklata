"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

const MAX_SUBMISSIONS = 3;
const COOLDOWN_SECONDS = 60;

export default function ContactPage() {
  const [type, setType] = useState("complaint");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const stored = sessionStorage.getItem("contact_submissions");
    if (stored) setSubmissionCount(Number(stored));
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const isBlocked = submissionCount >= MAX_SUBMISSIONS;
  const isOnCooldown = cooldown > 0;
  const canSubmit = !isBlocked && !isOnCooldown && !sending;

  async function submitMessage(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (isBlocked) {
      setError("You've reached the message limit for this session.");
      return;
    }
    if (isOnCooldown) {
      setError(`Please wait ${cooldown} seconds before sending another message.`);
      return;
    }
    if (message.trim().length < 10) {
      setError("Please write a message of at least 10 characters.");
      return;
    }

    setSending(true);

    const { error: dbError } = await supabase.from("contact_messages").insert({
      type,
      name: name.trim() || null,
      email: email.trim(),
      subject: subject.trim() || null,
      message: message.trim(),
    });

    setSending(false);

    if (dbError) {
      setError("Failed to send message. Please try again.");
      return;
    }

    const newCount = submissionCount + 1;
    setSubmissionCount(newCount);
    sessionStorage.setItem("contact_submissions", String(newCount));
    setCooldown(COOLDOWN_SECONDS);
    setSent(true);
    setName("");
    setSubject("");
    setEmail("");
    setMessage("");
    setType("complaint");
    setTimeout(() => setSent(false), 6000);
  }

  return (
    <main style={{ maxWidth: 680, margin: "0 auto", padding: "48px 20px 80px", fontFamily: "var(--font-body)" }}>

      <h1 style={{
        fontSize: 30, fontWeight: 800, marginBottom: 12,
        lineHeight: 1.15, letterSpacing: "-0.02em",
        fontFamily: "var(--font-display)", color: "var(--ink-900)",
      }}>
        Contact & Support
      </h1>

      <p style={{ color: "var(--ink-500)", fontSize: 15, marginBottom: 32 }}>
        Have an issue, suggestion, complaint, or want to partner with Deklata? We read every message.
      </p>

      {/* SUCCESS */}
      {sent && (
        <div style={{
          background: "var(--green-50)", color: "var(--green-800)",
          padding: 16, borderRadius: 14, marginBottom: 24,
          fontWeight: 600, border: "1px solid var(--green-100)",
        }}>
          ✅ Message sent! We will get back to you soon.
          {!isBlocked && cooldown > 0 && (
            <span style={{ fontWeight: 400, fontSize: 13, display: "block", marginTop: 4 }}>
              You can send another message in {cooldown}s.
            </span>
          )}
        </div>
      )}

      {/* RATE LIMIT BLOCK */}
      {isBlocked && (
        <div style={{
          background: "#fef3c7", color: "#92400e",
          padding: 16, borderRadius: 14, marginBottom: 24,
          fontWeight: 600, border: "1px solid #fde68a",
        }}>
          You have sent {MAX_SUBMISSIONS} messages this session.
          <span style={{ fontWeight: 400, display: "block", marginTop: 4, fontSize: 13 }}>
            If this is urgent, please try again in a new browser session.
          </span>
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div style={{
          background: "#fef2f2", color: "#dc2626",
          padding: 12, borderRadius: 12, marginBottom: 20,
          fontSize: 14, border: "1px solid #fecaca",
        }}>
          {error}
        </div>
      )}

      <form
        onSubmit={submitMessage}
        style={{
          background: "var(--white)", padding: 32,
          borderRadius: 20, boxShadow: "var(--shadow-card)",
          border: "1px solid var(--ink-100)",
          opacity: isBlocked ? 0.5 : 1,
          pointerEvents: isBlocked ? "none" : "auto",
        }}
      >
        <label style={{ fontWeight: 700, fontSize: 13, color: "var(--ink-700)", fontFamily: "var(--font-display)" }}>
          Message type
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
          className="form-input"
          style={{ marginTop: 6, marginBottom: 20 }}
        >
          <option value="complaint">Complaint</option>
          <option value="issue">Issue / Bug</option>
          <option value="suggestion">Suggestion</option>
          <option value="partnership">Partnership</option>
        </select>

        <label style={{ fontWeight: 700, fontSize: 13, color: "var(--ink-700)", fontFamily: "var(--font-display)" }}>
          Your name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          maxLength={100}
          className="form-input"
          style={{ marginTop: 6, marginBottom: 20 }}
        />

        <label style={{ fontWeight: 700, fontSize: 13, color: "var(--ink-700)", fontFamily: "var(--font-display)" }}>
          Your email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          maxLength={200}
          className="form-input"
          style={{ marginTop: 6, marginBottom: 20 }}
        />

        <label style={{ fontWeight: 700, fontSize: 13, color: "var(--ink-700)", fontFamily: "var(--font-display)" }}>
          Subject <span style={{ fontWeight: 400, color: "var(--ink-300)" }}>(optional)</span>
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Short summary"
          maxLength={150}
          className="form-input"
          style={{ marginTop: 6, marginBottom: 20 }}
        />

        <label style={{ fontWeight: 700, fontSize: 13, color: "var(--ink-700)", fontFamily: "var(--font-display)" }}>
          Message
        </label>
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          maxLength={1000}
          placeholder="Describe your issue, suggestion or question..."
          className="form-input"
          style={{ marginTop: 6, marginBottom: 4, resize: "vertical" }}
        />
        <p style={{
          fontSize: 11, textAlign: "right", marginBottom: 24, fontFamily: "var(--font-body)",
          color: message.length > 900 ? "#dc2626" : "var(--ink-300)",
        }}>
          {message.length}/1000
        </p>

        <button
          type="submit"
          disabled={!canSubmit}
          className="btn-primary"
          style={{ opacity: canSubmit ? 1 : 0.6, cursor: canSubmit ? "pointer" : "not-allowed" }}
        >
          {sending ? "Sending..." : isOnCooldown ? `Wait ${cooldown}s` : "Send Message"}
        </button>

        {submissionCount > 0 && !isBlocked && (
          <p style={{ marginTop: 12, fontSize: 12, color: "var(--ink-300)", textAlign: "center", fontFamily: "var(--font-body)" }}>
            {MAX_SUBMISSIONS - submissionCount} message{MAX_SUBMISSIONS - submissionCount !== 1 ? "s" : ""} remaining this session
          </p>
        )}
      </form>
    </main>
  );
}
