"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

export default function OwnerDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<"requests" | "myitems">("requests");
  const [requests, setRequests] = useState<any[]>([]);
  const [myItems, setMyItems] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [error, setError] = useState("");
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // getSession() = instant localStorage read, no network call
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        router.push("/login");
        return;
      }
      setUserId(session.user.id);
      loadRequests(session.user.id);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel("dashboard-requests")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "requests" },
        () => {
          loadRequests(userId);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  useEffect(() => {
    if (userId && tab === "myitems") loadMyItems();
  }, [tab, userId]);

  async function loadMyItems() {
    setItemsLoading(true);
    const { data, error } = await supabase
      .from("items")
      .select(
        "id, name, status, is_locked, is_completed, created_at, category_id, categories(name)",
      )
      .eq("owner_id", userId)
      .order("created_at", { ascending: false });
    if (!error) setMyItems(data || []);
    setItemsLoading(false);
  }

  async function deleteMyItem(itemId: string, isLocked: boolean) {
    if (isLocked) {
      alert(
        "This item has an active request. Reject it first before deleting.",
      );
      return;
    }
    if (!confirm("Delete this item permanently?")) return;
    await supabase
      .from("requests")
      .update({ status: "rejected" })
      .eq("item_id", itemId);
    await supabase.from("item_images").delete().eq("item_id", itemId);
    const { error } = await supabase.from("items").delete().eq("id", itemId);
    if (error) {
      alert(error.message);
      return;
    }
    setMyItems((prev) => prev.filter((i) => i.id !== itemId));
  }

  async function confirmOwnerGiven(requestId: string) {
    setCompletingId(requestId);
    const { error } = await supabase.rpc("confirm_owner_given", {
      p_request_id: requestId,
    });
    if (error) {
      alert(error.message);
      setCompletingId(null);
      return;
    }
    setCompletingId(null);
    loadRequests(userId!);
  }

  async function loadRequests(uid: string) {
    setLoading(true);
    setError("");
    const { data, error } = await supabase
      .from("requests")
      .select(
        `id, status, requester_id, owner_visible, owner_confirmed, requester_confirmed, item_id, created_at, items ( id, name, owner_id, is_locked, is_completed )`,
      )
      .eq("items.owner_id", uid)
      .in("status", ["pending", "approved", "completed"])
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const safe = (data || []).filter((r) => r.items !== null);
    setRequests(safe);

    const allRequesterIds = [...new Set(safe.map((r) => r.requester_id))];
    if (allRequesterIds.length > 0) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, name, phone, campus")
        .in("id", allRequesterIds);
      const map: Record<string, any> = {};
      profs?.forEach((p) => {
        map[p.id] = p;
      });
      setProfiles(map);
    }
    setLoading(false);
  }

  async function approveRequest(requestId: string, itemId: string) {
    try {
      setApprovingId(requestId);
      // Use cached session — no network call
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        alert("Not authenticated");
        return;
      }

      const { data: existingApproval } = await supabase
        .from("requests")
        .select("id")
        .eq("item_id", itemId)
        .eq("status", "approved")
        .neq("id", requestId)
        .maybeSingle();
      if (existingApproval) {
        alert("This item already has an approved request.");
        await loadRequests(session.user.id);
        return;
      }

      const { error: requestError } = await supabase
        .from("requests")
        .update({
          status: "approved",
          owner_visible: true,
          requester_visible: true,
          owner_confirmed: false,
          requester_confirmed: false,
          approved_at: new Date().toISOString(),
        })
        .eq("id", requestId);
      if (requestError) {
        alert(requestError.message);
        return;
      }

      const { error: itemError } = await supabase
        .from("items")
        .update({ is_locked: true, is_completed: false })
        .eq("id", itemId);
      if (itemError) {
        alert(itemError.message);
        return;
      }

      try {
        if (session.access_token) {
          await fetch(
            "https://iibknadykycghvbjbwxs.supabase.co/functions/v1/notify-owner-request",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({ type: "approved", request_id: requestId }),
            },
          );
        }
      } catch (emailError) {
        console.error("Approval email failed:", emailError);
      }

      loadRequests(session.user.id);
    } finally {
      setApprovingId(null);
    }
  }

  async function rejectRequest(requestId: string, itemId: string) {
    const { error: deleteError } = await supabase
      .from("requests")
      .delete()
      .eq("id", requestId);
    if (deleteError)
      await supabase
        .from("requests")
        .update({ status: "rejected" })
        .eq("id", requestId);
    await supabase
      .from("items")
      .update({ is_locked: false, status: "available" })
      .eq("id", itemId);
    loadRequests(userId!);
  }

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;

  return (
    <main
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "24px 16px",
        fontFamily: "var(--font-body)",
      }}
    >
      <Link
        href="/"
        style={{
          display: "inline-block",
          marginBottom: 20,
          fontSize: 14,
          color: "var(--green-700)",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        ← Back to Home
      </Link>

      <h1
        style={{
          fontSize: "clamp(22px, 5vw, 28px)",
          fontWeight: 800,
          marginBottom: 6,
          fontFamily: "var(--font-display)",
        }}
      >
        My Dashboard
      </h1>
      <p style={{ color: "var(--ink-500)", marginBottom: 28, fontSize: 14 }}>
        Manage your listings and incoming requests.
      </p>

      {/* TABS */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 28,
          borderBottom: "2px solid var(--ink-100)",
          paddingBottom: 0,
        }}
      >
        {[
          {
            key: "requests",
            label: `Requests${pendingCount > 0 ? ` (${pendingCount} new)` : ""}`,
          },
          {
            key: "myitems",
            label: `My Items${myItems.length > 0 ? ` (${myItems.length})` : ""}`,
          },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            style={{
              padding: "10px clamp(12px, 3vw, 20px)",
              border: "none",
              background: "none",
              cursor: "pointer",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 14,
              color: tab === t.key ? "var(--green-800)" : "var(--ink-400)",
              borderBottom: `3px solid ${tab === t.key ? "var(--green-800)" : "transparent"}`,
              marginBottom: -2,
              transition: "all 0.15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <p style={{ color: "#dc2626", marginBottom: 16 }}>{error}</p>}

      {/* REQUESTS TAB */}
      {tab === "requests" && (
        <>
          {loading ? (
            <div style={{ display: "grid", gap: 16 }}>
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="skeleton"
                  style={{ height: 140, borderRadius: 16 }}
                />
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "48px 24px",
                color: "var(--ink-400)",
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
              <p
                style={{
                  fontWeight: 600,
                  fontSize: 16,
                  color: "var(--ink-700)",
                }}
              >
                No requests yet
              </p>
              <p style={{ fontSize: 14, marginTop: 6 }}>
                When students request your items, they'll appear here.
              </p>
              <Link
                href="/add-item"
                style={{
                  display: "inline-block",
                  marginTop: 20,
                  background: "var(--green-800)",
                  color: "#fff",
                  padding: "10px 24px",
                  borderRadius: 999,
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                + Post an item
              </Link>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 16 }}>
              {requests.map((req) => {
                const item = req.items;
                const requesterProfile = profiles[req.requester_id];
                const firstName =
                  requesterProfile?.name?.split(" ")[0] || "A student";
                const requesterCampus = requesterProfile?.campus || "";
                return (
                  <div
                    key={req.id}
                    style={{
                      background: "var(--white)",
                      borderRadius: 16,
                      padding: "clamp(14px, 3vw, 20px)",
                      boxShadow: "var(--shadow-card)",
                      border: "1px solid var(--ink-100)",
                      borderLeft:
                        req.status === "pending"
                          ? "4px solid var(--gold)"
                          : "4px solid var(--green-600)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 10,
                      }}
                    >
                      <h3
                        style={{
                          fontSize: 17,
                          fontWeight: 700,
                          fontFamily: "var(--font-display)",
                          color: "var(--ink-900)",
                        }}
                      >
                        {item.name}
                      </h3>
                      <span
                        style={{
                          padding: "3px 10px",
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 700,
                          background:
                            req.status === "pending" ? "#fef3c7" : "#dcfce7",
                          color:
                            req.status === "pending" ? "#92400e" : "#166534",
                          fontFamily: "var(--font-display)",
                        }}
                      >
                        {req.status === "pending" ? "PENDING" : "APPROVED"}
                      </span>
                    </div>

                    {req.status === "pending" && (
                      <>
                        <p
                          style={{
                            fontSize: 14,
                            color: "var(--ink-500)",
                            marginBottom: 14,
                          }}
                        >
                          <strong style={{ color: "var(--ink-700)" }}>
                            {firstName}
                          </strong>
                          {requesterCampus && (
                            <span style={{ color: "var(--ink-400)" }}>
                              {" "}
                              · {requesterCampus}
                            </span>
                          )}{" "}
                          wants this item.
                        </p>
                        <div style={{ display: "flex", gap: 10 }}>
                          <button
                            onClick={() => approveRequest(req.id, req.item_id)}
                            disabled={approvingId === req.id}
                            style={{
                              flex: 1,
                              padding: "11px",
                              borderRadius: 12,
                              border: "none",
                              background: "var(--green-800)",
                              color: "#fff",
                              fontWeight: 700,
                              cursor: "pointer",
                              fontFamily: "var(--font-display)",
                              fontSize: 14,
                              opacity: approvingId === req.id ? 0.7 : 1,
                            }}
                          >
                            {approvingId === req.id
                              ? "Approving…"
                              : "✓ Approve"}
                          </button>
                          <button
                            onClick={() => rejectRequest(req.id, req.item_id)}
                            style={{
                              flex: 1,
                              padding: "11px",
                              borderRadius: 12,
                              border: "1.5px solid #dc2626",
                              background: "var(--white)",
                              color: "#dc2626",
                              fontWeight: 700,
                              cursor: "pointer",
                              fontFamily: "var(--font-display)",
                              fontSize: 14,
                            }}
                          >
                            Decline
                          </button>
                        </div>
                      </>
                    )}

                    {req.status === "approved" &&
                      req.owner_visible &&
                      profiles[req.requester_id] && (
                        <div
                          style={{
                            background: "var(--green-50)",
                            padding: 16,
                            borderRadius: 12,
                            border: "1px solid var(--green-100)",
                          }}
                        >
                          <p
                            style={{
                              margin: 0,
                              fontWeight: 700,
                              color: "var(--green-800)",
                              marginBottom: 8,
                            }}
                          >
                            ✅ Request approved — contact details below
                          </p>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 6,
                              fontSize: 14,
                              color: "var(--ink-700)",
                            }}
                          >
                            <p style={{ margin: 0 }}>
                              <strong>Name:</strong>{" "}
                              {profiles[req.requester_id].name}
                            </p>
                            <p style={{ margin: 0 }}>
                              <strong>Phone:</strong>{" "}
                              {profiles[req.requester_id].phone ||
                                "Not provided"}
                            </p>
                            <p style={{ margin: 0 }}>
                              <strong>Campus:</strong>{" "}
                              {profiles[req.requester_id].campus || "—"}
                            </p>
                          </div>
                          {req.owner_confirmed !== true ? (
                            <button
                              onClick={() => confirmOwnerGiven(req.id)}
                              disabled={completingId === req.id}
                              style={{
                                marginTop: 14,
                                width: "100%",
                                padding: "12px",
                                borderRadius: 12,
                                border: "none",
                                background: "var(--green-800)",
                                color: "#fff",
                                fontWeight: 700,
                                cursor: "pointer",
                                fontFamily: "var(--font-display)",
                                fontSize: 14,
                                opacity: completingId === req.id ? 0.7 : 1,
                              }}
                            >
                              {completingId === req.id
                                ? "Completing…"
                                : "✓ I gave this item"}
                            </button>
                          ) : (
                            <div
                              style={{
                                marginTop: 14,
                                padding: 12,
                                background: "#dcfce7",
                                borderRadius: 10,
                                color: "#166534",
                                fontWeight: 700,
                                textAlign: "center",
                                fontSize: 13,
                              }}
                            >
                              ✔ You confirmed giving this item
                            </div>
                          )}
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* MY ITEMS TAB */}
      {tab === "myitems" && (
        <>
          {itemsLoading ? (
            <div style={{ display: "grid", gap: 16 }}>
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="skeleton"
                  style={{ height: 100, borderRadius: 16 }}
                />
              ))}
            </div>
          ) : myItems.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "48px 24px",
                color: "var(--ink-400)",
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
              <p
                style={{
                  fontWeight: 600,
                  fontSize: 16,
                  color: "var(--ink-700)",
                }}
              >
                No items posted yet
              </p>
              <Link
                href="/add-item"
                style={{
                  display: "inline-block",
                  marginTop: 20,
                  background: "var(--green-800)",
                  color: "#fff",
                  padding: "10px 24px",
                  borderRadius: 999,
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                + Post an item
              </Link>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {myItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: "var(--white)",
                    borderRadius: 14,
                    padding: "16px 18px",
                    boxShadow: "var(--shadow-card)",
                    border: "1px solid var(--ink-100)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        fontWeight: 700,
                        color: "var(--ink-900)",
                        fontFamily: "var(--font-display)",
                        margin: 0,
                        fontSize: 15,
                      }}
                    >
                      {item.name}
                    </p>
                    <p
                      style={{
                        fontSize: 12,
                        color: "var(--ink-400)",
                        margin: "4px 0 0",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {(item.categories as any)?.name || "Uncategorised"} ·{" "}
                      <span
                        style={{
                          color: item.is_completed
                            ? "var(--green-700)"
                            : item.is_locked
                              ? "var(--gold)"
                              : "var(--green-600)",
                          fontWeight: 600,
                        }}
                      >
                        {item.is_completed
                          ? "Completed"
                          : item.is_locked
                            ? "Request pending"
                            : "Available"}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => deleteMyItem(item.id, item.is_locked)}
                    style={{
                      padding: "7px 14px",
                      borderRadius: 10,
                      border: "1.5px solid #fecaca",
                      background: "var(--white)",
                      color: "#dc2626",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontSize: 13,
                      fontFamily: "var(--font-body)",
                      flexShrink: 0,
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
