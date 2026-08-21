import React, { useMemo } from "react";

/**
 * 1. DOKUMENTASI & TYPE DEFINITIONS
 * Menggunakan JSDoc agar memunculkan panduan otomatis saat developer mengetik komponen ini.
 */
export type IconType =
    | "add"
    | "edit"
    | "delete"
    | "active"
    | "inactive"
    | "more-vertical"
    | "bell"
    | "filter"
    | "user"
    | "chevron-down"
    | "chevron-triangle"
    | "close"
    | "luv"
    | "image"
    | "search"
    | "trash"
    | "pencil"
    | "wallet"
    | "bar-chart"
    | "store"
    | "bank"
    | "chart-network"
    | "receipt"
    | "refresh"
    | "circle"
    | "calendar"
    | "eyes-off"
    | "eyes";

export interface IconsProps extends Omit<
    React.SVGProps<SVGSVGElement>,
    "name"
> {
    /** Nama/Jenis ikon operasional yang ingin ditampilkan */
    name: IconType;
    /** Ukuran presisi (pixel) untuk lebar dan tinggi ikon secara bersamaan. Default: 20 */
    size?: number;
}

/**
 * 2. STATIC DATA (Diletakkan di luar komponen agar tidak di-render ulang setiap state berubah)
 */
const ICON_PATHS: Record<IconType, React.ReactNode> = {
    eyes: (
        <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="inline-block align-middle"
        >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
        </svg>
    ),
    "eyes-off": (
        <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="inline-block align-middle"
        >
            {/* Garis lengkung utama kelopak mata (melengkung ke bawah) */}
            <path d="M3 8c3 5 15 5 18 0" />

            {/* Bulu mata tengah (tegak lurus ke bawah) */}
            <line x1="12" y1="11" x2="12" y2="15" />

            {/* Bulu mata kiri dalam */}
            <line x1="8" y1="10.5" x2="6" y2="14" />

            {/* Bulu mata kiri luar */}
            <line x1="4.5" y1="9.5" x2="2" y2="12.5" />

            {/* Bulu mata kanan dalam */}
            <line x1="16" y1="10.5" x2="18" y2="14" />

            {/* Bulu mata kanan luar */}
            <line x1="19.5" y1="9.5" x2="22" y2="12.5" />
        </svg>
    ),
    circle: (
        <circle
            cx="12"
            cy="12"
            r="8" // Menggunakan radius 8 agar proporsional dengan grid viewBox 24x24
            fill="currentColor" // Warna mengikuti teks induk otomatis (fill, bukan stroke)
        />
    ),
    trash: (
        <>
            {/* 1. Garis kapsul pegangan tutup paling atas */}
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5" // Ketebalan garis tebal kokoh sesuai gambar
                d="M9 5h6"
            />
            {/* 2. Bibir penutup tong sampah bagian tengah */}
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M4 8h16"
            />
            {/* 3. Badan wadah utama tong sampah dengan sudut bawah melengkung halus */}
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M6 8v9a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8"
            />
        </>
    ),
    pencil: (
        <>
            {/* Batang utama pensil lengkap dengan ujung lancip segitiga di bawah */}
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5" // Ketebalan garis padat sesuai gambar
                d="M10.5 20.5H6.5v-4l10-10 4 4-10 10Z"
            />
            {/* Garis horizontal internal pembatas karet penghapus di bagian atas */}
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="m13.5 9.5 4 4"
            />
        </>
    ),
    search: (
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2" // Ketebalan garis outline standar biar proporsional dan jelas
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
        />
    ),
    luv: (
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2" // Ketebalan garis outline standar biar proporsional dan jelas
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
        />
    ),
    close: (
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5" // Mempertahankan tingkat ketebalan 2.5 bawaan SVG Anda
            d="M6 18L18 6M6 6l12 12"
        />
    ),
    add: (
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
        />
    ),
    edit: (
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
        />
    ),
    delete: (
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
        />
    ),
    active: (
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
            d="M4.5 12.75l6 6 9-13.5"
        />
    ),
    inactive: (
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"
        />
    ),
    filter: (
        <>
            <path strokeLinecap="round" d="M4 6h16" />
            <path strokeLinecap="round" d="M7 12h10" />
            <path strokeLinecap="round" d="M10 18h4" />
        </>
    ),
    "more-vertical": (
        <>
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
        </>
    ),
    bell: (
        <>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 2.25c-3.176 0-5.75 2.574-5.75 5.75 0 3.323-1.026 5.225-1.92 6.453A.75.75 0 0 0 4.937 15.75h14.126a.75.75 0 0 0 .607-1.297c-.894-1.228-1.92-3.13-1.92-6.453 0-3.176-2.574-5.75-5.75-5.75Z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 18h4" />
        </>
    ),
    user: (
        <>
            <circle cx="12" cy="10" r="4" />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 19.5c0-2.5 3.5-5.5 7.5-5.5s7.5 3 7.5 5.5"
            />
        </>
    ),
    image: (
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375 0 11-.75 0 .375 0 01.75 0z"
        />
    ),
    "chevron-down": (
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
            d="m19.5 8.25-7.5 7.5-7.5-7.5"
        />
    ),
    "chevron-triangle": <polygon points="3,7 21,7 12,17" />,
    calendar: (
        <>
            <path d="M8 2v4" />
            <path d="M16 2v4" />

            <rect x="3" y="4" width="18" height="17" rx="2" />

            <path d="M3 10h18" />

            <path d="M8 14h.01" />
            <path d="M12 14h.01" />
            <path d="M16 14h.01" />

            <path d="M8 18h.01" />
            <path d="M12 18h.01" />
        </>
    ),
    wallet: (
        <>
            <path d="M19 7V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h14v8a2 2 0 0 1-2 2H5a3 3 0 0 1-3-3V6" />

            <path d="M16 13h2" />
        </>
    ),
    refresh: (
        <>
            <path d="M3 2v6h6" />
            <path d="M21 22v-6h-6" />
            <path d="M3.51 15a9 9 0 0 0 14.85 3.36L21 16" />
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L3 8" />
        </>
    ),
    "bar-chart": (
        <>
            <line x1="12" x2="12" y1="20" y2="10" />
            <line x1="18" x2="18" y1="20" y2="4" />
            <line x1="6" x2="6" y1="20" y2="16" />
        </>
    ),
    store: (
        <>
            <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
            <path d="M2 7h20v5a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0H2z" />
        </>
    ),
    bank: (
        <>
            <line x1="3" x2="21" y1="22" y2="22" />
            <line x1="6" x2="6" y1="18" y2="11" />
            <line x1="10" x2="10" y1="18" y2="11" />
            <line x1="14" x2="14" y1="18" y2="11" />
            <line x1="18" x2="18" y1="18" y2="11" />
            <polygon points="12 2 20 7 4 7 12 2" />
            <line x1="2" x2="22" y1="18" y2="18" />
        </>
    ),
    "chart-network": (
        <>
            <circle cx="5" cy="16" r="1.5" />
            <circle cx="10" cy="11" r="1.5" />
            <circle cx="15" cy="14" r="1.5" />
            <circle cx="19" cy="8" r="1.5" />
            <path d="M6.2 15.1l2.6-2.9" />
            <path d="M11.4 11.9l2.2 1.4" />
            <path d="M16.3 12.9l1.4-3.4" />
        </>
    ),
    receipt: (
        <>
            <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z" />
            <path d="M16 8h-8" />
            <path d="M16 12h-8" />
            <path d="M16 16h-8" />
        </>
    ),
};

/** List nama ikon yang memiliki tipe grafis solid blok (bukan outline garis) */
const SOLID_ICONS: Set<IconType> = new Set([
    "chevron-triangle",
    "more-vertical",
]);

/**
 * 3. MAIN COMPONENT
 */
export default function Icons({
    name,
    size = 20,
    className = "",
    ...props
}: Readonly<IconsProps>) {
    // Memastikan penentuan fill & stroke efisien dan diperbarui hanya saat prop 'name' berubah
    const { fill, stroke } = useMemo(() => {
        const isSolid = SOLID_ICONS.has(name);
        return {
            fill: isSolid ? "currentColor" : "none",
            stroke: isSolid ? "none" : "currentColor",
        };
    }, [name]);

    return (
        <svg
            viewBox="0 0 24 24"
            strokeWidth={2}
            width={size}
            height={size}
            fill={fill}
            stroke={stroke}
            className={`inline-block shrink-0 select-none align-middle ${className}`}
            aria-hidden="true"
            {...props}
        >
            {ICON_PATHS[name]}
        </svg>
    );
}
