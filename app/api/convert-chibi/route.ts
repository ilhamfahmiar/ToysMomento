import { NextRequest, NextResponse } from "next/server";

const MODELSLAB_API_KEY = process.env.MODELSLAB_API_KEY;

/**
 * ModelsLab (stablediffusionapi.com) — img2img endpoint
 * Endpoint: https://modelslab.com/api/v6/realtime/img2img
 *
 * Free API key — no credit card required
 * Daftar di: https://modelslab.com
 * API key di: https://modelslab.com/dashboard (Settings → API Key)
 *
 * Model chibi/anime yang digunakan: anime-model-v2
 */

const MODELSLAB_ENDPOINT = "https://modelslab.com/api/v6/realtime/img2img";

const CHIBI_PROMPT =
  "nendoroid chibi style, big round head, small cute body, large round eyes, smooth face, gentle smile, detailed clothing, matte plastic finish, white background, full body, anime style, high quality";

const NEGATIVE_PROMPT =
  "realistic, photograph, ugly, deformed, blurry, bad anatomy, extra limbs, elongated body, thin body";

const POLL_INTERVAL_MS = 3000;
const TIMEOUT_MS = 120000;

interface ModelsLabResponse {
  status: "success" | "processing" | "error";
  output?: string[];
  future_links?: string[];
  fetch_result?: string;
  id?: number;
  message?: string;
  error?: string;
  messege?: string; // typo in their API
}

async function fetchResult(fetchUrl: string): Promise<string> {
  const startTime = Date.now();

  while (Date.now() - startTime < TIMEOUT_MS) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

    const response = await fetch(fetchUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: MODELSLAB_API_KEY }),
    });

    if (!response.ok) continue;

    const data = (await response.json()) as ModelsLabResponse;

    if (data.status === "success" && data.output && data.output.length > 0) {
      return data.output[0];
    }

    if (data.status === "error") {
      throw new Error(data.message || data.error || "Processing failed");
    }
    // status === "processing" — keep polling
  }

  throw new Error("Timeout: proses terlalu lama");
}

export async function POST(request: NextRequest) {
  try {
    // Cek API key
    if (!MODELSLAB_API_KEY || MODELSLAB_API_KEY === "your_modelslab_key_here") {
      return NextResponse.json(
        {
          success: false,
          error: "MODELSLAB_API_KEY belum dikonfigurasi.",
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

    // Convert image to base64 data URL
    const imageBuffer = await imageFile.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString("base64");
    const mimeType = imageFile.type || "image/jpeg";
    const imageDataUrl = `data:${mimeType};base64,${imageBase64}`;

    // Call ModelsLab img2img API
    const response = await fetch(MODELSLAB_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: MODELSLAB_API_KEY,
        prompt: CHIBI_PROMPT,
        negative_prompt: NEGATIVE_PROMPT,
        init_image: imageDataUrl,
        width: 512,
        height: 512,
        samples: 1,
        strength: 0.7, // how much to transform (0=keep original, 1=full transform)
        seed: null,
        base64: false,
        webhook: null,
        track_id: null,
        safety_checker: false,
        instant_response: false,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(
        "[convert-chibi] ModelsLab error:",
        response.status,
        errText,
      );
      return NextResponse.json(
        { success: false, error: "Konversi gagal. Silakan coba lagi." },
        { status: 500 },
      );
    }

    const data = (await response.json()) as ModelsLabResponse;

    // Immediate success
    if (data.status === "success" && data.output && data.output.length > 0) {
      return NextResponse.json(
        { success: true, chibiImageUrl: data.output[0] },
        { status: 200 },
      );
    }

    // Processing — poll fetch_result URL
    if (
      (data.status === "processing" || data.future_links) &&
      data.fetch_result
    ) {
      const chibiImageUrl = await fetchResult(data.fetch_result);
      return NextResponse.json(
        { success: true, chibiImageUrl },
        { status: 200 },
      );
    }

    // Error from API
    const errMsg =
      data.message || data.error || data.messege || "Konversi gagal.";
    console.error("[convert-chibi] ModelsLab response error:", errMsg);
    return NextResponse.json(
      { success: false, error: "Konversi gagal. Silakan coba lagi." },
      { status: 500 },
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
