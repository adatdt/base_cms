import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { MenuService } from "../../../service/menuService"; // Sesuaikan dengan path service Anda

interface RouteParams {
    params: Promise<{ id: string }>; // Definisi tipe data params sesuai standar Next.js terbaru
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        // 1. Ambil nilai 'id' dari parameter URL dinamis
        const { id } = await params; 

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

        const mockSearchParams = new URLSearchParams();
        mockSearchParams.set("id", id);
        // 2. Kirim 'id' langsung sebagai string ke fungsi Service, bukan searchParams lagi
        const getDetail = await MenuService.edit(mockSearchParams);

        return NextResponse.json({
            success: true,
            data: getDetail,
            message: "success",
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, data: [], message: `API Menu Error: ${error}` },
            { status: 500 },
        );
    }
}
