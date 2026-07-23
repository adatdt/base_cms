import { z } from "zod";

// 1. Skema bentuk dasar data Anda (untuk referensi tipe data)
export interface InputSchema {
    name: string;
    label: string;
    variant: string;
    placeholder: string;
    options?: { value: string; label: string }[];
}

// Data array input dari Anda
export const input: InputSchema[] = [
    {
        name: "menu",
        label: "Menu",
        variant: "text",
        placeholder: "Masukkan menu",
    },
    {
        name: "action",
        label: "Aksi",
        variant: "select",
        placeholder: "Masukkan aksi",
        options: [
            { value: "0", label: "Tidak Ada (Jadikan Menu Utama)" },
            { value: "1", label: "Dashboard Utama" },
            { value: "2", label: "Pengaturan Sistem" },
            { value: "3", label: "Manajemen Pengguna" },
            { value: "4", label: "Hak Akses & Otentikasi" },
            { value: "5", label: "Profil Perusahaan" },
            { value: "6", label: "Manajemen Departemen" },
            { value: "7", label: "Daftar Karyawan" },
            { value: "8", label: "Absensi & Kehadiran" },
            { value: "9", label: "Pengajuan Cuti Karyawan" },
            { value: "10", label: "Sistem Penggajian (Payroll)" },
        ],
    },
    {
        name: "icon",
        label: "Ikon",
        variant: "text",
        placeholder: "Masukkan icon",
    },
    {
        name: "order",
        label: "Urutan",
        variant: "text",
        placeholder: "Masukkan order",
    },
    {
        name: "parent",
        label: "Parent",
        variant: "text",
        placeholder: "Masukkan parent",
    },
    { name: "url", label: "URL", variant: "text", placeholder: "Masukkan url" },
];

// 2. Generate Object Shape Zod secara otomatis dengan aturan spesifik
const dynamicShape = input.reduce(
    (acc, item) => {
        // Kondisi khusus jika nama field adalah 'url'
        if (item.name === "url") {
            acc[item.name] = z
                .string()
                .min(1, { message: "URL wajib diisi" })
                .startsWith("/", {
                    message: "URL harus diawali dengan karakter '/'",
                }); // Cocok untuk routing internal Next.js/React Router
        }
        // Kondisi khusus jika nama field adalah 'order' (Urutan)
        else if (item.name === "order") {
            acc[item.name] = z
                .string()
                .min(1, { message: "Urutan angka wajib diisi" })
                .regex(/^\d+$/, {
                    message: "Urutan harus berupa angka bulat positif",
                });
        }
        // Kondisi default untuk field text & select lainnya
        else {
            acc[item.name] = z
                .string()
                .min(1, { message: `${item.label} tidak boleh kosong` });
        }

        return acc;
    },
    {} as Record<string, z.ZodTypeAny>,
);

// 3. Buat skema Zod utama yang siap diekspor
export const menuFormSchema = z.object(dynamicShape);

// 4. Ekstrak tipe data murni TypeScript dari skema Zod di atas
export type MenuFormData = z.infer<typeof menuFormSchema>;
