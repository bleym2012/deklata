"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

export default function MyRequestsPage() {
  const router = useRouter();

  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMyRequests();
  }, []);

  async function loadMyRequests() {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 🔐 REDIRECT IF NOT LOGGED IN
    if (!user) {
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("requests")
      .select(`
        id,
        status,
        requester_visible,
        items (
          id,
          name,
          owner_id
        )
      `)
      .eq("requester_id", user.id)
      .eq("status", "approved");

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setRequests((data || []).filter((r) => r.items !== null));
    setLoading(false);
  }

  return (
    <main
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "32px 20px",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont",
      }}
    >
      {/* 🔙 BACK LINK */}
      <Link
        href="/"
        style={{
          display: "inline-block",
          marginBottom: 20,
          fontSize: 14,
          color: "#2563eb",
          textDecoration: "none",
        }}
      >
        ← Back to Home
      </Link>

      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>
        My Approved Requests
      </h1>
      <p style={{ color: "#555", marginBottom: 24 }}>
        Items you’ve successfully requested.
      </p>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {requests.length === 0 && !loading && (
        <p style={{ color: "#666" }}>No approved requests yet.</p>
      )}

      <div style={{ display: "grid", gap: 16 }}>
        {requests.map((req) => (
          <div
            key={req.id}
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 20,
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 10 }}>
              {req.items.name}
            </h3>

            {req.requester_visible ? (
              <OwnerContact ownerId={req.items.owner_id} />
            ) : (
              <p style={{ fontSize: 14, color: "#666" }}>
                Waiting for owner approval…
              </p>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}

function OwnerContact({ ownerId }: { ownerId: string }) {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("name, phone")
      .eq("id", ownerId)
      .single()
      .then(({ data }) => setProfile(data));
  }, [ownerId]);

  if (!profile) return null;

  return (
    <div
      style={{
        background: "#ecfdf5",
        padding: 14,
        borderRadius: 12,
        color: "#065f46",
        fontSize: 14,
      }}
    >
      <p style={{ margin: 0, fontWeight: 600 }}>Owner contact</p>
      <p style={{ marginTop: 6 }}>
        <strong>Name:</strong> {profile.name}
        <br />
        <strong>Phone:</strong> {profile.phone}
      </p>
    </div>
  );
}
