"use client";

import React, { useRef, useState, useCallback } from "react";
import Image from "next/image";
import { UploadCloud, ImageIcon, X } from "lucide-react";
import { PhotoUploaderProps } from "@/types";
import { validateFile } from "@/lib/validateFile";
import ErrorMessage from "@/components/ui/ErrorMessage";
import Button from "@/components/ui/Button";

type ErrorType = "format" | "size" | null;

const ERROR_MESSAGES: Record<"format" | "size", string> = {
  format: "Format file tidak didukung. Gunakan JPG, JPEG, atau PNG.",
  size: "Ukuran file terlalu besar. Maksimal 10MB.",
};

const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  onFileAccepted,
  onFileRejected,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [acceptedFile, setAcceptedFile] = useState<File | null>(null);
  const [error, setError] = useState<ErrorType>(null);

  const processFile = useCallback(
    (file: File) => {
      setError(null);
      setPreviewUrl(null);
      setAcceptedFile(null);

      const result = validateFile({ type: file.type, size: file.size });

      if (!result.valid) {
        setError(result.reason);
        onFileRejected(result.reason);
        return;
      }

      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setAcceptedFile(file);
    },
    [onFileRejected],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemove = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setAcceptedFile(null);
    setError(null);
  };

  const handleStartConversion = () => {
    if (acceptedFile) {
      onFileAccepted(acceptedFile);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-4">
      {/* Drop zone */}
      {!previewUrl && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Area upload foto. Klik atau seret foto ke sini."
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          className={`
            relative flex flex-col items-center justify-center gap-4 p-10 rounded-2xl border-2 border-dashed cursor-pointer
            transition-all duration-200 select-none
            focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
            ${
              isDragging
                ? "border-primary bg-brand-50 scale-[1.01]"
                : "border-gray-300 bg-gray-50 hover:border-primary hover:bg-brand-50"
            }
          `}
        >
          <div
            className={`
              flex items-center justify-center w-16 h-16 rounded-full transition-colors duration-200
              ${isDragging ? "bg-primary/10" : "bg-brand-100"}
            `}
          >
            <UploadCloud
              className={`w-8 h-8 transition-colors duration-200 ${isDragging ? "text-primary" : "text-brand-700"}`}
              aria-hidden="true"
            />
          </div>

          <div className="text-center">
            <p className="text-base font-semibold text-gray-800">
              Seret foto ke sini
            </p>
            <p className="text-sm text-gray-500 mt-1">
              atau{" "}
              <span className="text-primary font-medium underline underline-offset-2">
                pilih dari perangkat
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <ImageIcon className="w-4 h-4" aria-hidden="true" />
            <span>JPG, JPEG, PNG · Maks. 10MB</span>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        id="photo-upload-input"
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        aria-label="Upload foto"
        className="sr-only"
        onChange={handleFileChange}
      />

      {/* Error message */}
      {error && (
        <ErrorMessage
          message={ERROR_MESSAGES[error]}
          onRetry={() => {
            setError(null);
            inputRef.current?.click();
          }}
        />
      )}

      {/* Preview */}
      {previewUrl && (
        <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white">
          <div className="relative w-full aspect-square">
            <Image
              src={previewUrl}
              alt="Preview foto yang diupload"
              fill
              className="object-contain"
              sizes="(max-width: 512px) 100vw, 512px"
            />
          </div>

          {/* Remove button */}
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Hapus foto"
            className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-full bg-white/90 shadow hover:bg-red-50 hover:text-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>

          <div className="p-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 truncate">
              {acceptedFile?.name}
            </p>
          </div>
        </div>
      )}

      {/* Start conversion button */}
      {previewUrl && acceptedFile && (
        <Button
          variant="primary"
          onClick={handleStartConversion}
          className="w-full text-base py-3"
          aria-label="Mulai konversi foto ke chibi"
        >
          Mulai Konversi
        </Button>
      )}
    </div>
  );
};

export default PhotoUploader;
