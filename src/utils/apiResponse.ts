import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Mengubah error Zod menjadi JSON response 400 standar yang bersih dari duplikasi.
 */
export function handleValidationError(error: z.ZodError) {
  // Menggunakan top-level flattenError standar Zod v4
  const formattedErrors = z.flattenError(error);

  return NextResponse.json(
    {
      success: false,
      error: "Validasi parameter gagal",
      details: formattedErrors.fieldErrors,
    },
    { status: 400 },
  );
}

/**
 * Mengubah Error Runtime menjadi JSON response 500 standar.
 */
export function handleServerError(error: unknown) {
  const errorMessage =
    error instanceof Error ? error.message : "Internal Server Error";

  return NextResponse.json(
    {
      success: 0,
      error: errorMessage,
    },
    { status: 500 },
  );
}
