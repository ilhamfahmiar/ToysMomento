import { NextRequest, NextResponse } from "next/server";
import { orderFormSchema } from "@/lib/orderFormSchema";

export async function POST(request: NextRequest) {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Format request tidak valid." },
        { status: 400 },
      );
    }

    // Validasi input menggunakan orderFormSchema
    const parseResult = orderFormSchema.safeParse(body);

    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0];
      return NextResponse.json(
        {
          success: false,
          error: firstError?.message ?? "Data tidak valid.",
        },
        { status: 400 },
      );
    }

    const { fullName, phoneNumber, email, customizationNotes } =
      parseResult.data;

    // TODO: Integrasikan dengan email service (misalnya Nodemailer, Resend, SendGrid)
    // untuk mengirim notifikasi ke tim ToysMomento dan konfirmasi ke pelanggan.
    // Contoh: await sendOrderNotification({ fullName, phoneNumber, email, customizationNotes });
    console.log("[submit-order] Pesanan baru diterima:", {
      fullName,
      phoneNumber,
      email,
      customizationNotes: customizationNotes ?? "(tidak ada catatan)",
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Pesanan berhasil dikirim. Tim ToysMomento akan menghubungi Anda dalam 1x24 jam.",
      },
      { status: 200 },
    );
  } catch {
    // Tidak mengekspos stack trace ke client
    return NextResponse.json(
      { success: false, error: "Gagal mengirim pesanan. Silakan coba lagi." },
      { status: 500 },
    );
  }
}
