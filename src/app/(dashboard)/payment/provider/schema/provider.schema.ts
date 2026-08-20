import { inisialisasiZodBahasaIndonesia } from "@/utils/zod-indonesia";
inisialisasiZodBahasaIndonesia();
import { z } from "zod";

// Regex Keamanan Anti-XSS bawaan Anda
const antiXssRegex = /^[^<>'";()[\]\\/]*$/;
const xssErrorMessage =
    "Input mengandung karakter khusus yang dilarang untuk alasan keamanan";

// Konfigurasi Validasi File Gambar (Maksimal 3.88MB)
const MAX_FILE_SIZE = 3.88 * 1024 * 1024; // Konversi MB ke Bytes
const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".svg"];

// 💡 SOLUSI SONARQUBE: Fungsi validasi URL menggunakan native URL API untuk menghindari celah keamanan ReDoS
const isValidSecureUrl = (val: string): boolean => {
    try {
        const parsedUrl = new URL(val);
        // Memastikan protokol wajib berupa http: atau https: demi keamanan transmisi data
        return (
            parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:"
        );
    } catch {
        return false;
    }
};

const urlErrorMessage =
    "Format Base URL tidak valid (Harus diawali http:// atau https://)";

// 1. Schema untuk Mode ADD (Tambah Data)
export const providerAddFormSchema = z.object({
    // Nama Kategori Bisnis (Variant: text)
    bussines_category: z
        .string()
        .min(1, { message: "Nama kategori bisnis wajib diisi" })
        .regex(antiXssRegex, { message: xssErrorMessage }),

    // Gambar Provider (Variant: input-file)
    // 💡 PERBAIKAN: Menggunakan ekstening akhir file untuk mengatasi bug MIME-type pada browser
    file_provider: z
        .any()
        .refine((file) => file instanceof File, "File wajib diunggah.")
        .refine(
            (file) => file?.size <= MAX_FILE_SIZE,
            `Ukuran berkas maksimal adalah 3.88MB.`,
        )
        .refine((file) => {
            if (!(file instanceof File)) return false;
            const fileName = file.name.toLowerCase();
            return ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));
        }, "Format berkas harus berupa .PNG, .JPG, .JPEG, atau .SVG."),
    non_snap: z
        .string()
        .min(1, { message: "Base URL Non-SNAP wajib diisi" })
        .refine(isValidSecureUrl, {
            message: `Format Base URL Non-SNAP tidak valid (Harus diawali http:// atau https://)`,
        }),
    snap: z
        .string()
        .min(1, { message: "Base URL SNAP wajib diisi" })
        .refine(isValidSecureUrl, {
            message: `Format Base URL SNAP tidak valid (Harus diawali http:// atau https://)`,
        }),

    // Config Timeout Read (Variant: text-addon)
    timeout_read: z
        .string()
        .min(1, { message: "Config timeout read wajib diisi" })
        .regex(/^\d+$/, {
            message: "Timeout harus berupa angka murni (detik)",
        }),

    // Config Timeout Write (Variant: text-addon)
    timeout_white: z
        .string()
        .min(1, { message: "Config timeout write wajib diisi" })
        .regex(/^\d+$/, {
            message: "Timeout harus berupa angka murni (detik)",
        }),
});

// 2. Schema untuk Mode EDIT (Mewarisi skema ADD + modifikasi file opsional jika tidak diganti saat edit)
export const providerEditFormSchema = providerAddFormSchema.extend({
    // ID Utama Dokumen
    id: z
        .string()
        .or(z.number())
        .refine((val) => val !== undefined && val !== "", {
            message: "ID Provider wajib disertakan.",
        }),
    file_provider: z
        .any()
        .refine(
            (file) => file !== undefined && file !== null && file !== "",
            "File wajib disertakan.",
        )
        .refine(
            (file) => !(file instanceof File) || file.size <= MAX_FILE_SIZE,
            `Ukuran berkas maksimal adalah 3.88MB.`,
        )
        .refine((file) => {
            // Toleransi jika data dari API backend berupa string URL (berkas lama tidak diubah)
            if (typeof file === "string" && file !== "") return true;

            if (file instanceof File) {
                const fileName = file.name.toLowerCase();
                return ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));
            }
            return false;
        }, "Format berkas harus berupa .PNG, .JPG, .JPEG, atau .SVG."),
});

// 3. Ekstraksi Tipe Data TypeScript (Type Inference)
export type ProviderAddFormData = z.infer<typeof providerAddFormSchema>;
export type ProviderEditFormData = z.infer<typeof providerEditFormSchema>;
