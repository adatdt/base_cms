import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Mengubah error Zod menjadi JSON response 400 standar yang bersih dari duplikasi.
 * Mendukung penuh TypeScript Strict Mode dan ekstraksi pesan tunggal.
 */
export function handleValidationError(error: z.ZodError): NextResponse {
  // Menggunakan top-level flattenError standar Zod v4
  const formattedErrors = z.flattenError(error);

  // 1. Ambil semua values dan saring (filter) hanya array yang benar-benar berisi pesan error
  const errorFields = Object.values(formattedErrors.fieldErrors).filter(
    (field): field is string[] => Array.isArray(field) && field.length > 0,
  );

  // 2. Ambil pesan pertama dari array pertama jika tersedia, jika tidak berikan fallback
  const firstErrorMessage =
    errorFields.length > 0 && errorFields[0]?.[0]
      ? errorFields[0][0]
      : "Validasi parameter gagal";

  return NextResponse.json(
    {
      success: false,
      error: "Validasi parameter gagal",
      message: firstErrorMessage, // Teks string murni pesan error pertama dari Zod
      details: formattedErrors.fieldErrors,
    },
    { status: 400 },
  );
}

/**
 * Mengubah Error Runtime menjadi JSON response 500 standar.
 */
export function handleServerError(error: unknown): NextResponse {
  const errorMessage =
    error instanceof Error ? error.message : "Internal Server Error";

  return NextResponse.json(
    {
      success: 0,
      error: errorMessage,
      message: errorMessage,
    },
    { status: 500 },
  );
}
