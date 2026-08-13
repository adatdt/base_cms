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
            start: rawBody.start,
            length: rawBody.length,
            search: rawBody.search,
        };

        const validation = paginationQuerySchema.safeParse(rawQueryParams);

        // SOLUSI SONARQUBE: Abstraksi penuh logika error 400 ke satu baris fungsi helper
        if (!validation.success) {
            return handleValidationError(validation.error);
        }

        const { start, length, search } = validation.data;
        const offset = (start - 1) * length;

        // 2. SOLUSI SONARQUBE: Pembuatan filter WHERE via global helper
        const baseWhere = buildWhereClause(search, "gr", "name");

        const qry = sql`SELECT id, status, name FROM core.t_mtr_user_group gr`;
        const qryCount = sql`
        SELECT 
            COUNT(gr.id)::INT AS total 
        FROM core.t_mtr_user_group gr
    `;

        // 3. Eksekusi Query Data Utama dengan aman
        const records = await sql<
            { id: string | number; status: string | number; name: string }[]
        >`
        ${qry}
        ${baseWhere}
        ORDER BY gr.id DESC
        LIMIT ${length}
        OFFSET ${offset}
      `;

        // 4. Eksekusi Query Count dengan filter yang sama persis
        const countResult = await sql<{ total: string | number }[]>`
        ${qryCount}
        ${baseWhere}
      `;

        const total = Number(countResult[0]?.total || 0);

        // 5. SOLUSI SONARQUBE: Return response terformat via global helper
        const result = formatPaginatedResponse(records, total, start, length);

        return NextResponse.json({
            status: true,
            message: "success",
            code: 200,
            reqId: "SJCDBSJBD112",
            error: null,
            srvId: null,
            data: result,
        });
    } catch (error) {
        // SOLUSI SONARQUBE: Abstraksi penuh catch-block error 500
        return handleServerError(error);
    }
}
