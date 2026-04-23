import { NextRequest, NextResponse } from "next/server";

const FAL_KEY = process.env.FAL_KEY;

/**
 * fal.ai — TRELLIS Image to 3D
 *
 * Model terbaik untuk image-to-3D, output GLB langsung.
 * Harga: $0.02/model — free credits saat signup, tidak perlu upgrade.
 *
 * Daftar di: https://fal.ai
 * API key di: https://fal.ai/dashboard/keys
 */

const FAL_TRELLIS_URL = "https://queue.fal.run/fal-ai/trellis";

interface FalQueueResponse {
  request_id: string;
  status: string;
}

interface FalStatusResponse {
  status: "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  logs?: Array<{ message: string }>;
}

interface FalResultResponse {
  model_mesh?: {
    url: string;
    content_type: string;
    file_name: string;
  };
  video?: { url: string };
}

const POLL_INTERVAL_MS = 3000;
const TIMEOUT_MS = 180000;

async function uploadImageToFal(
  imageBuffer: ArrayBuffer,
  mimeType: string,
): Promise<string> {
  // Upload image to fal storage, get public URL
  const blob = new Blob([imageBuffer], { type: mimeType });

  const uploadResponse = await fetch(
    "https://rest.fal.run/storage/upload/initiate",
    {
      method: "POST",
      headers: {
        Authorization: `Key ${FAL_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content_type: mimeType,
        file_name: "upload.jpg",
      }),
    },
  );

  if (!uploadResponse.ok) {
    throw new Error(`Storage initiate error: ${uploadResponse.status}`);
  }

  const { upload_url, file_url } = await uploadResponse.json();

  // Upload actual file
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

async function submitTrellisJob(imageUrl: string): Promise<string> {
  const response = await fetch(FAL_TRELLIS_URL, {
    method: "POST",
    headers: {
      Authorization: `Key ${FAL_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image_url: imageUrl,
      mesh_simplify: 0.95,
      texture_size: 1024,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`fal.ai submit error ${response.status}: ${errText}`);
  }

  const data = (await response.json()) as FalQueueResponse;
  return data.request_id;
}

async function pollFalJob(requestId: string): Promise<string> {
  const startTime = Date.now();
  const statusUrl = `https://queue.fal.run/fal-ai/trellis/requests/${requestId}/status`;
  const resultUrl = `https://queue.fal.run/fal-ai/trellis/requests/${requestId}`;

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

      const result = (await resultResponse.json()) as FalResultResponse;
      const glbUrl = result.model_mesh?.url;

      if (!glbUrl) {
        throw new Error("GLB URL tidak tersedia dari hasil");
      }

      return glbUrl;
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

    // Upload image to fal storage
    const imageUrl = await uploadImageToFal(imageBuffer, mimeType);

    // Submit TRELLIS job
    const requestId = await submitTrellisJob(imageUrl);

    // Poll until done
    const glbUrl = await pollFalJob(requestId);

    return NextResponse.json({ success: true, glbUrl }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[convert-chibi] Error:", message);
    return NextResponse.json(
      { success: false, error: "Konversi gagal. Silakan coba lagi." },
      { status: 500 },
    );
  }
}
