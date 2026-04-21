"use client";

import React from "react";
import { productSections } from "@/data/productSections";
import QualitySubSection from "./QualitySubSection";
import CustomizationSubSection from "./CustomizationSubSection";
import MaterialSubSection from "./MaterialSubSection";

const ProductDetailSection: React.FC = () => {
  const qualityData = productSections[0];
  const customizationData = productSections[1];
  const materialData = productSections[2];

  return (
    <section id="product-detail" className="bg-white py-20">
      <div className="container mx-auto px-4 md:px-8">
        {/* Section Heading */}
        <div className="text-center mb-4">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-gray-900">
            Detail Produk
          </h2>
        </div>

        {/* Divider */}
        <div className="w-16 h-1 bg-primary rounded-full mx-auto mb-4" />

        {/* Sub-sections */}
        <QualitySubSection data={qualityData} />

        <div className="border-t border-gray-100" />

        <CustomizationSubSection data={customizationData} />

        <div className="border-t border-gray-100" />

        <MaterialSubSection data={materialData} />
      </div>
    </section>
  );
};

export default ProductDetailSection;
