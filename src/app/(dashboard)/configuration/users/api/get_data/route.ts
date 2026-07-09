import { NextResponse } from "next/server";
import { UsersService } from "../../service/usersService";
import { paginationQuerySchema } from "@/schemas/paginationSchema";
// Import utilitas pencegah duplikasi SonarQube
import { handleValidationError, handleServerError } from "@/utils/apiResponse";

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();

    // Map object mentah dari request body
    const rawQueryParams = {
      page: rawBody.page,
      limit: rawBody.limit,
      search: rawBody.search,
    };

    const validation = paginationQuerySchema.safeParse(rawQueryParams);

    // SOLUSI SONARQUBE: Abstraksi penuh logika error 400 ke satu baris fungsi helper
    if (!validation.success) {
      return handleValidationError(validation.error);
    }

    const { page, limit, search } = validation.data;

    const validatedSearchParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search: (search || "").toString(),
    });

    const result = await UsersService.getAllList(validatedSearchParams);

    return NextResponse.json({
      success: 1,
      message: "success",
      ...result,
    });
  } catch (error) {
    // SOLUSI SONARQUBE: Abstraksi penuh catch-block error 500
    return handleServerError(error);
  }
}
