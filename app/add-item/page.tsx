"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

type Category = {
  id: string;
  name: string;
};

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
  const [error, setError] = useState<string | null>(null);

  /* ---------------------------------
     AUTH + LOAD CATEGORIES
  ----------------------------------*/
  useEffect(() => {
    checkUser();
    loadCategories();
  }, []);

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) router.push("/login");
  }

  async function loadCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name")
      .order("name", { ascending: true });

    if (!error && data) {
      setCategories(data);
    }
  }

  /* ---------------------------------
     IMAGE HANDLING
  ----------------------------------*/
  function handleImageSelect(files: FileList) {
    const selected = Array.from(files).slice(0, 3);
    setImages(selected);
    setPreviewUrls(selected.map((file) => URL.createObjectURL(file)));
  }

  function removeImage(index: number) {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);

    setImages(newImages);
    setPreviewUrls(newPreviews);

    if (newImages.length === 0) {
      setFileInputKey(Date.now());
    }
  }

  /* ---------------------------------
     SUBMIT
  ----------------------------------*/
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

    // 1️⃣ CREATE ITEM
    const { data: item, error: itemError } = await supabase
      .from("items")
      .insert({
        owner_id: user.id,
        name,
        description,
        category_id: categoryId,
        category_name: categoryName,
        pickup_location: pickupLocation,
      })
      .select()
      .single();

    if (itemError || !item) {
      setError(itemError?.message || "Failed to create item");
      setLoading(false);
      return;
    }

    // 2️⃣ UPLOAD IMAGES
    for (const image of images) {
      const filePath = `${item.id}/${Date.now()}-${image.name}`;

      const { error: uploadError } = await supabase.storage
        .from("item-images")
        .upload(filePath, image, {
          contentType: image.type,
          upsert: false,
        });

      if (uploadError) continue;

      const publicUrl = supabase.storage
        .from("item-images")
        .getPublicUrl(filePath).data.publicUrl;

      await supabase.from("item_images").insert({
        item_id: item.id,
        image_url: publicUrl,
      });
    }

    router.push("/");
  }

  /* ---------------------------------
     UI (UNCHANGED STYLES)
  ----------------------------------*/
  return (
    <main style={{ maxWidth: 520, margin: "40px auto", padding: 20 }}>
      <h1 style={{ fontSize: 28 }}>Add Item</h1>
      <p style={{ color: "#555", marginBottom: 24 }}>
        Share something you no longer need with fellow students.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
        <input
          placeholder="Item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={inputStyle}
        />

        <textarea
          placeholder="Item description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
          style={{ ...inputStyle, resize: "vertical" }}
        />

        {/* CATEGORY — DATABASE DRIVEN */}
        <select
          value={categoryId}
          onChange={(e) => {
             const selectedId = e.target.value;
             setCategoryId(selectedId);

             const selectedOption =
            e.target.options[e.target.selectedIndex];
              setCategoryName(selectedOption.text);
          }}
          required
          style={inputStyle}
        >
          <option value="">Select category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <input
          placeholder="Pickup location"
          value={pickupLocation}
          onChange={(e) => setPickupLocation(e.target.value)}
          required
          style={inputStyle}
        />

        {/* IMAGE UPLOAD */}
        <div>
          <input
            key={fileInputKey}
            id="image-upload"
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={(e) => e.target.files && handleImageSelect(e.target.files)}
          />

          <button
            type="button"
            onClick={() =>
              document.getElementById("image-upload")?.click()
            }
            style={uploadButtonStyle}
          >
            📸 Choose images (max 3)
          </button>

          {previewUrls.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 10,
                marginTop: 12,
              }}
            >
              {previewUrls.map((url, index) => (
                <div key={url} style={{ position: "relative" }}>
                  <img
                    src={url}
                    alt=""
                    style={{
                      width: "100%",
                      height: 100,
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      background: "rgba(0,0,0,0.6)",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: 24,
                      height: 24,
                      cursor: "pointer",
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
          style={{
            marginTop: 10,
            padding: 14,
            borderRadius: 14,
            background: "#2563eb",
            color: "white",
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Posting..." : "Post Item"}
        </button>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </main>
  );
}

/* ---------------------------------
   STYLES (UNCHANGED)
----------------------------------*/
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 12,
  borderRadius: 12,
  border: "1px solid #d1d5db",
};

const uploadButtonStyle: React.CSSProperties = {
  padding: 12,
  width: "100%",
  borderRadius: 12,
  border: "1px dashed #94A3B8",
  background: "transparent",
  color: "inherit",
  fontWeight: 450,
  cursor: "pointer",
};
