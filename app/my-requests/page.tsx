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
   
  const [ownerProfiles, setOwnerProfiles] = useState<Record<string, any>>({})




  useEffect(() => {
    loadMyRequests();
  }, []);

  async function loadMyRequests() {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

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
        requester_confirmed,
        items (
          id,
          name,
          owner_id
         
      )
      `)
      .eq("requester_id", user.id)
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setRequests((data || []).filter((r) => r.items !== null));
    const ownerIds = Array.from(
      new Set(
        (data || [])
        .filter((r) => r.items !== null)
        .map((r: any) => r.items.owner_id as string)
      )
    );

    if (ownerIds.length > 0) {
      const { data: owners } = await supabase
          .from("profiles")
          .select("id, name, phone") 
          .in("id", ownerIds);
        
      const map: Record<string, any> = {};
      owners?.forEach(o => {
        map[o.id] = o;
      });

      setOwnerProfiles(map);
    }




    setLoading(false);
  }

  async function confirmReceived(requestId: string) {
    const { error } = await supabase.rpc(
      "confirm_requester_received",
      {
        p_request_id: requestId,
      }
    );

    if (error) {
      alert(error.message);
      return;
    }

    loadMyRequests();
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
        {requests.map((req) => {
          const owner = req.profiles; // 🔧 FIX: inline owner profile

          return (
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

              {/* OWNER CONTACT */}
              {req.requester_visible && ownerProfiles[req.items.owner_id] && (
                <div
                  style={{
                    background: "#ecfdf5",
                    padding: 14,
                    borderRadius: 12,
                    color: "#065f46",
                    fontSize: 14,
                    marginTop: 10,
                  }}
                >
                  <p style={{ margin: 0, fontWeight: 600 }}>Owner contact</p>
                  <p style={{ marginTop: 6 }}>
                    <strong>Name:</strong>{" "} 
                    {ownerProfiles[req.items.owner_id].name}
                    <br />
                    <strong>Phone:</strong>{" "} 
                    {ownerProfiles[req.items.owner_id].phone}
                  </p>
                </div>
              )}

              {/* CONFIRM RECEIVED */}
              {!req.requester_confirmed ? (
                <button
                  onClick={() => confirmReceived(req.id)}
                  style={{
                    marginTop: 14,
                    width: "100%",
                    padding: "14px",
                    background: "#16a34a",
                    color: "#fff",
                    border: "none",
                    borderRadius: 14,
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  ✓ Mark item as picked up
                </button>
              ) : (
                <div
                  style={{
                    marginTop: 14,
                    background: "#ecfdf5",
                    padding: 14,
                    borderRadius: 12,
                    color: "#065f46",
                    fontWeight: 600,
                    textAlign: "center",
                  }}
                >
                  ✔ You confirmed receipt
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
