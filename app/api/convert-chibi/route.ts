import { NextRequest, NextResponse } from "next/server";

const FAL_KEY = process.env.FAL_KEY;

/**
 * fal.ai — Cartoonify (Image to Chibi/Cartoon)
 *
 * Model: fal-ai/cartoonify
 * Mengubah foto menjadi gambar bergaya 3D cartoon/chibi
 * Output: gambar PNG
 *
 * Setup (2 menit, GRATIS $5 credits tanpa kartu kredit):
 * 1. Daftar di https://fal.ai (pakai Google)
 * 2. Buka https://fal.ai/dashboard/keys → Create Key
 * 3. Isi FAL_KEY di .env.local
 * 4. Restart dev server
 */

const TIMEOUT_MS = 90000;

interface FalQueueResponse {
  request_id: string;
  status?: string;
  images?: Array<{ url: string }>;
}

interface FalStatusResponse {
  status: "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
}

interface FalResultResponse {
  images?: Array<{ url: string; content_type: string }>;
}

async function uploadToFalStorage(
  imageBuffer: ArrayBuffer,
  mimeType: string,
): Promise<string> {
  const blob = new Blob([imageBuffer], { type: mimeType });

  const initiateRes = await fetch(
    "https://rest.fal.run/storage/upload/initiate",
    {
      method: "POST",
      headers: {
        Authorization: `Key ${FAL_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content_type: mimeType,
        file_name: "photo.jpg",
      }),
    },
  );

  if (!initiateRes.ok) {
    throw new Error(`Storage initiate error: ${initiateRes.status}`);
  }

  const { upload_url, file_url } = await initiateRes.json();

  const putRes = await fetch(upload_url, {
    method: "PUT",
    headers: { "Content-Type": mimeType },
    body: blob,
  });

  if (!putRes.ok) {
    throw new Error(`File upload error: ${putRes.status}`);
  }

  return file_url as string;
}

async function runCartoonify(imageUrl: string): Promise<string> {
  // Submit job
  const submitRes = await fetch("https://queue.fal.run/fal-ai/cartoonify", {
    method: "POST",
    headers: {
      Authorization: `Key ${FAL_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image_url: imageUrl,
      scale: 1.0,
      guidance_scale: 4.5,
      num_inference_steps: 28,
      enable_safety_checker: false,
    }),
  });

  if (!submitRes.ok) {
    const errText = await submitRes.text();
    throw new Error(`fal.ai submit error ${submitRes.status}: ${errText}`);
  }

  const submitData = (await submitRes.json()) as FalQueueResponse;

  // If already completed (sync response)
  if (submitData.images?.[0]?.url) {
    return submitData.images[0].url;
  }

  const requestId = submitData.request_id;
  if (!requestId) {
    throw new Error("No request_id returned");
  }

  // Poll for result
  const startTime = Date.now();
  while (Date.now() - startTime < TIMEOUT_MS) {
    await new Promise((r) => setTimeout(r, 2000));

    const statusRes = await fetch(
      `https://queue.fal.run/fal-ai/cartoonify/requests/${requestId}/status`,
      { headers: { Authorization: `Key ${FAL_KEY}` } },
    );

    if (!statusRes.ok) continue;

    const status = (await statusRes.json()) as FalStatusResponse;

    if (status.status === "COMPLETED") {
      const resultRes = await fetch(
        `https://queue.fal.run/fal-ai/cartoonify/requests/${requestId}`,
        { headers: { Authorization: `Key ${FAL_KEY}` } },
      );

      if (!resultRes.ok)
        throw new Error(`Result fetch error: ${resultRes.status}`);

      const result = (await resultRes.json()) as FalResultResponse;
      const url = result.images?.[0]?.url;
      if (!url) throw new Error("No image URL in result");
      return url;
    }

    if (status.status === "FAILED") {
      throw new Error("Job failed at fal.ai");
    }
  }

  throw new Error("Timeout");
}

export async function POST(request: NextRequest) {
  try {
    // Check if FAL_KEY is configured
    if (!FAL_KEY || FAL_KEY === "your_fal_key_here") {
      return NextResponse.json(
        {
          success: false,
          error: "FAL_KEY belum dikonfigurasi.",
          needsToken: true,
        },
        { status: 503 },
      );
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        { success: false, error: "Format request tidak valid." },
        { status: 400 },
      );
    }

    const imageFile = formData.get("image");
    if (!imageFile || !(imageFile instanceof File)) {
      return NextResponse.json(
        { success: false, error: "Field 'image' wajib diisi." },
        { status: 400 },
      );
    }

    const imageBuffer = await imageFile.arrayBuffer();
    const mimeType = imageFile.type || "image/jpeg";

    // Upload to fal storage
    const imageUrl = await uploadToFalStorage(imageBuffer, mimeType);

    // Run cartoonify
    const chibiImageUrl = await runCartoonify(imageUrl);

    return NextResponse.json({ success: true, chibiImageUrl }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[convert-chibi] Error:", message);
    return NextResponse.json(
      { success: false, error: "Konversi gagal. Silakan coba lagi." },
      { status: 500 },
    );
  }
}
