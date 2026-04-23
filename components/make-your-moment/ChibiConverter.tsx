"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Download } from "lucide-react";
import { ChibiConverterProps } from "@/types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Button from "@/components/ui/Button";

type ConversionStatus =
  | "idle"
  | "converting"
  | "retrying"
  | "success"
  | "error"
  | "no_token";

const ChibiConverter: React.FC<ChibiConverterProps> = ({
  sourceFile,
  onConversionComplete,
  onConversionError,
}) => {
  const [status, setStatus] = useState<ConversionStatus>("idle");
  const [chibiImageUrl, setChibiImageUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [retryCountdown, setRetryCountdown] = useState(0);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopProgress = () => {
    if (progressRef.current) {
      clearInterval(progressRef.current);
      progressRef.current = null;
    }
  };

  const convertImage = async (attempt = 1) => {
    setStatus("converting");
    setChibiImageUrl(null);
    setProgress(0);

    progressRef.current = setInterval(() => {
      setProgress((prev) => Math.min(prev + 2, 88));
    }, 600);

    try {
      const formData = new FormData();
      formData.append("image", sourceFile);

      const response = await fetch("/api/convert-chibi", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      stopProgress();

      if (!data.success) {
        // Model loading — auto retry after countdown
        if (data.retryAfter && attempt <= 3) {
          const waitSec: number = data.retryAfter ?? 20;
          setStatus("retrying");
          setRetryCountdown(waitSec);

          const countdown = setInterval(() => {
            setRetryCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(countdown);
                convertImage(attempt + 1);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
          return;
        }

        // Token not configured
        if (data.needsToken) {
          setStatus("no_token");
          return;
        }

        setErrorMessage(data.error || "Konversi gagal.");
        setStatus("error");
        return;
      }

      setProgress(100);
      await new Promise((r) => setTimeout(r, 400));
      setChibiImageUrl(data.chibiImageUrl);
      setStatus("success");
    } catch (err) {
      stopProgress();
      console.error("Conversion error:", err);
      setErrorMessage("Konversi gagal. Periksa koneksi internet kamu.");
      setStatus("error");
    }
  };

  useEffect(() => {
    convertImage();
    return () => stopProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownload = () => {
    if (!chibiImageUrl) return;
    const link = document.createElement("a");
    link.href = chibiImageUrl;
    link.download = "chibi-toysmomento.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRetry = () => onConversionError();

  // ── Converting ──────────────────────────────────────────────
  if (status === "converting" || status === "idle") {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-16">
        <LoadingSpinner size="lg" />
        <div className="w-full max-w-xs">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Membuat chibi anime style...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <p className="text-xs text-gray-400 text-center">
          Proses AI membutuhkan 20–60 detik
        </p>
      </div>
    );
  }

  // ── Retrying (model loading) ─────────────────────────────────
  if (status === "retrying") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <LoadingSpinner size="lg" />
        <p className="text-primary font-semibold">Model AI sedang loading...</p>
        <p className="text-gray-500 text-sm">
          Otomatis mencoba lagi dalam{" "}
          <span className="font-bold text-primary">{retryCountdown}</span> detik
        </p>
        <p className="text-xs text-gray-400 max-w-xs">
          Ini normal saat model pertama kali digunakan. Tunggu sebentar ya!
        </p>
      </div>
    );
  }

  // ── No token ─────────────────────────────────────────────────
  if (status === "no_token") {
    return (
      <div className="flex flex-col items-center gap-5 py-10 text-center">
        <div className="text-5xl">🔑</div>
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">
            ModelsLab API Key Diperlukan
          </h3>
          <p className="text-gray-500 text-sm max-w-sm">
            Daftar gratis di ModelsLab — tidak perlu kartu kredit.
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left w-full max-w-sm">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            Setup (3 menit, gratis):
          </p>
          <ol className="text-sm text-gray-600 space-y-1.5 list-decimal list-inside">
            <li>
              Daftar di{" "}
              <a
                href="https://modelslab.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                modelslab.com
              </a>{" "}
              (bisa pakai Google)
            </li>
            <li>
              Buka{" "}
              <a
                href="https://modelslab.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Dashboard → Settings → API Key
              </a>
            </li>
            <li>Copy API key kamu</li>
            <li>
              Buka file{" "}
              <code className="bg-gray-200 px-1 rounded text-xs">
                .env.local
              </code>
            </li>
            <li>
              Ganti{" "}
              <code className="bg-gray-200 px-1 rounded text-xs">
                your_modelslab_key_here
              </code>{" "}
              dengan key kamu
            </li>
            <li>Restart dev server</li>
          </ol>
        </div>
        <Button
          variant="secondary"
          onClick={handleRetry}
          className="w-full max-w-xs"
        >
          Coba Lagi
        </Button>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────
  if (status === "error") {
    return (
      <div className="flex flex-col items-center gap-5 py-16 text-center">
        <div className="text-4xl">😕</div>
        <div>
          <p className="font-semibold text-gray-800 mb-1">Konversi Gagal</p>
          <p className="text-sm text-gray-500 max-w-xs">
            {errorMessage || "Terjadi kesalahan. Silakan coba lagi."}
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleRetry}
          className="w-full max-w-xs"
        >
          Coba Lagi
        </Button>
      </div>
    );
  }

  // ── Success ──────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <div className="text-center">
        <h2 className="text-2xl font-display font-bold text-primary mb-2">
          Chibi Kamu Sudah Jadi! 🎉
        </h2>
        <p className="text-gray-600 text-sm">
          Lanjut lihat visualisasi 3D figure kamu!
        </p>
      </div>

      {chibiImageUrl && (
        <div className="relative w-64 h-64 rounded-2xl overflow-hidden border-4 border-brand-200 shadow-lg bg-white">
          <Image
            src={chibiImageUrl}
            alt="Hasil konversi chibi dari foto kamu"
            fill
            className="object-contain"
            unoptimized
          />
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <Button
          variant="secondary"
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 flex-1"
          aria-label="Download gambar chibi"
        >
          <Download className="w-4 h-4" />
          Download
        </Button>
        <Button
          variant="primary"
          onClick={() => chibiImageUrl && onConversionComplete(chibiImageUrl)}
          className="flex-1"
          aria-label="Lanjut ke visualisasi 3D"
        >
          Lanjut ke 3D →
        </Button>
      </div>
    </div>
  );
};

export default ChibiConverter;
