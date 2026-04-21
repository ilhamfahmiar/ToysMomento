"use client";

import React, { Component, ErrorInfo, ReactNode, Suspense } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { ThreeDVisualizerProps } from "@/types";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// ============================================================
// React Error Boundary
// ============================================================

interface ErrorBoundaryState {
  hasError: boolean;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

class WebGLErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static getDerivedStateFromError(_error: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ThreeDVisualizer error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// ============================================================
// Fallback 2D View (when WebGL is unavailable)
// ============================================================

function FallbackView({ chibiImageUrl }: { chibiImageUrl: string }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl">
      <div className="relative w-48 h-48">
        <Image
          src={chibiImageUrl}
          alt="Gambar chibi kamu"
          fill
          className="object-contain"
          unoptimized
        />
      </div>
      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        <span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
          Visualisasi 3D tidak tersedia di browser ini
        </span>
      </div>
    </div>
  );
}

// ============================================================
// 3D Scene — loaded dynamically (no SSR)
// ============================================================

const ThreeDScene = dynamic(() => import("./ThreeDScene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  ),
});

// ============================================================
// Main ThreeDVisualizer Component
// ============================================================

const ThreeDVisualizer: React.FC<ThreeDVisualizerProps> = ({
  chibiImageUrl,
  onOrderNowClick,
}) => {
  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-display font-bold text-primary mb-2">
          Visualisasi 3D Figure Kamu
        </h2>
        <p className="text-gray-600 text-sm">
          Putar figure dengan drag. Ini adalah preview figure 100cm kamu!
        </p>
      </div>

      {/* 3D Canvas Container */}
      <div
        className="w-full max-w-md aspect-square rounded-2xl overflow-hidden border border-gray-200 shadow-lg bg-gradient-to-b from-gray-50 to-gray-100"
        style={{ minHeight: 320 }}
      >
        <WebGLErrorBoundary
          fallback={<FallbackView chibiImageUrl={chibiImageUrl} />}
        >
          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center">
                <LoadingSpinner size="lg" />
              </div>
            }
          >
            <ThreeDScene chibiImageUrl={chibiImageUrl} />
          </Suspense>
        </WebGLErrorBoundary>
      </div>

      {/* Order Now Button */}
      <Button
        variant="primary"
        onClick={onOrderNowClick}
        aria-label="Order figure Nendoroid kamu sekarang"
        className="w-full max-w-xs"
      >
        Order Now 🎉
      </Button>

      <p className="text-xs text-gray-400 text-center max-w-xs">
        Figure 100cm akan dibuat sesuai dengan chibi kamu. Tim kami akan
        menghubungi kamu setelah order dikonfirmasi.
      </p>
    </div>
  );
};

export default ThreeDVisualizer;
