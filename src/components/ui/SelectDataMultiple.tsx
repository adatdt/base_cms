"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";

interface SelectOption {
    value: string | number;
    label: string;
}

export interface MultiSelectProps extends Omit<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    "onChange" | "value"
> {
    options: SelectOption[];
    hasError?: boolean;
    value?: (string | number)[];
    onChange?: (value: (string | number)[]) => void;
    placeholder?: string;
}

export const SelectDataMultiple = React.forwardRef<
    HTMLSelectElement,
    MultiSelectProps
>(
    (
        {
            className = "",
            options = [],
            hasError,
            value = [],
            onChange,
            placeholder = "Pilih beberapa data...",
            ...props
        },
        ref,
    ) => {
        const [isOpen, setIsOpen] = useState(false);
        const [searchTerm, setSearchTerm] = useState("");
        const [selectedValues, setSelectedValues] =
            useState<(string | number)[]>(value);
        const [openUpward, setOpenUpward] = useState(false); // 💡 State untuk mendeteksi arah buka panel

        const containerRef = useRef<HTMLDivElement>(null);

        // Sinkronisasi jika nilai value berubah dari luar (Parent Component/Zustand)
        useEffect(() => {
            if (value !== undefined) setSelectedValues(value);
        }, [value]);

        // 💡 FITUR PINTAR: Hitung sisa jarak ke bawah layar untuk menentukan posisi panel
        useEffect(() => {
            const handlePositionCheck = () => {
                if (isOpen && containerRef.current) {
                    const rect = containerRef.current.getBoundingClientRect();
                    const windowHeight = window.innerHeight;
                    const dropdownMaxHeight = 240; // Sesuai kelas max-h-60 (~240px)

                    // Jika jarak dari bawah tombol ke ujung layar lebih kecil dari tinggi dropdown, lempar ke atas
                    const spaceBelow = windowHeight - rect.bottom;
                    if (
                        spaceBelow < dropdownMaxHeight &&
                        rect.top > dropdownMaxHeight
                    ) {
                        setOpenUpward(true);
                    } else {
                        setOpenUpward(false);
                    }
                }
            };

            if (isOpen) {
                handlePositionCheck();
                // Monitor juga saat user scroll atau resize jendela agar posisi dinamis tetap terjaga
                window.addEventListener("scroll", handlePositionCheck, {
                    passive: true,
                });
                window.addEventListener("resize", handlePositionCheck);
            }

            return () => {
                window.removeEventListener("scroll", handlePositionCheck);
                window.removeEventListener("resize", handlePositionCheck);
            };
        }, [isOpen]);

        // Tutup dropdown otomatis jika mengklik di luar area komponen
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

        // Filter opsi berdasarkan pencarian
        const filteredOptions = useMemo(() => {
            return options.filter((opt) =>
                opt.label.toLowerCase().includes(searchTerm.toLowerCase()),
            );
        }, [options, searchTerm]);

        // Kumpulan objek opsi yang sedang terpilih untuk merender badge teks
        const selectedOptions = useMemo(() => {
            return options.filter((opt) => selectedValues.includes(opt.value));
        }, [options, selectedValues]);

        const handleToggleSelect = (val: string | number) => {
            let updatedValues: (string | number)[];

            if (selectedValues.includes(val)) {
                updatedValues = selectedValues.filter((v) => v !== val);
            } else {
                updatedValues = [...selectedValues, val];
            }

            setSelectedValues(updatedValues);
            if (onChange) onChange(updatedValues);
        };

        const handleRemoveValue = (
            e: React.MouseEvent,
            val: string | number,
        ) => {
            e.stopPropagation(); // Mencegah dropdown terbuka/tertutup saat menghapus badge
            const updatedValues = selectedValues.filter((v) => v !== val);
            setSelectedValues(updatedValues);
            if (onChange) onChange(updatedValues);
        };

        return (
            <div ref={containerRef} className="relative w-full text-left">
                {/* 1. Element Hidden Native Select */}
                <select
                    ref={ref}
                    multiple
                    value={selectedValues.map(String)}
                    onChange={(e) => {
                        const opts = Array.from(
                            e.target.selectedOptions,
                            (o) => o.value,
                        );
                        setSelectedValues(opts);
                        if (onChange) onChange(opts);
                    }}
                    className="hidden"
                    {...props}
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                {/* 2. Tombol Utama Pemicu Dropdown (Bebas SonarQube & Ramah Aksesibilitas) */}
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full flex items-center justify-between bg-slate-50/50 border rounded-lg p-2 text-sm text-slate-800 outline-none transition-all cursor-pointer hover:bg-slate-100/50 focus:bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-500/10 ${
                        hasError
                            ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                            : "border-slate-200"
                    } ${className}`}
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                >
                    {/* Mengubah <div> dalam menjadi elemen inline <span> agar valid secara semantik HTML */}
                    <span className="flex flex-wrap gap-1.5 items-center flex-1 pr-2 overflow-hidden text-left">
                        {selectedOptions.length > 0 ? (
                            selectedOptions.map((opt) => (
                                <span
                                    key={opt.value}
                                    className="inline-flex items-center gap-1 bg-slate-200/80 text-slate-800 text-xs font-medium px-2 py-0.5 rounded-md border border-slate-300/40 animate-fade-in"
                                >
                                    {opt.label}
                                    <button
                                        type="button"
                                        onClick={(e) =>
                                            handleRemoveValue(e, opt.value)
                                        }
                                        className="hover:bg-slate-300 rounded text-slate-500 hover:text-slate-800 w-3.5 h-3.5 flex items-center justify-center text-[10px] font-bold transition-colors"
                                    >
                                        ✕
                                    </button>
                                </span>
                            ))
                        ) : (
                            <span className="text-slate-400 pl-1 py-0.5">
                                {placeholder}
                            </span>
                        )}
                    </span>

                    {/* Icon Panah Kecil Dropdown */}
                    <svg
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`}
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

                {/* 3. Panel Menu Dropdown & Kolom Pencarian Dinamis (Flip Upward/Downward) */}
                {isOpen && (
                    <div
                        className={`absolute z-50 w-full bg-white border border-slate-200 shadow-xl rounded-xl p-2 max-h-60 overflow-hidden flex flex-col duration-100 transition-all ${
                            openUpward
                                ? "bottom-full mb-1.5 animate-in fade-in slide-in-from-bottom-1"
                                : "top-full mt-1.5 animate-in fade-in slide-in-from-top-1"
                        }`}
                    >
                        {/* Kolom Pencarian */}
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
                                placeholder="Cari data..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-700 outline-none transition-all focus:bg-white focus:border-slate-300"
                            />
                        </div>

                        {/* Daftar Pilihan Opsi */}
                        <div className="overflow-y-auto flex-1 max-h-44 space-y-0.5 custom-scrollbar">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((opt) => {
                                    const isSelected = selectedValues.includes(
                                        opt.value,
                                    );
                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            // 💡 HAPUS JUGA role="option" dan aria-selected di sini agar linter murni bersih
                                            onClick={() =>
                                                handleToggleSelect(opt.value)
                                            }
                                            className={`w-full flex items-center justify-between px-2.5 py-2 text-sm rounded-md transition-colors ${
                                                isSelected
                                                    ? "bg-slate-100/80 text-slate-900 font-medium"
                                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                            }`}
                                        >
                                            <span>{opt.label}</span>
                                            {/* Tanda Centang untuk Opsi Terpilih */}
                                            {isSelected && (
                                                <svg
                                                    className="w-4 h-4 text-slate-700 animate-fade-in"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2.5}
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                            )}
                                        </button>
                                    );
                                })
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

SelectDataMultiple.displayName = "SelectDataMultiple";
