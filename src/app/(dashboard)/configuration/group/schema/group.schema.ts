import { inisialisasiZodBahasaIndonesia } from "@/utils/zod-indonesia";
inisialisasiZodBahasaIndonesia(); 
import { z } from "zod";

export const groupAddFormSchema = z.object({
    name: z
        .string()
        .min(1),
});

// Schema untuk mode EDIT (Mewarisi semua field ADD + Menimpa properti ID dengan benar)
export const groupEditFormSchema = groupAddFormSchema.extend({
    // 💡 SOLUSI: Langsung definisikan gabungan string/number tanpa .unwrapped()
    id: z
        .string()
        .or(z.number())
        .refine((val) => val !== undefined && val !== "", { 
            message: "ID Group wajib disertakan." 
        }),
});

export type GrouprAddFormData = z.infer<typeof groupAddFormSchema>;
export type GroupEditFormData = z.infer<typeof groupEditFormSchema>;
