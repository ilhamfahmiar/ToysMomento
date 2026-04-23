"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { ChibiConverterProps } from "@/types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Button from "@/components/ui/Button";

type ConversionStatus =
  | "idle"
  | "converting"
  | "success"
  | "error"
  | "no_token";

interface ConversionResult {
  glbUrl: string;
  thumbnailUrl?: string;
}

// Extend props to pass GLB URL to parent
interface ExtendedChibiConverterProps extends ChibiConverterProps {
  onConversionComplete: (glbUrl: string) => void;
}

const ChibiConverter: React.FC<ExtendedChibiConverterProps> = ({
  sourceFile,
  onConversionComplete,
  onConversionError,
}) => {
  const [status, setStatus] = useState<ConversionStatus>("idle");
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("Memulai...");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopProgress = () => {
    if (progressRef.current) {
      clearInterval(progressRef.current);
      progressRef.current = null;
    }
  };

  const convertImage = async () => {
    setStatus("converting");
    setResult(null);
    setProgress(0);

    // Simulate progress stages
    const stages = [
      { pct: 15, label: "Menganalisis foto...", delay: 2000 },
      { pct: 35, label: "Membuat model 3D...", delay: 8000 },
      { pct: 60, label: "Menambahkan tekstur...", delay: 15000 },
      { pct: 80, label: "Finishing model...", delay: 25000 },
      { pct: 90, label: "Hampir selesai...", delay: 40000 },
    ];

    let stageIdx = 0;
    progressRef.current = setInterval(() => {
      if (stageIdx < stages.length) {
        setProgress(stages[stageIdx].pct);
        setProgressLabel(stages[stageIdx].label);
        stageIdx++;
      }
    }, 8000);

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
      await new Promise((r) => setTimeout(r, 500));

      setResult({ glbUrl: data.glbUrl, thumbnailUrl: data.thumbnailUrl });
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
            Meshy AI sedang membuat model 3D kamu
          </p>
          <p className="text-xs text-gray-400">
            Proses membutuhkan 1–3 menit — sama seperti MakerWorld PrintU
          </p>
        </div>
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
            Meshy AI API Key Diperlukan
          </h3>
          <p className="text-gray-500 text-sm max-w-sm">
            Meshy AI adalah teknologi yang sama dipakai MakerWorld PrintU. Free
            tier: 200 credits/bulan (~20 model 3D gratis).
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
                href="https://app.meshy.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                app.meshy.ai
              </a>{" "}
              (bisa pakai Google)
            </li>
            <li>
              Buka{" "}
              <a
                href="https://app.meshy.ai/api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                app.meshy.ai/api
              </a>{" "}
              → Generate API Key
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
                your_meshy_key_here
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
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="text-center">
        <h2 className="text-2xl font-display font-bold text-primary mb-2">
          Model 3D Kamu Sudah Jadi! 🎉
        </h2>
        <p className="text-gray-600 text-sm">
          Model 3D chibi kamu siap. Lanjut lihat preview interaktif!
        </p>
      </div>

      {/* Thumbnail preview */}
      {result?.thumbnailUrl && (
        <div className="relative w-48 h-48 rounded-2xl overflow-hidden border-4 border-brand-200 shadow-lg bg-white">
          <Image
            src={result.thumbnailUrl}
            alt="Preview model 3D chibi kamu"
            fill
            className="object-contain"
            unoptimized
          />
        </div>
      )}

      <div className="flex items-center gap-2 bg-brand-50 border border-brand-200 rounded-full px-4 py-2 text-sm text-brand-700">
        <span>✨</span>
        <span>Powered by Meshy AI — teknologi yang sama dengan MakerWorld</span>
      </div>

      <Button
        variant="primary"
        onClick={() => result?.glbUrl && onConversionComplete(result.glbUrl)}
        className="w-full max-w-xs"
        aria-label="Lanjut ke preview 3D interaktif"
      >
        Lihat Preview 3D →
      </Button>
    </div>
  );
};

export default ChibiConverter;
