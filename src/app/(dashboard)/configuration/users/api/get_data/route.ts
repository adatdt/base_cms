import { NextResponse } from "next/server";
import { UsersService } from "../../service/usersService";
import { branchQuerySchema } from "../../schemas/portBrachSchemas";
import { z } from "zod"; // WAJIB impor 'z' untuk menggunakan z.flattenError

export async function POST(request: Request) {
  try {
    // 1. Ambil data mentah langsung dari JSON Body request POST
    const rawBody = await request.json();

    const rawQueryParams = {
      page: rawBody.page,
      limit: rawBody.limit,
      search: rawBody.search, // Menampung parameter pencarian baru
    };

    // 2. Jalankan validasi menggunakan safeParse() milik Zod
    const validation = branchQuerySchema.safeParse(rawQueryParams);

    // 3. Jika validasi gagal, olah menggunakan z.flattenError() standar Zod v4
    if (!validation.success) {
      const formattedErrors = z.flattenError(validation.error);

      return NextResponse.json(
        {
          success: false,
          error: "Validasi parameter gagal",
          details: formattedErrors.fieldErrors, // Mengembalikan struktur key-value yang bersih
        },
        { status: 400 },
      );
    }

    // 4. Ambil data yang sudah bersih hasil parsing Zod
    const { page, limit, search } = validation.data;

    // 5. Susun kembali URLSearchParams yang aman untuk dikirim ke Service
    const validatedSearchParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search: (search || "").toString(), // Pastikan parameter search ikut dikirim ke layer service
    });

    // 6. Memanggil layer service secara langsung dengan menyertakan parameter aman
    const result = await UsersService.getAllList(validatedSearchParams);

    return NextResponse.json({
      success: 1,
      message: "success",
      ...result,
    });
  } catch (error) {
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
}
