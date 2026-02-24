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
  const [authChecking, setAuthChecking] = useState(true);
  const [ownerProfiles, setOwnerProfiles] = useState<Record<string, any>>({});
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => { checkAuth(); }, []);

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    setAuthChecking(false);
    loadMyRequests();
  }

  async function loadMyRequests() {
    setLoading(true);
    setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    // Fire requests query immediately — don't wait for auth round trip separately
    const { data, error } = await supabase
      .from("requests")
      .select(`
        id, status, requester_visible, requester_confirmed, created_at,
        items ( id, name, owner_id )
      `)
      .eq("requester_id", user.id)
      .in("status", ["pending", "approved"])
      .order("created_at", { ascending: false });

    if (error) { setError(error.message); setLoading(false); return; }

    const safe = (data || []).filter((r) => r.items !== null);
    setRequests(safe);

    // Only fetch owner contact for approved+visible requests
    const ownerIds = Array.from(new Set(
      safe
        .filter((r) => r.status === "approved" && r.requester_visible)
        .map((r: any) => r.items.owner_id as string)
    ));

    if (ownerIds.length > 0) {
      const { data: owners } = await supabase
        .from("profiles").select("id, name, phone, campus").in("id", ownerIds);
      const map: Record<string, any> = {};
      owners?.forEach((o) => { map[o.id] = o; });
      setOwnerProfiles(map);
    }

    setLoading(false);
  }

  async function cancelRequest(requestId: string, itemId: string) {
    if (!confirm("Cancel this request?")) return;
    setCancellingId(requestId);
    const { error } = await supabase.from("requests").delete().eq("id", requestId);
    if (error) {
      alert(error.message);
      setCancellingId(null);
      return;
    }
    // Unlock item if it was locked for this request
    await supabase.from("items").update({ is_locked: false }).eq("id", itemId);
    setCancellingId(null);
    loadMyRequests();
  }

  async function confirmReceived(requestId: string) {
    const { error } = await supabase.rpc("confirm_requester_received", { p_request_id: requestId });
    if (error) { alert(error.message); return; }
    loadMyRequests();
  }

  if (authChecking) return null;

  const pendingRequests = requests.filter(r => r.status === "pending");
  const approvedRequests = requests.filter(r => r.status === "approved");

  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "32px 20px", fontFamily: "var(--font-body)" }}>
      <Link href="/" style={{ display: "inline-block", marginBottom: 20, fontSize: 14, color: "var(--green-700)", fontWeight: 600, textDecoration: "none" }}>
        ← Back to Home
      </Link>

      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6, fontFamily: "var(--font-display)" }}>
        My Requests
      </h1>
      <p style={{ color: "var(--ink-500)", marginBottom: 28, fontSize: 14 }}>
        Track items you've requested from other students.
      </p>

      {error && <p style={{ color: "#dc2626" }}>{error}</p>}

      {loading ? (
        <div style={{ display: "grid", gap: 16 }}>
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 140, borderRadius: 16 }} />)}
        </div>
      ) : requests.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--ink-400)" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <p style={{ fontWeight: 600, fontSize: 16, color: "var(--ink-700)" }}>No requests yet</p>
          <p style={{ fontSize: 14, marginTop: 6 }}>Browse listings and request something you need!</p>
          <Link href="/" style={{
            display: "inline-block", marginTop: 20,
            background: "var(--green-800)", color: "#fff",
            padding: "10px 24px", borderRadius: 999,
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14,
          }}>Browse items</Link>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>

          {/* ── PENDING ── */}
          {pendingRequests.length > 0 && (
            <>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-400)", letterSpacing: "0.5px", margin: "4px 0 8px", fontFamily: "var(--font-display)" }}>
                WAITING FOR APPROVAL ({pendingRequests.length})
              </p>
              {pendingRequests.map(req => (
                <div key={req.id} style={{
                  background: "var(--white)", borderRadius: 16, padding: 20,
                  boxShadow: "var(--shadow-card)", border: "1px solid var(--ink-100)",
                  borderLeft: "4px solid var(--gold)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--ink-900)" }}>
                      {req.items.name}
                    </h3>
                    <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: "#fef3c7", color: "#92400e" }}>
                      PENDING
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--ink-500)", marginBottom: 14 }}>
                    ⏳ Waiting for the owner to review your request. You'll be notified when approved.
                  </p>
                  <button
                    onClick={() => cancelRequest(req.id, req.items.id)}
                    disabled={cancellingId === req.id}
                    style={{
                      padding: "8px 16px", borderRadius: 10,
                      border: "1.5px solid #fecaca", background: "#fff",
                      color: "#dc2626", fontWeight: 600, cursor: "pointer",
                      fontSize: 13, fontFamily: "var(--font-body)",
                      opacity: cancellingId === req.id ? 0.6 : 1,
                    }}
                  >
                    {cancellingId === req.id ? "Cancelling…" : "Cancel request"}
                  </button>
                </div>
              ))}
            </>
          )}

          {/* ── APPROVED ── */}
          {approvedRequests.length > 0 && (
            <>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-400)", letterSpacing: "0.5px", margin: "8px 0 8px", fontFamily: "var(--font-display)" }}>
                APPROVED — ARRANGE PICKUP ({approvedRequests.length})
              </p>
              {approvedRequests.map(req => {
                const owner = ownerProfiles[req.items.owner_id];
                return (
                  <div key={req.id} style={{
                    background: "var(--white)", borderRadius: 16, padding: 20,
                    boxShadow: "var(--shadow-card)", border: "1px solid var(--ink-100)",
                    borderLeft: "4px solid var(--green-600)",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--ink-900)" }}>
                        {req.items.name}
                      </h3>
                      <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: "#dcfce7", color: "#166534" }}>
                        APPROVED
                      </span>
                    </div>

                    {req.requester_visible && owner ? (
                      <div style={{ background: "var(--green-50)", padding: 14, borderRadius: 12, border: "1px solid var(--green-100)", marginBottom: 14 }}>
                        <p style={{ fontWeight: 700, color: "var(--green-800)", marginBottom: 8, fontSize: 14 }}>
                          🎉 Owner contact details
                        </p>
                        <p style={{ fontSize: 14, color: "var(--ink-700)", margin: 0 }}>
                          <strong>Name:</strong> {owner.name}<br />
                          <strong>Phone:</strong> {owner.phone || "Not provided"}<br />
                          <strong>Campus:</strong> {owner.campus || "—"}
                        </p>
                        {owner.phone && (
                          <a
                            href={`https://wa.me/${owner.phone.replace(/\D/g, "")}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{
                              display: "inline-flex", alignItems: "center", gap: 6,
                              marginTop: 10, padding: "8px 16px", borderRadius: 10,
                              background: "#22c55e", color: "#fff",
                              fontWeight: 700, fontSize: 13, textDecoration: "none",
                              fontFamily: "var(--font-display)",
                            }}
                          >
                            <span>💬</span> WhatsApp Owner
                          </a>
                        )}
                      </div>
                    ) : (
                      <p style={{ fontSize: 13, color: "var(--ink-500)", marginBottom: 14 }}>
                        Loading contact details…
                      </p>
                    )}

                    {!req.requester_confirmed ? (
                      <button
                        onClick={() => confirmReceived(req.id)}
                        style={{
                          width: "100%", padding: "13px", background: "var(--green-800)",
                          color: "#fff", border: "none", borderRadius: 14,
                          fontSize: 15, fontWeight: 700, cursor: "pointer",
                          fontFamily: "var(--font-display)",
                        }}
                      >
                        ✓ I received this item
                      </button>
                    ) : (
                      <div style={{
                        padding: 14, background: "var(--green-50)", borderRadius: 12,
                        color: "var(--green-700)", fontWeight: 700, textAlign: "center", fontSize: 14,
                      }}>
                        ✔ You confirmed receipt — thank you!
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </main>
  );
}
