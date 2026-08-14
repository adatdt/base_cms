import { inisialisasiZodBahasaIndonesia } from "@/utils/zod-indonesia";
inisialisasiZodBahasaIndonesia();
import { z } from "zod";

const antiXssRegex = /^[^<>'";()[\]\\/]*$/;
const xssErrorMessage =
    "Input mengandung karakter khusus yang dilarang untuk alasan keamanan";

export const providerCategoryAddFormSchema = z.object({
    bussines_category: z
        .string()
        .min(1)
        .regex(antiXssRegex, { message: xssErrorMessage }),
});

// Schema untuk mode EDIT (Mewarisi semua field ADD + Menimpa properti ID dengan benar)
export const providerCategoryEditFormSchema =
    providerCategoryAddFormSchema.extend({
        // 💡 SOLUSI: Langsung definisikan gabungan string/number tanpa .unwrapped()
        id: z
            .string()
            .or(z.number())
            .refine((val) => val !== undefined && val !== "", {
                message: "ID Group wajib disertakan.",
            }),
    });

export type ProviderCategoryAddFormData = z.infer<
    typeof providerCategoryAddFormSchema
>;
export type BussinessCategoryEditFormData = z.infer<
    typeof providerCategoryEditFormSchema
>;
