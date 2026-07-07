import React from "react";

// 1. Definisikan tipe ikon yang tersedia
export type CrudIconType = "add" | "edit" | "delete" | "active" | "inactive";

interface CrudIconsProps extends React.SVGProps<SVGSVGElement> {
  name: CrudIconType;
  size?: number; // Mengatur ukuran lebar & tinggi secara bersamaan
}

export default function CrudIcons({
  name,
  size = 20,
  className,
  ...props
}: Readonly<CrudIconsProps>) {
  // 2. Tempat penyimpanan koordinat path SVG (Desain Outline Modern Minimalis)
  const iconMap: Record<CrudIconType, React.ReactNode> = {
    // Ikon Tambah Data (Plus)
    add: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4.5v15m7.5-7.5h-15"
      />
    ),
    // Ikon Edit Data (Pena/Pensil)
    edit: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
      />
    ),
    // Ikon Delete Data (Tempat Sampah)
    delete: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
      />
    ),
    // Ikon Aktif (Centang di dalam Lingkaran)
    active: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5" // Menaikkan ketebalan garis agar ikon tampak kokoh dan tegas
        d="M4.5 12.75l6 6 9-13.5" // Formula path untuk checklist murni ukuran besar
      />
    ),
    // Ikon Non-Aktif (Tanda Larangan/Silang di dalam Lingkaran)
    inactive: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"
      />
    ),
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2} // Ketebalan garis outline biar proporsional dan jelas
      stroke="currentColor" // Warna dinamis mengikuti kelas text-color induknya
      width={size}
      height={size}
      className={className}
      aria-hidden="true" // Lolos SonarQube: Menyembunyikan dekorasi grafis dari screen reader
      {...props}
    >
      {iconMap[name]}
    </svg>
  );
}
