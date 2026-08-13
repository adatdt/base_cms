import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { MenuService } from "../../service/menuService";
import { handleServerError } from "@/utils/apiResponse";

export async function GET() {
  try {
    const headersList = await headers();
    const groupId = headersList.get("user_group");

    if (!groupId) {
      return NextResponse.json(
        {
          status: false,
          message: "Sesi grup pengguna tidak ditemukan",
          code: 401,
          reqId: "SJCDBSJBD112",
          error: "USER_GROUP_NOT_FOUND",
          srvId: null,
          data: [],
        },
        {
          status: 401,
        },
      );
    }

    const menuData = await MenuService.getMenu();

    return NextResponse.json(
      {
        status: true,
        message: "success",
        code: 200,
        reqId: "SJCDBSJBD112",
        error: null,
        srvId: null,
        data: menuData,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    return handleServerError(error);
  }
}