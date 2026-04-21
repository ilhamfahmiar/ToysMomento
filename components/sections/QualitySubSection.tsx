"use client";

import React from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import * as LucideIcons from "lucide-react";
import type { ProductSubSection } from "@/types";

interface QualitySubSectionProps {
  data: ProductSubSection;
}

const QualitySubSection: React.FC<QualitySubSectionProps> = ({ data }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="py-12">
      {/* Heading + Deskripsi */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center mb-10"
      >
        <h3 className="text-2xl md:text-3xl font-bold font-display text-gray-900 mb-4">
          {data.title}
        </h3>
        <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
          {data.description}
        </p>
      </motion.div>

      {/* Feature Cards Grid 2x2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{
                duration: 0.5,
                ease: "easeOut",
                delay: index * 0.1,
              }}
              className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
                  {IconComponent ? (
                    <IconComponent className="w-5 h-5 text-brand-600" />
                  ) : (
                    <span className="text-brand-600 text-sm font-bold">
                      {feature.icon[0]}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default QualitySubSection;
