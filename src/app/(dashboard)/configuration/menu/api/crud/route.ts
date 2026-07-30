import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { MenuService } from "../../service/menuService";
import { menuFormSchema } from "../../schema/menu.schema";
import z from "zod";

export async function GET() {
    try {
        const headersList = await headers();
        const groupId = headersList.get("user_group");

        if (!groupId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Sesi grup pengguna tidak ditemukan",
                },
                { status: 401 },
            );
        }

        const menuData = await MenuService.getMenu();

        return NextResponse.json({
            success: true,
            data: menuData,
            message: "success",
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, data: [], message: `API Menu Error: ${error}` },
            { status: 500 },
        );
    }
}

export async function POST(request: Request) {
    try {
        // 1. Cek Autentikasi / Authorization dari Header
        const headersList = await headers();
        const groupId = headersList.get("user_group");

        if (!groupId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Sesi grup pengguna tidak ditemukan",
                },
                { status: 401 },
            );
        }

        // 2. Ambil data JSON dari body request
        const body = await request.json();

        // 3. Jalankan Validasi Zod di Sisi Server (Safe Parse)
        const result = menuFormSchema.safeParse(body);

        if (!result.success) {
            // ✅ The modern, non-deprecated Zod v4 way to format field errors
            const flattened = z.flattenError(result.error);

            return NextResponse.json(
                {
                    success: false,
                    message: "Validasi data gagal",
                    // Returns a clean { fieldErrors: { menu: ["..."], url: ["..."] } } object
                    errors: flattened.fieldErrors,
                },
                { status: 400 },
            );
        }

        // 4. Kirim data yang sudah valid (Order otomatis berupa number) ke Service Database
        // Anda juga bisa menyertakan groupId jika diperlukan oleh service Anda
        const newMenu = await MenuService.createMenu(result.data);

        // 5. Kembalikan respon sukses
        return NextResponse.json(
            {
                success: true,
                data: newMenu,
                message: "Menu berhasil ditambahkan",
            },
            { status: 201 },
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, message: `API Create Menu Error: ${error}` },
            { status: 500 },
        );
    }
}
