"use client";

import React from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import * as LucideIcons from "lucide-react";
import type { ProductSubSection } from "@/types";

interface MaterialSubSectionProps {
  data: ProductSubSection;
}

const MaterialSubSection: React.FC<MaterialSubSectionProps> = ({ data }) => {
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

      {/* 4 Feature Cards dalam Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
              className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow text-center"
            >
              <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                {IconComponent ? (
                  <IconComponent className="w-6 h-6 text-brand-600" />
                ) : (
                  <span className="text-brand-600 font-bold">
                    {feature.icon[0]}
                  </span>
                )}
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                {feature.title}
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default MaterialSubSection;
