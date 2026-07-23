"use client";

import React, { useState, useEffect } from "react";
import { useModalStore } from "@/store/useModalStore";
import Btn from "./Btn";

// 1. Definisikan opsi ukuran yang tersedia
type ModalSize =
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "full";

interface ModalProps {
    id: string;
    title: string;
    children: React.ReactNode;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
    confirmLoading?: boolean;
    size?: ModalSize; // 2. Tambahkan properti size opsional
}

// 3. Buat pemetaan (mapping) kelas lebar Tailwind berdasarkan prop size
// 2. Petakan ukuran lebar baru ke kelas Tailwind CSS
const sizeClasses: Record<ModalSize, string> = {
    sm: "max-w-sm", // ~384px
    md: "max-w-md", // ~448px
    lg: "max-w-lg", // ~512px
    xl: "max-w-xl", // ~576px
    "2xl": "max-w-2xl", // ~672px
    "3xl": "max-w-3xl", // ~768px  <-- Ukuran Baru
    "4xl": "max-w-4xl", // ~896px  <-- Ukuran Baru
    "5xl": "max-w-5xl",
    full: "max-w-full m-4",
};

export default function Modal({
    id,
    title,
    children,
    onConfirm,
    confirmText,
    cancelText,
    confirmLoading = false,
    size = "md", // 4. Set ukuran default ke "md" jika tidak diisi
}: Readonly<ModalProps>) {
    const activeModalId = useModalStore((state) => state.activeModalId);
    const closeModal = useModalStore((state) => state.closeModal);

    const isOpen = activeModalId === id;

    const [isShaking, setIsShaking] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [shouldRender, setShouldRender] = useState(isOpen);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            const timer = setTimeout(() => setIsAnimating(true), 10);
            return () => clearTimeout(timer);
        } else {
            setIsAnimating(false);
            const timer = setTimeout(() => setShouldRender(false), 200);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (isOpen && !shouldRender) {
        setShouldRender(true);
    }

    if (!shouldRender) return null;

    const handleOverlayClick = () => {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 300);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
                type="button"
                className={`fixed inset-0 h-full w-full cursor-default bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${isAnimating ? "opacity-100" : "opacity-0"}`}
                onClick={handleOverlayClick}
            >
                <span className="sr-only">Latar belakang modal</span>
            </button>

            {/* 5. Ganti max-w-md dengan string dinamis ${sizeClasses[size]} */}
            <div
                className={`relative z-10 w-full bg-slate-50 p-6 shadow-xl  rounded-2xl transition-all duration-200 ease-out 
          ${sizeClasses[size]} 
          ${isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"} 
          ${isShaking ? "animate-shake" : ""}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <h3 className="text-lg font-semibold text-gray-900 ">
                        {title}
                    </h3>
                    <button
                        type="button"
                        onClick={closeModal}
                        className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 "
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="mt-4 text-sm text-gray-600 ">{children}</div>

                {/* Footer */}
                <div className="mt-6 flex justify-end gap-2">
                    <Btn
                        type="button"
                        onClick={closeModal}
                        variant="delete"
                        size="md"
                    >
                        {cancelText ?? "Batal"}
                    </Btn>

                    {onConfirm ? (
                        <Btn
                            type="button"
                            onClick={onConfirm}
                            disabled={confirmLoading}
                            variant="primary"
                            size="md"
                        >
                            {confirmLoading
                                ? "Memproses..."
                                : (confirmText ?? "Simpan")}
                        </Btn>
                    ) : (
                        <Btn
                            type="submit"
                            form={id}
                            disabled={confirmLoading}
                            variant="primary"
                            size="md"
                        >
                            {confirmLoading
                                ? "Memproses..."
                                : (confirmText ?? "Simpan")}
                        </Btn>
                    )}
                </div>
            </div>
        </div>
    );
}
