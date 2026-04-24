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
  | "success"
  | "error"
  | "no_token";

const PROGRESS_STAGES = [
  { pct: 20, label: "Menganalisis foto...", ms: 1000 },
  { pct: 45, label: "Menerapkan style chibi...", ms: 5000 },
  { pct: 70, label: "Menyempurnakan detail...", ms: 12000 },
  { pct: 88, label: "Hampir selesai...", ms: 22000 },
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
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];
  };

  const convertImage = async () => {
    setStatus("converting");
    setChibiImageUrl(null);
    setProgress(5);
    setProgressLabel("Memulai...");

    PROGRESS_STAGES.forEach(({ pct, label, ms }) => {
      const t = setTimeout(() => {
        setProgress(pct);
        setProgressLabel(label);
      }, ms);
      timerRefs.current.push(t);
    });

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
        if (data.needsToken) {
          setStatus("no_token");
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
            AI sedang mengubah foto kamu ke style chibi...
          </p>
          <p className="text-xs text-gray-400">
            Proses membutuhkan 15–30 detik
          </p>
        </div>
      </div>
    );
  }

  // ── No token ─────────────────────────────────────────────────
  if (status === "no_token") {
    return (
      <div className="flex flex-col items-center gap-5 py-8 text-center">
        <div className="text-5xl">🔑</div>
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">
            Setup API Key (2 menit)
          </h3>
          <p className="text-gray-500 text-sm max-w-sm">
            Untuk menghasilkan chibi berkualitas, perlu fal.ai API key.
            <strong className="text-primary"> Gratis $5 credits</strong> saat
            signup — cukup untuk ratusan konversi.
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left w-full max-w-sm">
          <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
            <li>
              Daftar di{" "}
              <a
                href="https://fal.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline font-medium"
              >
                fal.ai
              </a>{" "}
              (pakai Google, gratis)
            </li>
            <li>
              Buka{" "}
              <a
                href="https://fal.ai/dashboard/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline font-medium"
              >
                fal.ai/dashboard/keys
              </a>{" "}
              → Create Key
            </li>
            <li>
              Copy key → buka file{" "}
              <code className="bg-gray-200 px-1 rounded text-xs">
                .env.local
              </code>
            </li>
            <li>
              Ganti{" "}
              <code className="bg-gray-200 px-1 rounded text-xs">
                your_fal_key_here
              </code>{" "}
              dengan key kamu
            </li>
            <li>
              Restart dev server:{" "}
              <code className="bg-gray-200 px-1 rounded text-xs">
                npm run dev
              </code>
            </li>
          </ol>
        </div>
        <Button
          variant="secondary"
          onClick={handleRetry}
          className="w-full max-w-xs"
        >
          Sudah Setup, Coba Lagi
        </Button>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────
  if (status === "error") {
    return (
      <div className="flex flex-col items-center gap-5 py-16 text-center">
        <div className="text-4xl">😕</div>
        <p className="font-semibold text-gray-800">Konversi Gagal</p>
        <p className="text-sm text-gray-500 max-w-xs">{errorMessage}</p>
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
        <p className="text-gray-600 text-sm">Lanjut lihat preview 3D figure!</p>
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
        >
          <Download className="w-4 h-4" />
          Download
        </Button>
        <Button
          variant="primary"
          onClick={() => chibiImageUrl && onConversionComplete(chibiImageUrl)}
          className="flex-1"
        >
          Lanjut ke 3D →
        </Button>
      </div>
    </div>
  );
};

export default ChibiConverter;
