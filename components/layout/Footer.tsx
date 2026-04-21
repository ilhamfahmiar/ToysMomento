"use client";

import React from "react";
import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";

// SVG inline untuk Instagram karena lucide-react v1.x belum menyertakan icon ini
const InstagramIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 16,
  className,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);
import { navItems } from "@/data/navItems";
import useSmoothScroll from "@/components/hooks/useSmoothScroll";

const Footer: React.FC = () => {
  const { scrollToSection } = useSmoothScroll();

  return (
    <footer className="bg-gray-900 text-white" aria-label="Footer">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Grid 3 kolom di desktop, 1 kolom di mobile */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Kolom kiri: Logo + tagline */}
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="font-display text-2xl font-bold text-white transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900"
              aria-label="ToysMomento - Kembali ke halaman utama"
            >
              ToysMomento
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-gray-400">
              Abadikan momen berhargamu dalam wujud custom figure yang unik dan
              personal.
            </p>
          </div>

          {/* Kolom tengah: Link navigasi */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-300">
              Navigasi
            </h3>
            <ul className="flex flex-col gap-2" role="list">
              {navItems.map((item) => {
                if (item.sectionId) {
                  return (
                    <li key={item.label}>
                      <button
                        onClick={() => scrollToSection(item.sectionId!)}
                        className="text-sm text-gray-400 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900"
                      >
                        {item.label}
                      </button>
                    </li>
                  );
                }

                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-gray-400 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900"
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Kolom kanan: Info kontak */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-300">
              Kontak
            </h3>
            <ul className="flex flex-col gap-3" role="list">
              <li>
                <a
                  href="mailto:hello@toysmomento.com"
                  className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900"
                  aria-label="Email ToysMomento: hello@toysmomento.com"
                >
                  <Mail size={16} aria-hidden="true" />
                  <span>hello@toysmomento.com</span>
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/toysmomento"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900"
                  aria-label="Instagram ToysMomento: @toysmomento (buka di tab baru)"
                >
                  <InstagramIcon size={16} />
                  <span>@toysmomento</span>
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/6281234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900"
                  aria-label="WhatsApp ToysMomento (buka di tab baru)"
                >
                  <MessageCircle size={16} aria-hidden="true" />
                  <span>WhatsApp</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-10 border-t border-gray-800 pt-6">
          <p className="text-center text-sm text-gray-500">
            © 2024 ToysMomento. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
