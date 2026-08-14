import { inisialisasiZodBahasaIndonesia } from "@/utils/zod-indonesia";
inisialisasiZodBahasaIndonesia();
import { z } from "zod";

const antiXssRegex = /^[^<>'";()[\]\\/]*$/;
const xssErrorMessage =
    "Input mengandung karakter khusus yang dilarang untuk alasan keamanan";

export const bussinesCategoryAddFormSchema = z.object({
    bussines_category: z
        .string()
        .min(1)
        .regex(antiXssRegex, { message: xssErrorMessage }),
});

// Schema untuk mode EDIT (Mewarisi semua field ADD + Menimpa properti ID dengan benar)
export const bussinesCategoryEditFormSchema =
    bussinesCategoryAddFormSchema.extend({
        // 💡 SOLUSI: Langsung definisikan gabungan string/number tanpa .unwrapped()
        id: z
            .string()
            .or(z.number())
            .refine((val) => val !== undefined && val !== "", {
                message: "ID Group wajib disertakan.",
            }),
    });

export type BussinessCategoryAddFormData = z.infer<
    typeof bussinesCategoryAddFormSchema
>;
export type BussinessCategoryEditFormData = z.infer<
    typeof bussinesCategoryEditFormSchema
>;
