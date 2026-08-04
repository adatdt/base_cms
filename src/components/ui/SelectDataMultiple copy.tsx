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
        const [openUpward, setOpenUpward] = useState(false);

        const containerRef = useRef<HTMLDivElement>(null);

        // Sinkronisasi jika nilai value berubah dari luar (Parent Component/Zustand)
        useEffect(() => {
            if (value !== undefined) setSelectedValues(value);
        }, [value]);

        // Hitung sisa jarak ke bawah layar untuk menentukan posisi panel
        useEffect(() => {
            const handlePositionCheck = () => {
                if (isOpen && containerRef.current) {
                    const rect = containerRef.current.getBoundingClientRect();
                    const windowHeight = window.innerHeight;
                    const dropdownMaxHeight = 240;

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
            e.stopPropagation();
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

                {/* 2. Wrapper Utama Menggunakan DIV Semantik (Aman dari Linter & SSR) */}
                <div
                    className={`relative w-full flex items-center justify-between bg-slate-50/50 border rounded-lg p-2 text-sm text-slate-800 transition-all ${
                        hasError
                            ? "border-red-400 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-500/10"
                            : "border-slate-200 focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-slate-500/10"
                    } ${className}`}
                >
                    {/* 🟢 OVERLAY BUTTON: Tombol Transparan untuk menangkap klik di area kosong kotak tanpa melanggar semantik */}
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className="absolute inset-0 w-full h-full cursor-pointer rounded-lg bg-transparent opacity-0 z-10 outline-none focus:opacity-100 focus:ring-2 focus:ring-slate-400/20"
                        aria-expanded={isOpen}
                        aria-label={
                            selectedOptions.length > 0
                                ? "Buka menu pilihan"
                                : placeholder
                        }
                    />

                    {/* Bagian List Badge Terpilih */}
                    <div className="flex flex-wrap gap-1.5 items-center flex-1 pr-2 overflow-hidden text-left relative z-20 pointer-events-none">
                        {selectedOptions.length > 0 ? (
                            selectedOptions.map((opt) => (
                                <span
                                    key={opt.value}
                                    className="inline-flex items-center gap-1 bg-slate-200/80 text-slate-800 text-xs font-medium px-2 py-0.5 rounded-md border border-slate-300/40 animate-fade-in pointer-events-auto"
                                >
                                    {opt.label}
                                    {/* Tombol Hapus Individual */}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Menahan agar tidak memicu penutupan overlay button
                                            handleRemoveValue(e, opt.value);
                                        }}
                                        className="hover:bg-slate-300 rounded text-slate-500 hover:text-slate-800 w-3.5 h-3.5 flex items-center justify-center text-[10px] font-bold cursor-pointer transition-colors outline-none"
                                        aria-label={`Hapus ${opt.label}`}
                                    >
                                        ✕
                                    </button>
                                </span>
                            ))
                        ) : (
                            /* Teks placeholder ketika kosong */
                            <span className="text-slate-400 pl-1 py-0.5 select-none">
                                {placeholder}
                            </span>
                        )}
                    </div>

                    {/* Ikon Panah Menggunakan SVG Chevron Minimalis */}
                    <div className="text-slate-400 p-1 flex items-center justify-center min-w-6 relative z-20 pointer-events-none">
                        <svg
                            className={`w-4 h-4 text-slate-400/90 transition-transform duration-200 ${
                                isOpen ? "rotate-180" : ""
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                            />
                        </svg>
                    </div>
                </div>

                {/* 3. Panel Dropdown Menu Overlay SEJAJAR */}
                {isOpen && (
                    <div
                        className={`absolute left-0 z-50 w-full min-w-50 bg-white border border-slate-200 rounded-lg shadow-xl p-2 transition-all max-h-60 overflow-y-auto ${
                            openUpward
                                ? "bottom-full mb-1.5"
                                : "top-full mt-1.5"
                        }`}
                    >
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Cari..."
                            autoFocus
                            className="w-full text-xs p-1.5 mb-2 border border-slate-200 rounded outline-none focus:border-slate-400"
                        />

                        <div className="flex flex-col gap-0.5">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((opt) => {
                                    const isSelected = selectedValues.includes(
                                        opt.value,
                                    );
                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() =>
                                                handleToggleSelect(opt.value)
                                            }
                                            className={`w-full text-left text-xs px-2.5 py-2 rounded-md transition-colors cursor-pointer flex justify-between items-center outline-none ${
                                                isSelected
                                                    ? "bg-slate-100 font-semibold text-slate-900"
                                                    : "hover:bg-slate-50 text-slate-700 focus:bg-slate-50"
                                            }`}
                                        >
                                            <span>{opt.label}</span>
                                            {isSelected && (
                                                <span className="text-slate-600 font-bold">
                                                    ✓
                                                </span>
                                            )}
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="text-center text-xs text-slate-400 py-3">
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
