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
  | "error";

const PROGRESS_STAGES = [
  { pct: 20, label: "Menganalisis foto...", ms: 1000 },
  { pct: 50, label: "Menerapkan style anime...", ms: 4000 },
  { pct: 80, label: "Menyempurnakan detail...", ms: 10000 },
  { pct: 90, label: "Hampir selesai...", ms: 18000 },
];

const ChibiConverter: React.FC<ChibiConverterProps> = ({
  sourceFile,
  onConversionComplete,
  onConversionError,
}) => {
  const [status, setStatus] = useState<ConversionStatus>("idle");
  const [chibiImageUrl, setChibiImageUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("Memulai...");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [retryCountdown, setRetryCountdown] = useState(0);
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];
  };

  const startProgressAnimation = () => {
    PROGRESS_STAGES.forEach(({ pct, label, ms }) => {
      const t = setTimeout(() => {
        setProgress(pct);
        setProgressLabel(label);
      }, ms);
      timerRefs.current.push(t);
    });
  };

  const convertImage = async (attempt = 1) => {
    setStatus("converting");
    setChibiImageUrl(null);
    setProgress(5);
    setProgressLabel("Memulai...");
    startProgressAnimation();

    try {
      const formData = new FormData();
      formData.append("image", sourceFile);

      const response = await fetch("/api/convert-chibi", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      clearTimers();

      if (!data.success) {
        // Server loading — auto retry
        if (data.retryAfter && attempt <= 3) {
          const waitSec: number = data.retryAfter ?? 30;
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

        setErrorMessage(data.error || "Konversi gagal.");
        setStatus("error");
        return;
      }

      setProgress(100);
      setProgressLabel("Selesai!");
      await new Promise((r) => setTimeout(r, 400));

      setChibiImageUrl(data.chibiImageUrl);
      setStatus("success");
    } catch (err) {
      clearTimers();
      console.error("Conversion error:", err);
      setErrorMessage("Konversi gagal. Periksa koneksi internet kamu.");
      setStatus("error");
    }
  };

  useEffect(() => {
    convertImage();
    return () => clearTimers();
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
            <span>{progressLabel}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-primary h-2.5 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm text-gray-600 font-medium">
            AI sedang mengubah foto kamu ke style anime chibi...
          </p>
          <p className="text-xs text-gray-400">
            Proses membutuhkan 10–30 detik · Gratis tanpa API key
          </p>
        </div>
      </div>
    );
  }

  // ── Retrying ─────────────────────────────────────────────────
  if (status === "retrying") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <LoadingSpinner size="lg" />
        <p className="text-primary font-semibold">
          Server AI sedang loading...
        </p>
        <p className="text-gray-500 text-sm">
          Otomatis mencoba lagi dalam{" "}
          <span className="font-bold text-primary">{retryCountdown}</span> detik
        </p>
        <p className="text-xs text-gray-400 max-w-xs">
          Ini normal saat pertama kali digunakan. Tunggu sebentar ya!
        </p>
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
          Foto kamu sudah diubah ke style anime chibi. Lanjut lihat preview 3D!
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

      <div className="flex items-center gap-2 bg-brand-50 border border-brand-200 rounded-full px-4 py-2 text-sm text-brand-700">
        <span>✨</span>
        <span>Powered by AnimeGANv2 — 100% gratis</span>
      </div>

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
          aria-label="Lanjut ke preview 3D"
        >
          Lanjut ke 3D →
        </Button>
      </div>
    </div>
  );
};

export default ChibiConverter;
