import { inisialisasiZodBahasaIndonesia } from "@/utils/zod-indonesia";
inisialisasiZodBahasaIndonesia();
import { z } from "zod";

const antiXssRegex = /^[^<>'";()[\]\\/]*$/;
const xssErrorMessage =
    "Input mengandung karakter khusus yang dilarang untuk alasan keamanan";

export const parameterAddFormSchema = z.object({
    param_name: z
        .string()
        .min(1)
        .regex(antiXssRegex, { message: xssErrorMessage }),

    param_type: z
        .string()
        .min(1)
        .regex(antiXssRegex, { message: xssErrorMessage }),

    param_value: z
        .string()
        .min(1)
        .regex(antiXssRegex, { message: xssErrorMessage }),

    value_type: z
        .string()
        .min(1)
        .regex(antiXssRegex, { message: xssErrorMessage }),

    // Khusus deskripsi, biasanya membutuhkan tanda petik atau kurung biasa,
    // jadi kita hanya memblokir tag HTML saja (< dan >) agar pengisian teks deskripsi tetap fleksibel
    description: z
        .string()
        .min(1)
        .regex(/^[^<>]*$/, {
            message: "Deskripsi tidak boleh mengandung karakter < atau >",
        }),
});

// Schema untuk mode EDIT (Mewarisi semua field ADD + Menimpa properti ID dengan benar)
export const parameterEditFormSchema = parameterAddFormSchema.extend({
    // 💡 SOLUSI: Langsung definisikan gabungan string/number tanpa .unwrapped()
    id: z
        .string()
        .or(z.number())
        .refine((val) => val !== undefined && val !== "", {
            message: "ID Group wajib disertakan.",
        }),
});

export type GrouprAddFormData = z.infer<typeof parameterAddFormSchema>;
export type GroupEditFormData = z.infer<typeof parameterEditFormSchema>;
