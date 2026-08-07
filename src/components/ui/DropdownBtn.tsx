import React, { useState, useRef, useEffect, useId } from "react";

export interface DropdownItem {
    /** Mengambil teks string atau struktur elemen JSX kustom */
    label: React.ReactNode;
    /** Fungsi aksi ketika item menu diklik */
    onClick?: () => void;
    fontWeight?: "normal" | "medium" | "bold";
    fontSize?: "xs" | "sm" | "md" | "lg" | "xl";
    className?: string;
    /** Jika false, mengklik baris ini tidak akan otomatis menutup menu dropdown */
    closeOnItemClick?: boolean;
}

interface DropdownBtnProps {
    trigger: React.ReactNode;
    items: DropdownItem[];
    widthClass?: string;
    alignClass?: string;
}

export const DropdownBtn: React.FC<DropdownBtnProps> = ({
    trigger,
    items,
    widthClass = "w-64",
    alignClass = "right-0",
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // ID unik dasar yang stabil di tingkat instans komponen
    const baseId = useId();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const weightClasses = {
        normal: "font-normal",
        medium: "font-medium",
        bold: "font-bold",
    };

    const sizeClasses = {
        xs: "text-xs",
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
        xl: "text-xl",
    };

    // Handler keyboard untuk elemen pemicu demi memenuhi standar Linter Aksesibilitas
    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setIsOpen((prev) => !prev);
        }
    };

    return (
        <div ref={dropdownRef} className="relative inline-block text-left">
            {/* Bersih dari Linter error (role="button" wajib dipasangkan dengan onKeyDown) */}
            <button
                role="button"
                tabIndex={0}
                onClick={() => setIsOpen((prev) => !prev)}
                onKeyDown={handleKeyDown}
                className="cursor-pointer inline-block"
            >
                {trigger}
            </button>

            {isOpen && (
                <div
                    className={`absolute ${alignClass} z-50 mt-1 ${widthClass} bg-white border border-slate-100 shadow-xl rounded-xl overflow-hidden origin-top-right p-1.5`}
                >
                    {items.map((item, index) => {
                        const shouldClose = item.closeOnItemClick !== false;

                        const handleItemClick = () => {
                            if (shouldClose) setIsOpen(false);
                            if (item.onClick) item.onClick();
                        };

                        // Menghasilkan string penanda konten yang stabil tanpa Math.random()
                        const contentSlug =
                            typeof item.label === "string"
                                ? item.label.replace(/\s+/g, "-").toLowerCase()
                                : "custom-node";

                        // Kombinasi ini 100% aman untuk Linter karena dijamin unik per baris tabel
                        const itemKey = `${baseId}-${contentSlug}-${index}`;

                        if (typeof item.label === "string") {
                            return (
                                <button
                                    key={itemKey}
                                    type="button"
                                    onClick={handleItemClick}
                                    className={`w-full text-left px-4 py-2.5 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors block border-none bg-transparent cursor-pointer ${
                                        weightClasses[
                                            item.fontWeight || "medium"
                                        ]
                                    } ${
                                        sizeClasses[item.fontSize || "sm"]
                                    } ${item.className || ""}`}
                                >
                                    {item.label}
                                </button>
                            );
                        }

                        return (
                            <div
                                key={itemKey}
                                onClick={(e) => {
                                    if (!shouldClose) e.stopPropagation();
                                }}
                                className={`w-full px-4 py-2 text-slate-700 rounded-lg block ${
                                    sizeClasses[item.fontSize || "sm"]
                                } ${item.className || ""}`}
                            >
                                {item.label}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
