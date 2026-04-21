"use client";

import React from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import * as LucideIcons from "lucide-react";
import type { ProductSubSection } from "@/types";

interface CustomizationSubSectionProps {
  data: ProductSubSection;
}

const CustomizationSubSection: React.FC<CustomizationSubSectionProps> = ({
  data,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="py-12">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Gambar Placeholder — Kiri */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-brand-50 rounded-2xl aspect-square flex items-center justify-center order-last md:order-first"
          aria-label="Ilustrasi pilihan kustomisasi figure ToysMomento"
        >
          <div className="text-center p-8">
            <div className="w-24 h-24 bg-brand-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-4xl">🎨</span>
            </div>
            <p className="text-brand-700 font-medium text-sm">
              Kustomisasi Penuh
            </p>
          </div>
        </motion.div>

        {/* Teks — Kanan */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h3 className="text-2xl md:text-3xl font-bold font-display text-gray-900 mb-4">
            {data.title}
          </h3>
          <p className="text-gray-600 leading-relaxed mb-8">
            {data.description}
          </p>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.features.map((feature, index) => {
              const IconComponent = (
                LucideIcons as unknown as Record<
                  string,
                  React.ComponentType<{ className?: string }>
                >
              )[feature.icon];

              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                  }
                  transition={{
                    duration: 0.5,
                    ease: "easeOut",
                    delay: index * 0.1,
                  }}
                  className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
                      {IconComponent ? (
                        <IconComponent className="w-4 h-4 text-brand-600" />
                      ) : (
                        <span className="text-brand-600 text-xs font-bold">
                          {feature.icon[0]}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">
                        {feature.title}
                      </h4>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CustomizationSubSection;
