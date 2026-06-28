import { z } from "zod";

export const loginSchema = z.object({
  // PERBAIKAN: Gunakan z.email() langsung untuk standarisasi Zod V4
  email: z
    .email({ message: "Format email tidak valid" })
    .and(z.string().min(1, { message: "Email wajib diisi" })),
    
  password: z
    .string()
    .min(6, { message: "Password minimal berisi 6 karakter" }),
});

export type LoginInput = z.infer<typeof loginSchema>;
