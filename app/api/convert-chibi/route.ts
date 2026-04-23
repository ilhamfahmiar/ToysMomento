import { NextRequest, NextResponse } from "next/server";

const FAL_KEY = process.env.FAL_KEY;

/**
 * fal.ai — Cartoonify (Image to Chibi/Cartoon Image)
 *
 * Model: fal-ai/cartoonify
 * Mengubah foto menjadi gambar bergaya 3D cartoon/chibi (seperti PrintU)
 * Output: gambar PNG — tidak perlu GLB atau 3D rendering
 *
 * Harga: ~$0.003-0.005/gambar
 * Daftar di: https://fal.ai
 * API key di: https://fal.ai/dashboard/keys
 */

const FAL_CARTOONIFY_URL = "https://queue.fal.run/fal-ai/cartoonify";

interface FalQueueResponse {
  request_id: string;
}

interface FalStatusResponse {
  status: "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
}

interface FalImage {
  url: string;
  content_type: string;
}

interface FalCartoonifyResult {
  images: FalImage[];
}

const POLL_INTERVAL_MS = 2000;
const TIMEOUT_MS = 120000;

async function uploadToFalStorage(
  imageBuffer: ArrayBuffer,
  mimeType: string,
): Promise<string> {
  const blob = new Blob([imageBuffer], { type: mimeType });

  // Initiate upload
  const initiateResponse = await fetch(
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

  if (!initiateResponse.ok) {
    throw new Error(`Storage initiate error: ${initiateResponse.status}`);
  }

  const { upload_url, file_url } = await initiateResponse.json();

  // Upload file
  const putResponse = await fetch(upload_url, {
    method: "PUT",
    headers: { "Content-Type": mimeType },
    body: blob,
  });

  if (!putResponse.ok) {
    throw new Error(`File upload error: ${putResponse.status}`);
  }

  return file_url as string;
}

async function submitCartoonifyJob(imageUrl: string): Promise<string> {
  const response = await fetch(FAL_CARTOONIFY_URL, {
    method: "POST",
    headers: {
      Authorization: `Key ${FAL_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image_url: imageUrl,
      scale: 1.2, // Slightly stronger cartoon effect
      guidance_scale: 4.0, // Higher = more cartoon-like
      num_inference_steps: 28,
      enable_safety_checker: false,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`fal.ai submit error ${response.status}: ${errText}`);
  }

  const data = (await response.json()) as FalQueueResponse;
  return data.request_id;
}

async function pollCartoonifyJob(requestId: string): Promise<string> {
  const startTime = Date.now();
  const statusUrl = `https://queue.fal.run/fal-ai/cartoonify/requests/${requestId}/status`;
  const resultUrl = `https://queue.fal.run/fal-ai/cartoonify/requests/${requestId}`;

  while (Date.now() - startTime < TIMEOUT_MS) {
    const statusResponse = await fetch(statusUrl, {
      headers: { Authorization: `Key ${FAL_KEY}` },
    });

    if (!statusResponse.ok) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      continue;
    }

    const status = (await statusResponse.json()) as FalStatusResponse;

    if (status.status === "COMPLETED") {
      const resultResponse = await fetch(resultUrl, {
        headers: { Authorization: `Key ${FAL_KEY}` },
      });

      if (!resultResponse.ok) {
        throw new Error(`Result fetch error: ${resultResponse.status}`);
      }

      const result = (await resultResponse.json()) as FalCartoonifyResult;
      const imageUrl = result.images?.[0]?.url;

      if (!imageUrl) {
        throw new Error("Image URL tidak tersedia dari hasil");
      }

      return imageUrl;
    }

    if (status.status === "FAILED") {
      throw new Error("Job gagal di fal.ai");
    }

    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }

  throw new Error("Timeout: proses terlalu lama");
}

export async function POST(request: NextRequest) {
  try {
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

    // Submit cartoonify job
    const requestId = await submitCartoonifyJob(imageUrl);

    // Poll until done
    const chibiImageUrl = await pollCartoonifyJob(requestId);

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
