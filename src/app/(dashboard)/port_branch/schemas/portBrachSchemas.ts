import { z } from "zod";

/**
 * Skema validasi Zod untuk Query Parameters pagination.
 * Menggunakan z.coerce untuk otomatis mengubah string URL menjadi tipe number.
 */
export const branchQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z
    .string()
    .trim()
    .max(100, "Kata kunci pencarian maksimal 100 karakter")
    .regex(
      /^[a-zA-Z0-9\s]*$/,
      "Pencarian tidak boleh mengandung karakter khusus atau simbol",
    )
    .optional()
    .default(""),
});

// Inferensi tipe data TypeScript otomatis dari skema Zod (Sangat disukai SonarQube)
export type BranchQueryInput = z.infer<typeof branchQuerySchema>;
