import React from "react";

interface IconProps {
  className?: string;
}

/**
 * Ikon Chevron/Segitiga berbasis SVG.
 * Dikendalikan penuh menggunakan warna teks (currentColor) dan transisi CSS.
 */
const getXmlns = "http://www.w3.org/2000/svg";
export function ChevronDownIcon({
  className = "w-4 h-4",
}: Readonly<IconProps>) {
  return (
    <svg
      xmlns={getXmlns}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="2.5"
      stroke="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m19.5 8.25-7.5 7.5-7.5-7.5"
      />
    </svg>
  );
}

export function ChevronTriangleIcon({
  className = "w-3 h-3",
}: Readonly<IconProps>) {
  return (
    <svg
      xmlns={getXmlns}
      viewBox="0 0 24 24"
      fill="currentColor" // Menggunakan isi solid sesuai gambar
      className={className}
      aria-hidden="true"
    >
      {/* Membentuk koordinat segitiga solid menghadap ke bawah */}
      <polygon points="3,7 21,7 12,17" />
    </svg>
  );
}
