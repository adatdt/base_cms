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
    | "search";

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
    "chevron-down": (
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
            d="m19.5 8.25-7.5 7.5-7.5-7.5"
        />
    ),
    "chevron-triangle": <polygon points="3,7 21,7 12,17" />,
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
            xmlns="http://w3.org"
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
