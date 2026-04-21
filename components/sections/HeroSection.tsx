"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import useSmoothScroll from "@/components/hooks/useSmoothScroll";

const HeroSection: React.FC = () => {
  const { scrollToSection } = useSmoothScroll();

  return (
    <section
      id="hero"
      className="min-h-screen bg-gradient-to-b from-white to-brand-50 flex items-center py-20 md:py-32"
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Kolom Kiri */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col gap-6"
          >
            {/* Badge */}
            <span className="inline-flex items-center gap-1 bg-brand-100 text-brand-700 text-sm font-medium px-3 py-1 rounded-full w-fit">
              ✨ Custom Figure Premium
            </span>

            {/* Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-gray-900 leading-tight">
              Abadikan Momenmu dalam Wujud Figure Unik
            </h1>

            {/* Subheading */}
            <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
              ToysMomento mengubah foto terbaikmu menjadi figure custom
              berkualitas premium. Hadiah personal yang tak terlupakan untuk
              dirimu dan orang-orang tersayang.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="primary"
                onClick={() => scrollToSection("order-form")}
                aria-label="Order Now — scroll ke form pemesanan"
                className="text-base"
              >
                Order Now
              </Button>
              <Button
                variant="secondary"
                onClick={() => scrollToSection("product-detail")}
                aria-label="Lihat Detail — scroll ke detail produk"
                className="text-base"
              >
                Lihat Detail
              </Button>
            </div>
          </motion.div>

          {/* Kolom Kanan */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="flex justify-center order-first md:order-last"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Image
                src="/images/hero-figure.svg"
                alt="Custom figure ToysMomento - contoh hasil karya figure premium dari foto pelanggan"
                width={500}
                height={500}
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="w-full max-w-sm md:max-w-md object-contain drop-shadow-2xl"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
