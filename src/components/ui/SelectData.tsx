import React, { useState, useMemo, useRef, useEffect } from "react";

interface SelectOption {
    value: string | number;
    label: string;
}

export interface SelectProps extends Omit<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    "onChange" | "value"
> {
    options: SelectOption[];
    hasError?: boolean;
    value?: string | number;
    onChange?: (value: string | number) => void;
    placeholder?: string;
}

export const SelectData = React.forwardRef<HTMLSelectElement, SelectProps>(
    (
        {
            className = "",
            options = [],
            hasError,
            value,
            onChange,
            placeholder = "Pilih salah satu...",
            defaultValue,
            ...props
        },
        ref,
    ) => {
        const [isOpen, setIsOpen] = useState(false);
        const [searchTerm, setSearchTerm] = useState("");
        const [selectedValue, setSelectedValue] = useState<string | number>(
            value || "",
        );
        const containerRef = useRef<HTMLDivElement>(null);

        // Sinkronisasi jika nilai value berubah dari luar (Parent Component)
        useEffect(() => {
            if (value !== undefined) setSelectedValue(value);
        }, [value]);

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

        // Filter opsi data berdasarkan apa yang diketik pengguna di kolom pencarian
        const filteredOptions = useMemo(() => {
            return options.filter((opt) =>
                opt.label.toLowerCase().includes(searchTerm.toLowerCase()),
            );
        }, [options, searchTerm]);

        // Mencari label dari nilai yang sedang aktif untuk ditampilkan di tombol utama
        const selectedLabel = useMemo(() => {
            const found = options.find((opt) => opt.value === selectedValue);
            return found ? found.label : placeholder;
        }, [options, selectedValue, placeholder]);

        const handleSelect = (val: string | number) => {
            setSelectedValue(val);
            setIsOpen(false);
            setSearchTerm(""); // Reset kata kunci pencarian setelah memilih
            if (onChange) onChange(val);
        };

        return (
            <div ref={containerRef} className="relative w-full text-left">
                {/* 1. Element Hidden Native Select (Agar tetap kompatibel dengan HTML Form Submit biasa) */}
                <select
                    ref={ref}
                    value={selectedValue}
                    onChange={(e) => handleSelect(e.target.value)}
                    className="hidden"
                    {...props}
                >
                    <option value="">{placeholder}</option>
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>

                {/* 2. Tombol Utama Pemicu Dropdown */}
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full flex items-center justify-between bg-slate-50/50 border rounded-lg p-2.5 text-sm text-slate-800 outline-none transition-all hover:bg-slate-100/50 focus:bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-500/10 ${
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
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
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
                    <div className="absolute z-50 w-full mt-1.5 bg-white border border-slate-200 shadow-xl rounded-xl p-2 max-h-60 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-1 duration-100">
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
                                placeholder="Cari data..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-700 outline-none transition-all focus:bg-white focus:border-slate-300"
                            />
                        </div>

                        {/* Daftar Pilihan Opsi */}
                        <div className="overflow-y-auto flex-1 max-h-44 space-y-0.5 custom-scrollbar">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => handleSelect(opt.value)}
                                        className={`w-full text-left px-2.5 py-2 text-sm rounded-md transition-colors ${
                                            selectedValue === opt.value
                                                ? "bg-slate-100 text-slate-900 font-medium"
                                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                        }`}
                                    >
                                        {opt.label}
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
