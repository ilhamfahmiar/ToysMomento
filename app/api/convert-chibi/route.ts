import { NextRequest, NextResponse } from "next/server";

const MESHY_API_KEY = process.env.MESHY_API_KEY;
const MESHY_API_BASE = "https://api.meshy.ai/openapi/v1";

/**
 * Meshy AI — Image to 3D API
 * Teknologi yang sama dipakai MakerWorld PrintU (Meshy-6)
 *
 * Pipeline:
 * 1. Upload foto → POST /image-to-3d → dapat task ID
 * 2. Poll task status hingga SUCCEEDED
 * 3. Return GLB URL untuk di-render di Three.js
 *
 * Daftar & API key: https://app.meshy.ai/api
 * Free tier: 200 credits/bulan (~20 model 3D gratis)
 */

const POLL_INTERVAL_MS = 3000;
const TIMEOUT_MS = 180000; // 3 menit

interface MeshyTask {
  id: string;
  status: "PENDING" | "IN_PROGRESS" | "SUCCEEDED" | "FAILED" | "EXPIRED";
  progress?: number;
  model_urls?: {
    glb?: string;
    obj?: string;
    fbx?: string;
    usdz?: string;
  };
  thumbnail_url?: string;
  error?: { message: string };
}

async function createImageTo3DTask(imageDataUrl: string): Promise<string> {
  const response = await fetch(`${MESHY_API_BASE}/image-to-3d`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${MESHY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image_url: imageDataUrl,
      ai_model: "meshy-6",
      model_type: "standard",
      should_texture: true,
      should_remesh: false,
      image_enhancement: true,
      remove_lighting: true,
      target_formats: ["glb"],
      symmetry_mode: "auto",
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Meshy API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  return data.result as string; // task ID
}

async function pollTask(taskId: string): Promise<MeshyTask> {
  const startTime = Date.now();

  while (Date.now() - startTime < TIMEOUT_MS) {
    const response = await fetch(`${MESHY_API_BASE}/image-to-3d/${taskId}`, {
      headers: {
        Authorization: `Bearer ${MESHY_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Poll error: ${response.status}`);
    }

    const task = (await response.json()) as MeshyTask;

    if (task.status === "SUCCEEDED") {
      return task;
    }

    if (task.status === "FAILED" || task.status === "EXPIRED") {
      throw new Error(
        `Task ${task.status}: ${task.error?.message ?? "unknown error"}`,
      );
    }

    // PENDING or IN_PROGRESS — wait and poll again
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error("Timeout: proses terlalu lama (>3 menit)");
}

export async function POST(request: NextRequest) {
  try {
    // Cek API key
    if (!MESHY_API_KEY || MESHY_API_KEY === "your_meshy_key_here") {
      return NextResponse.json(
        {
          success: false,
          error: "MESHY_API_KEY belum dikonfigurasi.",
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

    // Convert to base64 data URL
    const imageBuffer = await imageFile.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString("base64");
    const mimeType = imageFile.type || "image/jpeg";
    const imageDataUrl = `data:${mimeType};base64,${imageBase64}`;

    // Create Meshy task
    const taskId = await createImageTo3DTask(imageDataUrl);

    // Poll until done
    const task = await pollTask(taskId);

    const glbUrl = task.model_urls?.glb;
    if (!glbUrl) {
      throw new Error("GLB URL tidak tersedia dari hasil task");
    }

    return NextResponse.json(
      {
        success: true,
        glbUrl,
        thumbnailUrl: task.thumbnail_url,
        taskId,
      },
      { status: 200 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[convert-chibi] Error:", message);
    return NextResponse.json(
      { success: false, error: "Konversi gagal. Silakan coba lagi." },
      { status: 500 },
    );
  }
}
