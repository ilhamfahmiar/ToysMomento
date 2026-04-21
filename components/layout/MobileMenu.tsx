"use client";

import React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { NavItem } from "@/types";

interface MobileMenuProps {
  items: NavItem[];
  activeSection: string;
  isOpen: boolean;
  onClose: () => void;
  onScrollToSection: (sectionId: string) => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  items,
  activeSection,
  isOpen,
  onClose,
  onScrollToSection,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Slide-in drawer dari kanan */}
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
            className="fixed right-0 top-0 z-50 flex h-full w-72 flex-col bg-white shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-label="Menu navigasi mobile"
          >
            {/* Header drawer */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <span className="font-display text-lg font-bold text-primary">
                ToysMomento
              </span>
              <button
                onClick={onClose}
                className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="Tutup menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Nav items */}
            <nav className="flex flex-col gap-1 px-4 py-6">
              {items.map((item) => {
                const isActive =
                  item.sectionId !== undefined &&
                  activeSection === item.sectionId;

                if (item.sectionId) {
                  return (
                    <button
                      key={item.label}
                      onClick={() => {
                        onScrollToSection(item.sectionId!);
                        onClose();
                      }}
                      className={`w-full rounded-lg px-4 py-3 text-left text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                        isActive
                          ? "bg-brand-50 text-primary"
                          : "text-gray-700 hover:bg-gray-50 hover:text-primary"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {item.label}
                      {isActive && (
                        <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-primary align-middle" />
                      )}
                    </button>
                  );
                }

                // Item tanpa sectionId (Make Your Moment) → Next.js Link
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={onClose}
                    className="rounded-lg px-4 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
