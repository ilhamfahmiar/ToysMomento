import { NextRequest, NextResponse } from "next/server";

/**
 * Konversi foto ke chibi menggunakan Hugging Face Spaces API
 *
 * Menggunakan AnimeGANv2 yang tersedia sebagai public Gradio Space.
 * GRATIS — tidak butuh API key, tidak ada biaya.
 *
 * Space: https://huggingface.co/spaces/akhaliq/AnimeGANv2
 * Model: AnimeGANv2 — mengubah foto ke style anime/cartoon
 */

const HF_SPACE_URL = "https://akhaliq-animeganv2.hf.space/run/predict";

const TIMEOUT_MS = 60000;

export async function POST(request: NextRequest) {
  try {
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
    const dataUrl = `data:${mimeType};base64,${imageBase64}`;

    // Call Hugging Face Space Gradio API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(HF_SPACE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: [dataUrl],
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error(
        "[convert-chibi] HF Space error:",
        response.status,
        errText,
      );

      // Space might be sleeping — try to wake it
      if (response.status === 503 || response.status === 502) {
        return NextResponse.json(
          {
            success: false,
            error: "Server sedang loading, coba lagi dalam 30 detik.",
            retryAfter: 30,
          },
          { status: 503 },
        );
      }

      return NextResponse.json(
        { success: false, error: "Konversi gagal. Silakan coba lagi." },
        { status: 500 },
      );
    }

    const result = await response.json();

    // Gradio returns: { data: [{ path: "...", url: "..." }] }
    // or { data: ["data:image/..."] }
    const outputData = result?.data?.[0];

    let chibiImageUrl: string | null = null;

    if (typeof outputData === "string") {
      chibiImageUrl = outputData;
    } else if (outputData?.url) {
      chibiImageUrl = outputData.url;
    } else if (outputData?.path) {
      // Construct full URL from path
      const baseUrl = new URL(HF_SPACE_URL);
      chibiImageUrl = `${baseUrl.origin}/file=${outputData.path}`;
    }

    if (!chibiImageUrl) {
      console.error(
        "[convert-chibi] Unexpected response format:",
        JSON.stringify(result).slice(0, 200),
      );
      return NextResponse.json(
        {
          success: false,
          error: "Konversi gagal. Format response tidak dikenali.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, chibiImageUrl }, { status: 200 });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json(
        { success: false, error: "Timeout. Silakan coba lagi." },
        { status: 504 },
      );
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[convert-chibi] Error:", message);
    return NextResponse.json(
      { success: false, error: "Konversi gagal. Silakan coba lagi." },
      { status: 500 },
    );
  }
}
