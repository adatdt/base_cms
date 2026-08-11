import { inisialisasiZodBahasaIndonesia } from "@/utils/zod-indonesia";
inisialisasiZodBahasaIndonesia();
import { z } from "zod";

export const actionAddFormSchema = z.object({
    name: z.string().min(1),
});

// Schema untuk mode EDIT (Mewarisi semua field ADD + Menimpa properti ID dengan benar)
export const actionEditFormSchema = actionAddFormSchema.extend({
    // 💡 SOLUSI: Langsung definisikan gabungan string/number tanpa .unwrapped()
    id: z
        .string()
        .or(z.number())
        .refine((val) => val !== undefined && val !== "", {
            message: "ID Group wajib disertakan.",
        }),
});

export type ActionAddFormData = z.infer<typeof actionAddFormSchema>;
export type ActionEditFormData = z.infer<typeof actionEditFormSchema>;
