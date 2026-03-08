"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

type Category = { id: string; name: string };

export default function AddItemPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [loading, setLoading] = useState(false);
  const [condition, setCondition] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    // Check campus and phone
    const { data: profile } = await supabase
      .from("profiles")
      .select("campus, phone")
      .eq("id", user.id)
      .single();
    const noCampus =
      !profile ||
      !profile.campus ||
      profile.campus === "Not specified" ||
      profile.campus.trim() === "";
    const noPhone = !profile || !profile.phone || profile.phone.trim() === "";
    if (noCampus || noPhone) {
      router.push("/onboarding");
      return;
    }

    setAuthChecking(false);
    loadCategories();
  }

  async function loadCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name")
      .order("name", { ascending: true });
    if (!error && data) setCategories(data);
  }

  async function compressImage(file: File): Promise<File> {
    return new Promise((resolve) => {
      const MAX_SIZE = 1024 * 1024; // 1MB target
      const MAX_DIM = 1400;

      if (file.size <= MAX_SIZE) {
        resolve(file);
        return;
      }

      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        let { width, height } = img;
        if (width > MAX_DIM || height > MAX_DIM) {
          const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob1) => {
            if (blob1 && blob1.size <= MAX_SIZE) {
              resolve(
                new File([blob1], file.name.replace(/\.[^.]+$/, ".jpg"), {
                  type: "image/jpeg",
                }),
              );
            } else {
              canvas.toBlob(
                (blob2) => {
                  const final = blob2 || blob1 || file;
                  resolve(
                    new File([final], file.name.replace(/\.[^.]+$/, ".jpg"), {
                      type: "image/jpeg",
                    }),
                  );
                },
                "image/jpeg",
                0.65,
              );
            }
          },
          "image/jpeg",
          0.82,
        );
      };
      img.onerror = () => resolve(file);
      img.src = url;
    });
  }

  async function handleImageSelect(files: FileList) {
    const selected = Array.from(files).slice(0, 3);
    setLoading(true);
    const compressed = await Promise.all(selected.map(compressImage));
    setImages(compressed);
    setPreviewUrls(compressed.map((f) => URL.createObjectURL(f)));
    setLoading(false);
  }

  function removeImage(index: number) {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    setImages(newImages);
    setPreviewUrls(newPreviews);
    if (newImages.length === 0) setFileInputKey(Date.now());
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be logged in");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("campus")
      .eq("id", user.id)
      .single();
    if (profileError || !profile) {
      console.error("Failed to fetch user campus", profileError);
      setLoading(false);
      return;
    }

    const { data: item, error: itemError } = await supabase
      .from("items")
      .insert({
        owner_id: user.id,
        name,
        description,
        category_id: categoryId,
        category_name: categoryName,
        pickup_location: pickupLocation,
        campus: profile?.campus ?? null,
        condition,
      })
      .select()
      .single();

    if (itemError || !item) {
      setError(itemError?.message || "Failed to create item");
      setLoading(false);
      return;
    }

    for (const image of images) {
      const ext = image.name.split(".").pop()?.toLowerCase() || "jpg";
      const filePath = `${item.id}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("item-images")
        .upload(filePath, image, { contentType: image.type, upsert: false });
      if (uploadError) continue;
      const publicUrl = supabase.storage
        .from("item-images")
        .getPublicUrl(filePath).data.publicUrl;
      await supabase
        .from("item_images")
        .insert({ item_id: item.id, image_url: publicUrl });
    }

    router.push("/");
  }

  if (authChecking)
    return (
      <main
        style={{
          maxWidth: 580,
          margin: "clamp(16px, 4vw, 40px) auto",
          padding: "0 20px 60px",
        }}
      >
        <div
          className="skeleton"
          style={{ height: 32, width: "40%", marginBottom: 24 }}
        />
        <div className="skeleton" style={{ height: 500, borderRadius: 20 }} />
      </main>
    );

  return (
    <main
      style={{
        maxWidth: 580,
        margin: "clamp(16px, 4vw, 40px) auto",
        padding: "0 20px 60px",
      }}
    >
      {/* HEADER */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: "clamp(22px, 5vw, 30px)", marginBottom: 6 }}>
          Give an item away
        </h1>
        <p
          style={{
            color: "var(--ink-500)",
            fontSize: 15,
            margin: 0,
            fontFamily: "var(--font-body)",
          }}
        >
          List something you no longer need and help a fellow student today.
        </p>
      </div>

      <div
        style={{
          background: "var(--white)",
          borderRadius: "var(--radius-xl)",
          padding: "clamp(18px, 4vw, 32px)",
          border: "1px solid var(--ink-100)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 18 }}>
          <div>
            <label style={labelStyle}>Item name</label>
            <input
              placeholder="e.g. iPhone 6, Calculus textbook, Desk lamp"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={80}
              className="form-input"
            />
            <p
              style={{
                fontSize: 11,
                color: name.length > 70 ? "#dc2626" : "var(--ink-300)",
                marginTop: 4,
                textAlign: "right",
                fontFamily: "var(--font-body)",
              }}
            >
              {name.length}/80
            </p>
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              placeholder="Describe the item's condition, why you're giving it away, any important details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              maxLength={500}
              rows={4}
              className="form-input"
              style={{ resize: "vertical" }}
            />
            <p
              style={{
                fontSize: 11,
                color: description.length > 450 ? "#dc2626" : "var(--ink-300)",
                marginTop: 4,
                textAlign: "right",
                fontFamily: "var(--font-body)",
              }}
            >
              {description.length}/500
            </p>
          </div>

          <div>
            <label style={labelStyle}>Category</label>
            <select
              value={categoryId}
              onChange={(e) => {
                const selectedId = e.target.value;
                setCategoryId(selectedId);
                setCategoryName(e.target.options[e.target.selectedIndex].text);
              }}
              required
              className="form-input"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Condition</label>
            <select
              required
              className="form-input"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            >
              <option value="">Select condition</option>
              <option value="Brand new">Brand new — unused/unopened</option>
              <option value="Excellent">
                Excellent — like new, barely used
              </option>
              <option value="Good">Good — works perfectly, minor wear</option>
              <option value="Fair">
                Fair — functional with visible signs of use
              </option>
              <option value="For parts">
                For parts — broken or incomplete
              </option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Pickup location</label>
            <input
              placeholder="e.g. Sunshine Hostel, UDS-Tamale"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              required
              className="form-input"
            />
          </div>

          {/* IMAGE UPLOAD */}
          <div>
            <label style={labelStyle}>
              Photos{" "}
              <span style={{ color: "var(--ink-300)", fontWeight: 400 }}>
                (optional, max 3)
              </span>
            </label>

            <input
              key={fileInputKey}
              id="image-upload"
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={(e) =>
                e.target.files && handleImageSelect(e.target.files)
              }
            />

            <button
              type="button"
              onClick={() => document.getElementById("image-upload")?.click()}
              style={{
                padding: "16px",
                width: "100%",
                borderRadius: "var(--radius-md)",
                border: "2px dashed var(--ink-100)",
                background: "var(--green-50)",
                color: "var(--green-700)",
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                fontSize: 14,
                cursor: "pointer",
                transition: "all 0.15s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              📸 Choose photos
            </button>

            {previewUrls.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 12,
                  marginTop: 14,
                }}
              >
                {previewUrls.map((url, index) => (
                  <div key={url} style={{ position: "relative" }}>
                    <img
                      src={url}
                      alt=""
                      style={{
                        width: "100%",
                        height: 110,
                        objectFit: "cover",
                        borderRadius: 12,
                        boxShadow: "var(--shadow-card)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      style={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        background: "rgba(0,0,0,0.65)",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: 24,
                        height: 24,
                        cursor: "pointer",
                        fontSize: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            disabled={loading}
            className="btn-primary"
            style={{ marginTop: 8 }}
          >
            {loading ? "Posting your item…" : "Post item for free"}
          </button>

          {error && (
            <p
              style={{
                color: "#dc2626",
                fontSize: 14,
                textAlign: "center",
                fontFamily: "var(--font-body)",
              }}
            >
              {error}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 700,
  color: "var(--ink-700)",
  fontFamily: "var(--font-display)",
  marginBottom: 6,
  letterSpacing: "0.1px",
};
