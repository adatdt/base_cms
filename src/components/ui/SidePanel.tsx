"use client";

import React, { useState, useEffect } from "react";
import { useModalStore } from "@/store/useModalStore";
import { useFormStore } from "@/store/useFormStore";
import Btn from "./Btn";
import Skeleton from "@/components/ui/Skeleton";

export type PanelSize =
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "full"
    | "dynamic"; // 🌟 Menambahkan opsi ukuran dinamis

interface SidePanelProps {
    id: string;
    title: string;
    description?: string;
    children: React.ReactNode;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
    confirmLoading?: boolean;
    isBackdropLoading?: boolean;
    size?: PanelSize;
    showFooter?: boolean;
}

// 🛠️ PERUBAHAN UTAMA: Mengubah kelas agar mendukung ukuran dinamis berbasis konten
const sizeClasses: Record<PanelSize, string> = {
    sm: "w-full md:max-w-xs",
    md: "w-full md:max-w-sm",
    lg: "w-full md:max-w-md",
    xl: "w-full md:max-w-lg",
    "2xl": "w-full md:max-w-xl",
    "3xl": "w-full md:max-w-2xl",
    "4xl": "w-full md:max-w-3xl",
    "5xl": "w-full md:max-w-4xl",
    full: "w-full",
    // 🌟 Ukuran baru: Lebar otomatis menyesuaikan isi konten (bisa membesar sesuai elemen di dalamnya)
    dynamic: "w-fit min-w-[320px] max-w-[90vw]",
};

export default function SidePanel({
    id,
    title,
    children,
    onConfirm,
    confirmText,
    cancelText,
    confirmLoading = false,
    isBackdropLoading = false,
    size = "dynamic", // 🌟 Mengubah default size menjadi 'dynamic'
    showFooter = true,
}: Readonly<SidePanelProps>) {
    const activeModalId = useModalStore((state) => state.activeModalId);
    const closeModal = useModalStore((state) => state.closeModal);

    const resetForm = useFormStore((state) => state.resetForm);

    const isOpen = activeModalId === id;

    const [isShaking, setIsShaking] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [shouldRender, setShouldRender] = useState(isOpen);

    // untk reset data, jika  berdsarkan openModal dan tidak akan ke reset jika openModalOnly
    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            const timer = setTimeout(() => setIsAnimating(true), 10);
            return () => clearTimeout(timer);
        } else {
            const freshIsOpeningWithData =
                useModalStore.getState().isOpeningWithData;

            if (freshIsOpeningWithData && resetForm) {
                resetForm();
                console.log(
                    "Zustand Form berhasil dibersihkan via penutupan reguler.",
                );
            }

            setIsAnimating(false);
            const timer = setTimeout(() => setShouldRender(false), 200);
            return () => clearTimeout(timer);
        }
        // 🌟 Bersihkan dependensi: Hapus isOpeningWithData dari array agar useEffect tidak terpicu ganda
    }, [isOpen, resetForm]);
    // Tambahkan isOpeningWithData ke dalam dependency array

    if (isOpen && !shouldRender) {
        setShouldRender(true);
    }

    if (!shouldRender) return null;

    const handleOverlayClick = () => {
        if (isBackdropLoading) return;
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 300);
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end pointer-events-none">
            {/* 1. BACKDROP TRANSPARAN / GELAP */}
            <div
                className={`fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-200 flex items-center justify-center z-40 pointer-events-auto
                ${isAnimating ? "opacity-100" : "opacity-0"}`}
            >
                <button
                    type="button"
                    className="absolute inset-0 h-full w-full border-none outline-none cursor-default"
                    onClick={handleOverlayClick}
                >
                    <span className="sr-only">Tutup panel</span>
                </button>

                {/* Indikator Spinner Loading */}
                {isBackdropLoading && (
                    <div className="relative z-50 flex items-center justify-center bg-slate-900/85 py-2.5 px-4 rounded-xl shadow-xl border border-slate-700/40 pointer-events-none select-none max-w-xs mx-auto">
                        <Skeleton variant="text-only" align="center" />
                    </div>
                )}
            </div>

            {/* 2. PANEL UTAMA DENGAN LEBAR DINAMIS */}
            <div
                className={`fixed inset-y-0 right-0 z-50 bg-slate-50 shadow-2xl transition-transform duration-200 ease-out flex flex-col pointer-events-auto
                ${sizeClasses[size]} 
                ${isAnimating && !isBackdropLoading ? "translate-x-0" : "translate-x-full"} 
                ${isShaking ? "animate-shake" : ""}`}
            >
                {/* Header Panel */}
                <div className="flex items-center justify-between border-b border-gray-200 p-3 shrink-0">
                    <h3 className="text-xs font-semibold text-gray-900 whitespace-nowrap">
                        {title}
                    </h3>
                    <button
                        type="button"
                        onClick={closeModal}
                        className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition ml-8"
                    >
                        ✕
                    </button>
                </div>

                {/* Body Panel */}
                <div className="flex-1 overflow-y-auto p-5 text-sm text-gray-600 w-full h-full">
                    <h2 className="font-thunder font-black text-3xl leading-tight tracking-tight uppercase text-gray-900 whitespace-nowrap [-webkit-text-stroke:0.5px_#111827]">
                        {title}
                    </h2>
                    <p className="mt-1 pb-6 text-xs text-gray-500 font-normal leading-relaxed max-w-sm">
                        Berikut merupakan detail{" "}
                        {title.toLowerCase().replace("tambah ", "")}, anda bisa
                        melakukan segala perubahan disini
                    </p>
                    {children}
                </div>

                {/* Footer Panel */}
                {/* Footer Panel - Diubah menjadi justify-center agar posisi tombol berada di tengah */}
                {showFooter && (
                    <div className="border-t border-gray-200 p-4 bg-slate-50 flex justify-center gap-2 shrink-0">
                        <Btn
                            type="button"
                            onClick={closeModal}
                            variant="default"
                            size="md"
                            fullWidth={true}
                            disabled={confirmLoading}
                        >
                            {cancelText ?? "Kembali"}
                        </Btn>

                        {onConfirm ? (
                            <Btn
                                type="button"
                                onClick={onConfirm}
                                disabled={confirmLoading}
                                variant="info"
                                size="md"
                                fullWidth={true}
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
                                variant="info"
                                size="md"
                                fullWidth={true}
                            >
                                {confirmLoading
                                    ? "Memproses..."
                                    : (confirmText ?? "Simpan")}
                            </Btn>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
