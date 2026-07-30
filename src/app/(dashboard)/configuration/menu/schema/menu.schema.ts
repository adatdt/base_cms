import { z } from "zod";

export const menuFormSchema = z.object({
    // 1. Menu (Text) - Wajib diisi, minimal 3 karakter
    menu: z
        .string()
        .min(1, { message: "Nama menu wajib diisi" })
        .min(3, { message: "Nama menu minimal 3 karakter" }),

    // 2. Action (Select) - Wajib memilih salah satu opsi yang tersedia (0-10)
    action: z.string(),
    // .nonempty("Silakan pilih aksi yang valid")
    // .refine(
    //     (val) =>
    //         [
    //             "0",
    //             "1",
    //             "2",
    //             "3",
    //             "4",
    //             "5",
    //             "6",
    //             "7",
    //             "8",
    //             "9",
    //             "10",
    //         ].includes(val),
    //     { message: "Silakan pilih aksi yang valid" },
    // )
    // 3. Icon (Text) - Opsional, boleh kosong
    icon: z.string().optional().or(z.literal("")),

    // 4. Order (Text input tapi berisi Angka) - Mengubah string menjadi number dan memvalidasinya
    order: z
        .string()
        .min(1, { message: "Urutan wajib diisi" })
        .refine((val) => !Number.isNaN(Number(val)), {
            message: "Urutan harus berupa angka",
        })
        .transform(Number)
        .pipe(z.number().min(1, { message: "Urutan minimal bernilai 1" })),

    // 5. Parent (Text) - Opsional, jika menu utama biasanya kosong atau diisi ID parent
    parent: z.string().optional().or(z.literal("")),

    // 6. URL (Text) - Wajib diisi, format harus diawali dengan slash (/) atau url valid
    url: z
        .string()
        .min(1, { message: "URL wajib diisi" })
        .regex(/^\/[a-zA-Z0-9\-_/]*$/, {
            message:
                "Format URL tidak valid, harus diawali dengan '/' (contoh: /dashboard)",
        }),
});

export const menuEditFormSchema = menuFormSchema.extend({
    id: z.string().min(1, { message: "ID Menu wajib disertakan" }), // Bisa juga z.number() tergantung database Anda
});

// Infer tipe data dari schema untuk digunakan pada TypeScript React Anda
export type MenuFormData = z.infer<typeof menuFormSchema>;
export type MenuEditFormData = z.infer<typeof menuEditFormSchema>;
