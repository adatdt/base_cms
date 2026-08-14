import { inisialisasiZodBahasaIndonesia } from "@/utils/zod-indonesia";
inisialisasiZodBahasaIndonesia();
import { z } from "zod";

const antiXssRegex = /^[^<>'";()[\]\\/]*$/;
const xssErrorMessage =
    "Input mengandung karakter khusus yang dilarang untuk alasan keamanan";

export const paymentSchemaAddFormSchema = z.object({
    payment_schema_name: z
        .string()
        .min(1)
        .regex(antiXssRegex, { message: xssErrorMessage }),
});

// Schema untuk mode EDIT (Mewarisi semua field ADD + Menimpa properti ID dengan benar)
export const paymentSchemaEditFormSchema = paymentSchemaAddFormSchema.extend({
    // 💡 SOLUSI: Langsung definisikan gabungan string/number tanpa .unwrapped()
    id: z
        .string()
        .or(z.number())
        .refine((val) => val !== undefined && val !== "", {
            message: "ID Group wajib disertakan.",
        }),
});

export type GrouprAddFormData = z.infer<typeof paymentSchemaAddFormSchema>;
export type GroupEditFormData = z.infer<typeof paymentSchemaEditFormSchema>;
