"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

export default function OwnerDashboard() {
  const router = useRouter();

  const [requests, setRequests] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completingId, setCompletingId] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);
  
  async function confirmOwnerGiven(requestId: string) {
  const { error } = await supabase.rpc(
    "confirm_owner_given",
    { p_request_id: requestId }
  );

  if (error) {
    alert(error.message);
    return;
  }

  // 🔁 CRITICAL: reload state
  loadRequests();
}


  async function loadRequests() {
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
        requester_id,
        owner_visible,
        owner_confirmed,
        requester_confirmed,
        item_id,
        items (
          id,
          name,
          owner_id,
          is_locked,
          is_completed
        )
      `)
      
      .eq("items.owner_id", user.id)
      .in("status", ["pending", "approved"])
      .order("created_at", { ascending: false });
      
      
      

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const safe = (data || []).filter((r) => r.items !== null);
    setRequests(safe);

    const requesterIds = safe
      .filter((r) => r.status === "approved" && r.owner_visible)
      .map((r) => r.requester_id);

    if (requesterIds.length > 0) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, name, phone")
        .in("id", requesterIds);

      const map: Record<string, any> = {};
      profs?.forEach((p) => (map[p.id] = p));
      setProfiles(map);
    }

    setLoading(false);
  }

  async function approveRequest(requestId: string, itemId: string) {
    await supabase
      .from("requests")
      .update({
        status: "approved",
        owner_visible: true,
        requester_visible: true,
        approved_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    await supabase
      .from("items")
      .update({ status: "approved", is_locked: true })
      .eq("id", itemId);

    loadRequests();
  }

  async function rejectRequest(requestId: string, itemId: string) {
    await supabase.from("requests").update({ status: "rejected" }).eq("id", requestId);

    await supabase
      .from("items")
      .update({ status: "available", is_locked: false })
      .eq("id", itemId);

    loadRequests();
  }


  async function completeItem(itemId: string) {
    setCompletingId(itemId);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Not authenticated");
      setCompletingId(null);
      return;
    }

    const { error } = await supabase.rpc("complete_item_and_award_points", {
      p_item_id: itemId,
      p_owner_id: user.id,
    });

    if (error) {
      setError(error.message);
      setCompletingId(null);
      return;
    }

    setCompletingId(null);
    loadRequests();
  }

  async function confirmownerGiven(requestId: string) {
  await supabase
    .from("requests")
    .update({ owner_confirmed: true })
    .eq("id", requestId);

  loadRequests();
}


  return (
    <main
      style={{
        maxWidth: 1000,
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
        Owner Dashboard
      </h1>
      <p style={{ color: "#555", marginBottom: 24 }}>
        Manage requests for items you’ve posted.
      </p>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {requests.length === 0 && !loading && (
        <p style={{ color: "#666" }}>No requests yet.</p>
      )}

      <div style={{ display: "grid", gap: 16 }}>
        {requests.map((req) => {
          const item = req.items;

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
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>
                {item.name}
              </h3>

              {/* PENDING */}
              {req.status === "pending" && (
                <>
                  <p style={{ fontSize: 14, color: "#555", marginBottom: 12 }}>
                    <strong>Requester ID:</strong> {req.requester_id}
                  </p>

                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={() => approveRequest(req.id, req.item_id)}
                      style={{
                        flex: 1,
                        padding: "12px",
                        borderRadius: 12,
                        border: "none",
                        background: "#16a34a",
                        color: "#fff",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => rejectRequest(req.id, req.item_id)}
                      style={{
                        flex: 1,
                        padding: "12px",
                        borderRadius: 12,
                        border: "1px solid #dc2626",
                        background: "#fff",
                        color: "#dc2626",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Reject
                    </button>
                  </div>
                </>
              )}

              {/* APPROVED */}
              {req.status === "approved" &&
                req.owner_visible &&
                profiles[req.requester_id] && (
                  <div
                    style={{
                      marginTop: 14,
                      background: "#ecfdf5",
                      padding: 14,
                      borderRadius: 12,
                      color: "#065f46",
                    }}
                  >
                    <p style={{ margin: 0, fontWeight: 600 }}>
                      Request approved
                    </p>
                    <p style={{ marginTop: 6, fontSize: 14 }}>
                      <strong>Requester:</strong>{" "}
                      {profiles[req.requester_id].name}
                      <br />
                      <strong>Phone:</strong>{" "}
                      {profiles[req.requester_id].phone}
                    </p>
                    
                    {!req.owner_confirmed && (
  <button
    onClick={() => confirmOwnerGiven(req.id)}
    style={{
      marginTop: 12,
      width: "100%",
      padding: "12px",
      borderRadius: 12,
      border: "none",
      background: "#16a34a",
      color: "#fff",
      fontWeight: 700,
      cursor: "pointer",
    }}
  >
    ✅ Item picked up
  </button>
)}


                
                    {item.is_completed && (
                      <p style={{ marginTop: 12, fontSize: 14 }}>
                        ✅ Item completed — points awarded
                      </p>
                    )}
                  </div>
                )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
