// app/api/menu/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { MenuService } from "@/lib/menuService";

export async function POST() {
  try {
    const headersList = await headers();
    // Membaca header 'user_group' yang dikirim oleh middleware baru
    const groupId = headersList.get("user_group");

    console.log("GroupId yang diterima API Menu:", groupId);

    if (!groupId) {
      return NextResponse.json(
        { success: false, message: "Sesi grup pengguna tidak ditemukan" },
        { status: 401 },
      );
    }

    const menuTree = await MenuService.getMenu(groupId);
    return NextResponse.json({
      success: true,
      data: menuTree,
      message: "success",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: [], message: `API Menu Error: ${error}` },
      { status: 500 },
    );
  }
}
