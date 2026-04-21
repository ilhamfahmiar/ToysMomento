"use client";

import React from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { testimoniData } from "@/data/testimoni";
import TestimoniCard from "./TestimoniCard";

const TestimoniSection: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="testimoni" className="bg-brand-50 py-20">
      <div className="container mx-auto px-4 md:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold font-display text-gray-900 mb-4">
            Momento Mereka
          </h2>
          <div className="w-16 h-1 bg-primary rounded-full mx-auto" />
        </motion.div>

        {/* Grid Testimoni */}
        <div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {testimoniData.map((testimoni, index) => (
            <motion.div
              key={testimoni.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{
                duration: 0.5,
                ease: "easeOut",
                delay: index * 0.1,
              }}
            >
              <TestimoniCard {...testimoni} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimoniSection;
