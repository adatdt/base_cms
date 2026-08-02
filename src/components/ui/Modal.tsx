"use client";

import React, { useState, useEffect } from "react";
import { useModalStore } from "@/store/useModalStore";
import { useFormStore } from "@/store/useFormStore";
import Btn from "./Btn";
import Skeleton from "@/components/ui/Skeleton";

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
    isBackdropLoading?: boolean;
    size?: ModalSize;
}

const sizeClasses: Record<ModalSize, string> = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
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
    isBackdropLoading = false,
    size = "md",
}: Readonly<ModalProps>) {
    const activeModalId = useModalStore((state) => state.activeModalId);
    const closeModal = useModalStore((state) => state.closeModal);
    const resetForm = useFormStore((state) => state.resetForm);

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
            resetForm();
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
        // Jika sedang loading konten, cegah efek getar overlay click agar tidak mengganggu visual spinner
        if (isBackdropLoading) return;
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 300);
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center">
            {/* 🔴 BACKDROP DENGAN LOADING SPINNER */}
            <div
                className={`fixed inset-0 h-screen w-screen bg-black/50 backdrop-blur-sm transition-opacity duration-200 flex items-center justify-center ${isAnimating ? "opacity-100" : "opacity-0"}`}
            >
                {/* Tombol transparan backdrop untuk mendeteksi klik luar */}
                <button
                    type="button"
                    className="absolute inset-0 h-full w-full border-none outline-none cursor-default"
                    onClick={handleOverlayClick}
                >
                    <span className="sr-only">Tutup modal</span>
                </button>

                {/* 💡 Indikator Spinner Loading Tengah Backdrop */}
                {isBackdropLoading && (
                    <div className="relative z-50 flex items-center justify-center bg-slate-900/85 py-2.5 px-4 rounded-xl shadow-xl border border-slate-700/40 pointer-events-none select-none max-w-xs mx-auto">
                        {/* Memanggil komponen Skeleton bawaan Anda dengan varian teks saja */}
                        <Skeleton variant="text-only" align="center" />
                    </div>
                )}
            </div>

            <div className="absolute inset-0 h-full w-full overflow-y-auto p-4 flex items-start justify-center pt-10 pb-16">
                <button
                    type="button"
                    className="absolute inset-0 h-full w-full cursor-default z-0"
                    onClick={handleOverlayClick}
                >
                    <span className="sr-only">Tutup modal</span>
                </button>

                {/* Kotak Putih Modal Konten */}
                {/* 💡 Ditambahkan kelas CSS dinamis jika isBackdropLoading aktif untuk menyembunyikan sementara kotak putih agar fokus ke backdrop loading */}
                <div
                    className={`relative z-10 w-full bg-slate-50 p-6 shadow-xl rounded-2xl transition-all duration-200 ease-out mb-auto
              ${sizeClasses[size]} 
              ${isAnimating && !isBackdropLoading ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"} 
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
                    <div className="mt-4 text-sm text-gray-600 ">
                        {children}
                    </div>

                    {/* Footer */}
                    <div className="mt-6 flex justify-end gap-2 border-t border-gray-100 pt-3">
                        <Btn
                            type="button"
                            onClick={closeModal}
                            variant="delete"
                            size="md"
                            disabled={confirmLoading}
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
        </div>
    );
}
