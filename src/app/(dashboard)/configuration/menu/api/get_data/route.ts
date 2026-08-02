import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { MenuService } from "../../service/menuService";

export async function GET() {
  try {
    const headersList = await headers();
    const groupId = headersList.get("user_group");

    if (!groupId) {
      return NextResponse.json(
        { success: false, message: "Sesi grup pengguna tidak ditemukan" },
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
