import React from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import type { TestimoniCardProps } from "@/types";

const TestimoniCard: React.FC<TestimoniCardProps> = ({
  customerName,
  review,
  productImageUrl,
  rating,
}) => {
  // Ambil inisial dari nama pelanggan
  const initials = customerName
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <article className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col gap-4">
      {/* Header: Avatar + Nama */}
      <div className="flex items-center gap-3">
        {productImageUrl ? (
          <div className="relative w-16 h-16 flex-shrink-0">
            <Image
              src={productImageUrl}
              alt={`Foto figure ${customerName}`}
              width={64}
              height={64}
              sizes="64px"
              className="w-16 h-16 rounded-full object-cover"
            />
          </div>
        ) : (
          <div
            className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0"
            aria-label={`Avatar ${customerName}`}
          >
            <span className="text-brand-700 font-bold text-lg">{initials}</span>
          </div>
        )}

        <div>
          <p className="font-semibold text-gray-900">{customerName}</p>
          {rating !== undefined && (
            <div
              className="flex items-center gap-0.5 mt-1"
              aria-label={`Rating ${rating} dari 5 bintang`}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < rating
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ulasan */}
      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
        {review}
      </p>
    </article>
  );
};

export default TestimoniCard;
