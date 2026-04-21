"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StepIndicator from "@/components/make-your-moment/StepIndicator";
import PhotoUploader from "@/components/make-your-moment/PhotoUploader";
import ChibiConverter from "@/components/make-your-moment/ChibiConverter";
import ThreeDVisualizer from "@/components/make-your-moment/ThreeDVisualizer";
import { MakeYourMomentState } from "@/types";

const initialState: MakeYourMomentState = {
  currentStep: "upload",
  uploadedFile: null,
  uploadPreviewUrl: null,
  chibiImageUrl: null,
  conversionStatus: "idle",
  visualizationStatus: "idle",
  errorMessage: null,
};

export default function MakeYourMomentPage() {
  const router = useRouter();
  const [state, setState] = useState<MakeYourMomentState>(initialState);

  // Step: upload → chibi
  const handleFileAccepted = (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setState((prev) => ({
      ...prev,
      uploadedFile: file,
      uploadPreviewUrl: previewUrl,
      currentStep: "chibi",
      conversionStatus: "converting",
      errorMessage: null,
    }));
  };

  // PhotoUploader already handles error display internally
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleFileRejected = (_reason: "format" | "size") => {};

  // Step: chibi → 3d
  const handleConversionComplete = (chibiImageUrl: string) => {
    setState((prev) => ({
      ...prev,
      chibiImageUrl,
      currentStep: "3d",
      conversionStatus: "success",
      visualizationStatus: "loading",
      errorMessage: null,
    }));
  };

  // Conversion error → back to upload, reset state
  const handleConversionError = () => {
    if (state.uploadPreviewUrl) {
      URL.revokeObjectURL(state.uploadPreviewUrl);
    }
    setState(initialState);
  };

  // Step: 3d → navigate to order form
  const handleOrderNowClick = () => {
    router.push("/#order-form");
  };

  return (
    <>
      <Navbar />
      <main
        id="main-content"
        className="min-h-screen bg-gradient-to-b from-brand-50 to-white"
      >
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-10 text-center">
            <h1 className="font-display text-3xl font-bold text-primary sm:text-4xl">
              Make Your Moment
            </h1>
            <p className="mt-3 text-gray-600 text-base sm:text-lg">
              Unggah fotomu, dapatkan karakter chibi, dan lihat visualisasi
              figure 100cm kamu!
            </p>
          </div>

          {/* Step Indicator */}
          <div className="mb-10">
            <StepIndicator currentStep={state.currentStep} />
          </div>

          {/* Step Content */}
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6 sm:p-10">
            {state.currentStep === "upload" && (
              <section aria-labelledby="step-upload-heading">
                <h2
                  id="step-upload-heading"
                  className="mb-6 text-center text-xl font-semibold text-gray-800"
                >
                  Upload Foto Kamu
                </h2>
                <PhotoUploader
                  onFileAccepted={handleFileAccepted}
                  onFileRejected={handleFileRejected}
                />
              </section>
            )}

            {state.currentStep === "chibi" && state.uploadedFile && (
              <section aria-labelledby="step-chibi-heading">
                <h2
                  id="step-chibi-heading"
                  className="mb-6 text-center text-xl font-semibold text-gray-800"
                >
                  Konversi ke Chibi
                </h2>
                <ChibiConverter
                  sourceFile={state.uploadedFile}
                  onConversionComplete={handleConversionComplete}
                  onConversionError={handleConversionError}
                />
              </section>
            )}

            {state.currentStep === "3d" && state.chibiImageUrl && (
              <section aria-labelledby="step-3d-heading">
                <h2
                  id="step-3d-heading"
                  className="mb-6 text-center text-xl font-semibold text-gray-800"
                >
                  Visualisasi 3D Figure
                </h2>
                <ThreeDVisualizer
                  chibiImageUrl={state.chibiImageUrl}
                  onOrderNowClick={handleOrderNowClick}
                />
              </section>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
