import { NextRequest, NextResponse } from "next/server";

const HF_API_TOKEN = process.env.HF_API_TOKEN;

/**
 * Hugging Face Inference API — image-to-image
 * Model: Linaqruf/animagine-xl (anime style, free tier)
 *
 * Free tier: ~$0 untuk beberapa ratus request/bulan
 * Daftar di: https://huggingface.co/join
 * Token di: https://huggingface.co/settings/tokens
 */
const HF_MODEL_URL =
  "https://api-inference.huggingface.co/models/Linaqruf/animagine-xl";

export async function POST(request: NextRequest) {
  try {
    // Cek token
    if (!HF_API_TOKEN || HF_API_TOKEN === "your_hf_token_here") {
      return NextResponse.json(
        {
          success: false,
          error: "HF_API_TOKEN belum dikonfigurasi.",
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

    // Convert file to blob for HF API
    const imageBuffer = await imageFile.arrayBuffer();
    const imageBlob = new Blob([imageBuffer], { type: imageFile.type });

    // Call Hugging Face Inference API
    const response = await fetch(HF_MODEL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_TOKEN}`,
        "Content-Type": imageFile.type,
        "x-use-cache": "false",
      },
      body: imageBlob,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[convert-chibi] HF API error:", response.status, errText);

      // Model loading (503) — retry after delay
      if (response.status === 503) {
        return NextResponse.json(
          {
            success: false,
            error: "Model sedang loading, coba lagi dalam 20 detik.",
            retryAfter: 20,
          },
          { status: 503 },
        );
      }

      return NextResponse.json(
        { success: false, error: "Konversi gagal. Silakan coba lagi." },
        { status: 500 },
      );
    }

    // HF returns image blob directly
    const resultBuffer = await response.arrayBuffer();
    const resultBase64 = Buffer.from(resultBuffer).toString("base64");
    const contentType = response.headers.get("content-type") || "image/jpeg";
    const chibiImageUrl = `data:${contentType};base64,${resultBase64}`;

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
