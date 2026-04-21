"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { orderFormSchema, type OrderFormData } from "@/lib/orderFormSchema";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";

const OrderFormSection: React.FC = () => {
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: OrderFormData) => {
    setSubmitStatus("idle");
    try {
      const response = await fetch("/api/submit-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Server error");
      }

      const result = await response.json();
      if (result.success) {
        setSubmitStatus("success");
        reset();
      } else {
        setSubmitStatus("error");
      }
    } catch {
      setSubmitStatus("error");
    }
  };

  const handleRetry = () => {
    setSubmitStatus("idle");
  };

  return (
    <section id="order-form" className="bg-white py-20">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Heading */}
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-gray-900 mb-4">
              Pesan Sekarang
            </h2>
            <div className="w-16 h-1 bg-primary rounded-full mx-auto mb-4" />
            <p className="text-gray-600">
              Isi form di bawah dan tim kami akan menghubungi Anda dalam 1x24
              jam
            </p>
          </div>

          {/* Success State */}
          {submitStatus === "success" && (
            <div
              role="alert"
              className="bg-brand-50 border border-brand-200 rounded-2xl p-6 text-center mb-8"
            >
              <div className="text-4xl mb-3">🎉</div>
              <h3 className="font-bold text-brand-800 text-lg mb-2">
                Pesanan Terkirim!
              </h3>
              <p className="text-brand-700">
                Terima kasih! Tim ToysMomento akan menghubungi Anda dalam 1x24
                jam.
              </p>
            </div>
          )}

          {/* Error State */}
          {submitStatus === "error" && (
            <div className="mb-6">
              <ErrorMessage
                message="Gagal mengirim pesanan. Silakan coba lagi."
                onRetry={handleRetry}
              />
            </div>
          )}

          {/* Form */}
          {submitStatus !== "success" && (
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="flex flex-col gap-6"
            >
              {/* Nama Lengkap */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="fullName"
                  className="text-sm font-medium text-gray-700"
                >
                  Nama Lengkap{" "}
                  <span aria-hidden="true" className="text-red-500">
                    *
                  </span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Masukkan nama lengkap Anda"
                  aria-required="true"
                  aria-describedby={
                    errors.fullName ? "fullName-error" : undefined
                  }
                  className={`w-full px-4 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                    errors.fullName
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300 bg-white"
                  }`}
                  {...register("fullName")}
                />
                {errors.fullName && (
                  <p
                    id="fullName-error"
                    role="alert"
                    className="text-red-600 text-sm"
                  >
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              {/* Nomor Telepon */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="phoneNumber"
                  className="text-sm font-medium text-gray-700"
                >
                  Nomor Telepon{" "}
                  <span aria-hidden="true" className="text-red-500">
                    *
                  </span>
                </label>
                <input
                  id="phoneNumber"
                  type="tel"
                  autoComplete="tel"
                  placeholder="Contoh: 08123456789"
                  aria-required="true"
                  aria-describedby={
                    errors.phoneNumber ? "phoneNumber-error" : undefined
                  }
                  className={`w-full px-4 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                    errors.phoneNumber
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300 bg-white"
                  }`}
                  {...register("phoneNumber")}
                />
                {errors.phoneNumber && (
                  <p
                    id="phoneNumber-error"
                    role="alert"
                    className="text-red-600 text-sm"
                  >
                    {errors.phoneNumber.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email{" "}
                  <span aria-hidden="true" className="text-red-500">
                    *
                  </span>
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Contoh: nama@email.com"
                  aria-required="true"
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={`w-full px-4 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                    errors.email
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300 bg-white"
                  }`}
                  {...register("email")}
                />
                {errors.email && (
                  <p
                    id="email-error"
                    role="alert"
                    className="text-red-600 text-sm"
                  >
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Catatan Kustomisasi */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="customizationNotes"
                  className="text-sm font-medium text-gray-700"
                >
                  Catatan Kustomisasi{" "}
                  <span className="text-gray-400 font-normal">(opsional)</span>
                </label>
                <textarea
                  id="customizationNotes"
                  rows={4}
                  placeholder="Ceritakan detail kustomisasi yang Anda inginkan: pose, ekspresi, pakaian, aksesori, ukuran, dll."
                  aria-describedby={
                    errors.customizationNotes
                      ? "customizationNotes-error"
                      : undefined
                  }
                  className={`w-full px-4 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none ${
                    errors.customizationNotes
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300 bg-white"
                  }`}
                  {...register("customizationNotes")}
                />
                {errors.customizationNotes && (
                  <p
                    id="customizationNotes-error"
                    role="alert"
                    className="text-red-600 text-sm"
                  >
                    {errors.customizationNotes.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="w-full text-base py-4 flex items-center justify-center gap-2"
                aria-label="Kirim Pesanan"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  "Kirim Pesanan"
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default OrderFormSection;
