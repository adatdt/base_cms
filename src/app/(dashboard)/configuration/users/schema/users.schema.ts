import { z } from "zod";

export const userAddFormSchema = z.object({
    // 1. Username - Wajib diisi, minimal 3 karakter
    username: z
        .string()
        .min(3) 
        .regex(/^[a-zA-Z0-9_-]+$/),

    // 2. Nama Depan - Wajib diisi
    nama_depan: z
        .string()
        .min(1),

    // 3. No. Telepon - Wajib diisi (8-15 digit)
    no_telepon: z
        .string()
        .min(1)
        .refine(
            (val) => /^[0-9+]{8,15}$/.test(val),
            { message: "Nomor telepon tidak valid (minimal 8-15 digit angka)." }
        ),

    // 4. Group (Select) - Wajib memilih salah satu opsi
    group: z
        .string()
        .or(z.number())
        .refine((val) => val !== undefined && val !== "", {
            message: "Kolom ini wajib diisi.",
        }),
});

// Schema untuk mode EDIT (Mewarisi semua field ADD + Menimpa properti ID dengan benar)
export const userEditFormSchema = userAddFormSchema.extend({
    // 💡 SOLUSI: Langsung definisikan gabungan string/number tanpa .unwrapped()
    id: z
        .string()
        .or(z.number())
        .refine((val) => val !== undefined && val !== "", { 
            message: "ID User wajib disertakan." 
        }),
});

export type UserAddFormData = z.infer<typeof userAddFormSchema>;
export type UserEditFormData = z.infer<typeof userEditFormSchema>;
