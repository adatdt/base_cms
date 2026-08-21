import React from "react";
import NextImage from "next/image";
import Btn from "../ui/Btn";
import { useModalStore } from "@/store/useModalStore";
export type IconType = "ask" | "warning";

interface ConfirmationContentProps {
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmLoading?: boolean;
    iconType?: IconType;
}

const iconMapping: Record<IconType, string> = {
    ask: "/images/hero-ask.png",
    warning: "/images/hero-warning.png",
};

export const ConfirmationContent: React.FC<ConfirmationContentProps> = ({
    title = "Anda yakin untuk melakukan penambahan data  ini?",
    description = "Pastikan semua data yang Anda masukkan sudah sesuai jika belum sesuai Anda bisa melakukan pengecekan kembali",
    confirmText = "Ya, tambah data sekarang",
    cancelText = "Tidak, cek kembali",
    onConfirm,
    onCancel,
    confirmLoading = false,
    iconType = "ask",
}) => {
    const closeModal = useModalStore((state) => state.closeModal);
    const handleCancel = () => {
        if (onCancel) {
            // Jika ada aksi kustom yang dikirim lewat props, jalankan aksi tersebut
            onCancel();
        } else {
            // Jika tidak ada props onCancel, jalankan fungsi close modal default
            closeModal();
        }
    };
    return (
        <div className="flex flex-col items-center justify-center text-center p-1 mx-auto  select-none">
            {/* Wavy Badge Question Mark Icon */}
            <div className="mb-6 flex items-center justify-center">
                <NextImage
                    src={iconMapping[iconType]}
                    alt="Badge Tanya"
                    width={96}
                    height={96}
                    className="object-contain"
                    priority // Tambahkan jika gambar ini muncul di bagian atas halaman (LCP)
                />
            </div>

            {/* Title */}
            <h2 className="text-lg font-bold text-slate-800 leading-snug tracking-normal mb-3 px-1">
                {title}
            </h2>

            {/* Description */}
            <p className="text-xs text-slate-400 font-normal leading-relaxed  px-2">
                {description}
            </p>

            {/* Tombol Aksi Vertikal Sesuai Gambar */}
            <div className="flex flex-col w-full gap-3 mt-6">
                {/* Tombol Utama (Konfirmasi Atas) */}
                {onConfirm ? (
                    <Btn
                        type="button"
                        onClick={onConfirm}
                        disabled={confirmLoading}
                        variant="info"
                    >
                        {confirmLoading
                            ? "Memproses..."
                            : (confirmText ?? "Simpan")}
                    </Btn>
                ) : (
                    <Btn type="submit" disabled={confirmLoading} variant="info">
                        {confirmLoading
                            ? "Memproses..."
                            : (confirmText ?? "Simpan")}
                    </Btn>
                )}

                {/* Tombol Batal (Bawah) */}
                <Btn
                    type="button"
                    onClick={handleCancel}
                    disabled={confirmLoading}
                    variant="default"
                >
                    {cancelText ?? "Batal"}
                </Btn>
            </div>
        </div>
    );
};
