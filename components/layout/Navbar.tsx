"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import useActiveSection from "@/components/hooks/useActiveSection";
import useSmoothScroll from "@/components/hooks/useSmoothScroll";
import { navItems } from "@/data/navItems";
import MobileMenu from "@/components/layout/MobileMenu";

const SECTION_IDS = ["hero", "product-detail", "testimoni", "order-form"];

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activeSection = useActiveSection(SECTION_IDS);
  const { scrollToSection } = useSmoothScroll();

  // Tambahkan shadow saat scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavItemClick = (sectionId: string) => {
    scrollToSection(sectionId);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full bg-white transition-shadow duration-200 ${
          isScrolled ? "shadow-md" : "shadow-none"
        }`}
      >
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8"
          aria-label="Navigasi utama"
        >
          {/* Logo / Brand */}
          <Link
            href="/"
            className="font-display text-xl font-bold text-primary transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="ToysMomento - Kembali ke halaman utama"
          >
            ToysMomento
          </Link>

          {/* Desktop nav items */}
          <ul className="hidden items-center gap-1 md:flex" role="list">
            {navItems.map((item) => {
              const isActive =
                item.sectionId !== undefined &&
                activeSection === item.sectionId;

              if (item.sectionId) {
                return (
                  <li key={item.label}>
                    <button
                      onClick={() => handleNavItemClick(item.sectionId!)}
                      className={`relative rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                        isActive
                          ? "text-primary"
                          : "text-gray-600 hover:text-primary"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {item.label}
                      {/* Underline aktif */}
                      {isActive && (
                        <span
                          className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-primary"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  </li>
                );
              }

              // Make Your Moment → Next.js Link
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 md:hidden"
            aria-label="Buka menu navigasi"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <Menu size={24} />
          </button>
        </nav>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        items={navItems}
        activeSection={activeSection}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onScrollToSection={handleNavItemClick}
      />
    </>
  );
};

export default Navbar;
