// app/api/menu/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { MenuService } from "@/lib/menuService"; // Sesuaikan jalur impor Anda

export async function POST() {
  try {
    // 1. Ambil user group ID dari header yang dikirim oleh middleware sesi Anda
    const headersList = await headers();
    const groupId = headersList.get("x-user-group");

    if (!groupId) {
      return NextResponse.json(
        { success: false, message: "Sesi grup pengguna tidak ditemukan" },
        { status: 401 },
      );
    }

    // 2. Tarik data pohon menu dari Class Repository yang sudah kita buat
    const menuTree = await MenuService.getMenu(groupId);

    // 3. Kembalikan respons sukses ke client
    return NextResponse.json({ success: true, data: menuTree });
  } catch (error) {
    console.error("API Menu Error:", error);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}
