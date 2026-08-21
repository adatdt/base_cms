import { inisialisasiZodBahasaIndonesia } from "@/utils/zod-indonesia";
inisialisasiZodBahasaIndonesia();
import { z } from "zod";

export const groupAddFormSchema = z.object({
    name: z.string().min(1).trim(),
    description: z.string().min(1).trim(),
});

export const groupEditFormSchema = groupAddFormSchema.extend({
    id: z
        .string()
        .or(z.number())
        .refine((val) => val !== undefined && val !== "", {
            message: "ID Group wajib disertakan.",
        }),
});

export type GroupAddFormData = z.infer<typeof groupAddFormSchema>;
export type GroupEditFormData = z.infer<typeof groupEditFormSchema>;
