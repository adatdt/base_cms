import { NextResponse } from "next/server";
import { paginationQuerySchema } from "@/schemas/paginationSchema";
import { handleValidationError, handleServerError } from "@/utils/apiResponse";
import { sql } from "@/lib/db";
import { buildWhereClause, formatPaginatedResponse } from "@/utils/queryHelper";

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
     const offset = (page - 1) * limit;



      // 2. SOLUSI SONARQUBE: Pembuatan filter WHERE via global helper
      const baseWhere =  buildWhereClause(search, "gr", "name");

      const qry =  sql`SELECT id, status, name FROM core.t_mtr_user_group gr`
      const qryCount = sql`
        SELECT 
            COUNT(gr.id)::INT AS total 
        FROM core.t_mtr_user_group gr
    `;
      

      // 3. Eksekusi Query Data Utama dengan aman
      const data = await sql<{id:string|number;status:string|number; name:string}[]>`
        ${qry}
        ${baseWhere}
        ORDER BY gr.id DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;



      // 4. Eksekusi Query Count dengan filter yang sama persis
      const countResult = await sql<{ total: string | number }[]>`
        ${qryCount}
        ${baseWhere}
      `;

      const total = Number(countResult[0]?.total || 0);

      // 5. SOLUSI SONARQUBE: Return response terformat via global helper
      const result = formatPaginatedResponse(data, total, page, limit);

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
