import React, { useState, useMemo, useRef, useEffect } from "react";

export type InputSize = "sm" | "md" | "lg";

// 1. Perluas tipe data opsi agar mendukung relasi hierarki
export interface HierarchyOption {
    value: string | number;
    label: string;
    parent?: string | number | null; // ID dari parent jika item ini adalah child
}

export interface SelectHierarchyProps extends Omit<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    "onChange" | "value"
> {
    options: HierarchyOption[];
    hasError?: boolean;
    value?: string | number;
    onChange?: (value: string | number) => void;
    placeholder?: string;
    inputSize?: InputSize;
}

const sizeClasses: Record<InputSize, string> = {
    sm: "p-2 text-xs rounded-md",
    md: "p-2.5 text-sm rounded-lg",
    lg: "p-3.5 text-base rounded-xl",
};

// 👑 DINAMIS: Ukuran ikon disesuaikan secara proporsional
const iconSizeClasses: Record<InputSize, string> = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
};

export const SelectHierarchyData = React.forwardRef<
    HTMLSelectElement,
    SelectHierarchyProps
>(
    (
        {
            className = "",
            options = [],
            hasError,
            value,
            onChange,
            placeholder = "Pilih salah satu...",
            inputSize = "md",
            ...props
        },
        ref,
    ) => {
        const currentSizeClass = sizeClasses[inputSize];
        const currentIconSizeClass = iconSizeClasses[inputSize];

        const [isOpen, setIsOpen] = useState(false);
        const [searchTerm, setSearchTerm] = useState("");
        const [selectedValue, setSelectedValue] = useState<string | number>(
            value || "",
        );
        const [openUpward, setOpenUpward] = useState(false);
        const containerRef = useRef<HTMLDivElement>(null);

        // Sinkronisasi jika nilai value berubah dari luar (Parent Component)
        useEffect(() => {
            if (value !== undefined) setSelectedValue(value);
        }, [value]);

        useEffect(() => {
            const handlePositionCheck = () => {
                if (isOpen && containerRef.current) {
                    const rect =
                        containerRef.current.getBoundingClientRect();

                    const dropdownMaxHeight = 240;

                    const spaceBelow =
                        window.innerHeight - rect.bottom;

                    const spaceAbove = rect.top;

                    if (
                        spaceBelow < dropdownMaxHeight &&
                        spaceAbove > dropdownMaxHeight
                    ) {
                        setOpenUpward(true);
                    } else {
                        setOpenUpward(false);
                    }
                }
            };

            if (isOpen) {
                handlePositionCheck();

                window.addEventListener(
                    "scroll",
                    handlePositionCheck,
                    { passive: true },
                );

                window.addEventListener(
                    "resize",
                    handlePositionCheck,
                );
            }

            return () => {
                window.removeEventListener(
                    "scroll",
                    handlePositionCheck,
                );

                window.removeEventListener(
                    "resize",
                    handlePositionCheck,
                );
            };
        }, [isOpen]);

        // Tutup dropdown otomatis jika pengguna mengklik di luar area komponen
        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (
                    containerRef.current &&
                    !containerRef.current.contains(event.target as Node)
                ) {
                    setIsOpen(false);
                }
            };
            document.addEventListener("mousedown", handleClickOutside);
            return () =>
                document.removeEventListener("mousedown", handleClickOutside);
        }, []);

        // Algoritma untuk mengurutkan data menjadi struktur Pohon (Tree) secara Linier
        const orderedHierarchyOptions = useMemo(() => {
            const result: Array<HierarchyOption & { depth: number }> = [];

            // Pisahkan antara Top-Level Parents dan sub-items
            const rootItems = options.filter(
                (opt) => !opt.parent || opt.parent === "0" || opt.parent === 0,
            );

            // Fungsi rekursif untuk menyusun anak (child) tepat di bawah bapaknya (parent)
            const traverse = (
                parentId: string | number,
                currentDepth: number,
            ) => {
                const children = options.filter(
                    (opt) => opt.parent === parentId,
                );
                children.forEach((child) => {
                    result.push({ ...child, depth: currentDepth });
                    traverse(child.value, currentDepth + 1); // Rekursi untuk cucu, cicit, dst
                });
            };

            rootItems.forEach((root) => {
                result.push({ ...root, depth: 0 }); // Kedalaman 0 untuk Menu Utama
                traverse(root.value, 1); // Cari anak dengan kedalaman dimulai dari 1
            });

            // Jika ada item yatim piatu (tidak punya bapak yang valid di list), tampilkan di paling bawah
            options.forEach((opt) => {
                const statusAdded = result.some((r) => r.value === opt.value);
                if (!statusAdded) {
                    result.push({ ...opt, depth: 0 });
                }
            });

            return result;
        }, [options]);

        // Filter opsi berdasarkan input pencarian
        const filteredOptions = useMemo(() => {
            if (!searchTerm.trim()) return orderedHierarchyOptions;

            return orderedHierarchyOptions.filter((opt) =>
                opt.label.toLowerCase().includes(searchTerm.toLowerCase()),
            );
        }, [orderedHierarchyOptions, searchTerm]);

        // Mencari label dari nilai yang sedang aktif untuk ditampilkan di tombol utama
        const selectedLabel = useMemo(() => {
            // Jika nilai kosong, nol, atau teks placeholder, langsung kembalikan placeholder
            if (
                selectedValue === undefined ||
                selectedValue === null ||
                selectedValue === "" ||
                selectedValue === 0 ||
                selectedValue === "0"
            ) {
                return placeholder;
            }

            // 💡 SOLUSI UTAMA: Cari berdasarkan ID atau Label sekaligus secara case-insensitive
            const found = options.find(
                (opt) =>
                    String(opt.value) === String(selectedValue) ||
                    opt.label.toLowerCase() ===
                        String(selectedValue).toLowerCase(),
            );

            return found ? found.label : placeholder;
        }, [options, selectedValue, placeholder]);

        const handleSelect = (val: string | number) => {
            setSelectedValue(val);
            setIsOpen(false);
            setSearchTerm(""); // Reset kata kunci pencarian
            if (onChange) onChange(val);
        };

        return (
            <div ref={containerRef} className="relative w-full text-left">
                {/* 1. Element Hidden Native Select (Agar tetap kompatibel dengan HTML Form / Zod Submit biasa) */}
                <select
                    ref={ref}
                    value={selectedValue}
                    onChange={(e) => handleSelect(e.target.value)}
                    className="hidden"
                    {...props}
                >
                    <option value="">{placeholder}</option>
                    {orderedHierarchyOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {"— ".repeat(opt.depth) + opt.label}
                        </option>
                    ))}
                </select>

                {/* 2. Tombol Utama Pemicu Dropdown */}
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={` ${currentSizeClass} w-full flex items-center justify-between bg-slate-50/50 border rounded-lg p-2.5 text-sm text-slate-800 outline-none transition-all hover:bg-slate-100/50 focus:bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-500/10  ${sizeClasses[inputSize]} ${
                        hasError
                            ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                            : "border-slate-200"
                    } ${className}`}
                >
                    <span
                        className={
                            selectedValue === ""
                                ? "text-slate-400"
                                : "text-slate-800"
                        }
                    >
                        {selectedLabel}
                    </span>
                    {/* Icon Panah Kecil Dropdown */}
                    <svg
                        className={`${currentIconSizeClass} text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </button>

                {/* 3. Panel Menu Dropdown & Kolom Pencarian */}
                {isOpen && (
                    <div
                        /* 💡 PERUBAHAN UTAMA: Mengganti mt-1.5 menjadi kombinasi deteksi atau fallback bottom jika di ujung */
                        /* Jika Anda ingin memaksa selalu ke atas khusus untuk input paling bawah, ganti 'top-full mt-1.5' menjadi 'bottom-full mb-2' */
                        className={`absolute z-50 w-full bg-white border border-slate-200 shadow-xl rounded-xl p-2 max-h-60 overflow-hidden flex flex-col animate-in fade-in duration-100 ${
                            openUpward
                                ? "bottom-full mb-2 slide-in-from-bottom-1"
                                : "top-full mt-2 slide-in-from-top-1"
                        }`}
                        >
                        {/* Kolom Pencarian (Search Input) */}
                        <div className="relative mb-2 flex items-center">
                            <svg
                                className="absolute left-2.5 w-4 h-4 text-slate-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Cari data menu..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-700 outline-none transition-all focus:bg-white focus:border-slate-300 "
                            />
                        </div>

                        {/* Daftar Pilihan Opsi Ter-hierarki */}
                        <div className="overflow-y-auto flex-1 max-h-44 space-y-0.5 custom-scrollbar">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => handleSelect(opt.value)}
                                        style={{
                                            paddingLeft: `${opt.depth * 16 + 10}px`,
                                        }}
                                        className={`w-full text-left py-2 pr-2.5 text-sm rounded-md transition-colors flex items-center gap-1.5 ${
                                            selectedValue === opt.value
                                                ? "bg-blue-50 text-blue-700 font-medium"
                                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                        }`}
                                    >
                                        {opt.depth > 0 && (
                                            <span className="text-slate-300 font-normal">
                                                ↳
                                            </span>
                                        )}
                                        <span
                                            className={
                                                opt.depth === 0
                                                    ? "font-semibold text-slate-700"
                                                    : ""
                                            }
                                        >
                                            {opt.label}
                                        </span>
                                    </button>
                                ))
                            ) : (
                                <div className="text-center py-4 text-xs text-slate-400">
                                    Data tidak ditemukan
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    },
);
