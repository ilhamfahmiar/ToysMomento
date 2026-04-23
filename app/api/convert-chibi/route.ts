import { NextRequest, NextResponse } from "next/server";

/**
 * API Route untuk convert-chibi
 *
 * Konversi sebenarnya dilakukan di client-side menggunakan Canvas API
 * (lib/browserChibiConverter.ts) — 100% gratis, tidak butuh API key.
 *
 * Route ini hanya menerima gambar, encode ke base64, dan return ke client
 * untuk diproses di browser.
 */

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

    // Return image as data URL for client-side processing
    const imageBuffer = await imageFile.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString("base64");
    const mimeType = imageFile.type || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${imageBase64}`;

    return NextResponse.json(
      {
        success: true,
        imageDataUrl: dataUrl,
        processOnClient: true,
      },
      { status: 200 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[convert-chibi] Error:", message);
    return NextResponse.json(
      { success: false, error: "Gagal memproses gambar." },
      { status: 500 },
    );
  }
}
