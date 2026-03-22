// app/api/upload/route.ts
//
// Server-side R2 upload handler.
// R2 credentials never touch the browser — all signing happens here on Vercel.
// Accepts multipart form data with one image file, uploads to R2, returns public URL.

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Guard: fail fast with a clear message if env vars are missing
    const endpoint = process.env.CLOUDFLARE_R2_ENDPOINT;
    const bucket = process.env.CLOUDFLARE_R2_BUCKET;
    const accessKey = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
    const secretKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
    const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;

    if (!endpoint || !bucket || !accessKey || !secretKey || !publicUrl) {
      console.error("Missing R2 env vars:", {
        endpoint: !!endpoint,
        bucket: !!bucket,
        accessKey: !!accessKey,
        secretKey: !!secretKey,
        publicUrl: !!publicUrl,
      });
      return NextResponse.json(
        { error: "Storage not configured. Contact support." },
        { status: 500 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const itemId = formData.get("itemId") as string | null;

    if (!file || !itemId) {
      return NextResponse.json(
        { error: "Missing file or itemId" },
        { status: 400 },
      );
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${itemId}/${crypto.randomUUID()}.${ext}`;
    const buffer = await file.arrayBuffer();
    const url = `${endpoint}/${bucket}/${fileName}`;

    // Build AWS Signature V4 for R2
    const now = new Date();
    const dateStamp = now.toISOString().slice(0, 10).replace(/-/g, "");
    const timeStamp =
      now
        .toISOString()
        .replace(/[:\-]|\.\d{3}/g, "")
        .slice(0, 15) + "Z";
    const region = "auto";
    const service = "s3";

    const bodyHash = await sha256Hex(buffer);

    const headers: Record<string, string> = {
      "content-type": file.type || "image/jpeg",
      host: new URL(endpoint).host,
      "x-amz-content-sha256": bodyHash,
      "x-amz-date": timeStamp,
    };

    const signedHeaders = Object.keys(headers).sort().join(";");
    const canonicalHeaders = Object.keys(headers)
      .sort()
      .map((k) => `${k}:${headers[k]}\n`)
      .join("");

    const canonicalRequest = [
      "PUT",
      `/${bucket}/${fileName}`,
      "",
      canonicalHeaders,
      signedHeaders,
      bodyHash,
    ].join("\n");

    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const stringToSign = [
      "AWS4-HMAC-SHA256",
      timeStamp,
      credentialScope,
      await sha256Hex(new TextEncoder().encode(canonicalRequest)),
    ].join("\n");

    const signingKey = await getSigningKey(
      secretKey,
      dateStamp,
      region,
      service,
    );
    const signature = await hmacHex(signingKey, stringToSign);

    const authHeader = [
      `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}`,
      `SignedHeaders=${signedHeaders}`,
      `Signature=${signature}`,
    ].join(", ");

    const response = await fetch(url, {
      method: "PUT",
      headers: { ...headers, Authorization: authHeader },
      body: buffer,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("R2 upload failed:", response.status, text);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    return NextResponse.json({
      url: `${publicUrl}/${fileName}`,
    });
  } catch (err: any) {
    console.error("Upload route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ── AWS Signature V4 helpers
   Use globalThis.crypto.subtle — recognised by TypeScript in Next.js
   API routes without needing additional type declarations. ── */

async function sha256Hex(
  data: ArrayBuffer | Uint8Array | string,
): Promise<string> {
  let input: Uint8Array;
  if (typeof data === "string") {
    input = new TextEncoder().encode(data);
  } else if (data instanceof Uint8Array) {
    input = data;
  } else {
    input = new Uint8Array(data as ArrayBuffer);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buf = await globalThis.crypto.subtle.digest("SHA-256", input as any);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmac(
  key: ArrayBuffer | Uint8Array,
  data: string,
): Promise<Uint8Array> {
  const rawKey =
    key instanceof Uint8Array ? key : new Uint8Array(key as ArrayBuffer);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cryptoKey = await globalThis.crypto.subtle.importKey(
    "raw",
    rawKey as any,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sig = await globalThis.crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    new TextEncoder().encode(data) as any,
  );
  return new Uint8Array(sig);
}

async function hmacHex(
  key: ArrayBuffer | Uint8Array,
  data: string,
): Promise<string> {
  const buf = await hmac(key, data);
  return Array.from(buf)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function getSigningKey(
  secret: string,
  date: string,
  region: string,
  service: string,
): Promise<Uint8Array> {
  const kDate = await hmac(new TextEncoder().encode("AWS4" + secret), date);
  const kRegion = await hmac(kDate, region);
  const kService = await hmac(kRegion, service);
  return hmac(kService, "aws4_request");
}
