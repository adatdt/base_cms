import { sql } from "@/lib/db";

export interface PaginationParams {
    search: string;
    start: number;
    length: number;
    offset: number;
}

export interface PaginatedResult<T> {
    recordsFiltered: number;
    recordsTotal: string | number;
    pageTotal: number;
    currentPage: number;
    start: number;
    records: T[];
}

/**
 * 1. Parse parameter pagination dari URLSearchParams secara seragam
 */
export function parsePagination(
    searchParams: URLSearchParams,
): PaginationParams {
    const search = (searchParams.get("search") || "").trim();
    const start = Math.max(1, Number(searchParams.get("page") || 1));
    const length = Math.max(
        1,
        Math.min(100, Number(searchParams.get("limit") || 10)),
    );
    const offset = (start - 1) * length;

    return { search, start, length, offset };
}

/**
 * 2. Bangun klausa WHERE dinamis untuk pencarian
 */
export function buildWhereClause(
    search: string,
    tablePrefix = "u",
    searchField = "",
) {
    // 1. Gunakan sql("string") atau sql`string` untuk mendefinisikan identifier/keyword mentah yang dinamis
    // Di Postgres.js, melemparkan fungsi sql() di dalam template literal akan dianggap sebagai nama objek (bukan teks string terikat)
    let baseWhere = sql`WHERE ${sql(tablePrefix)}.status <> '-5'`;

    if (search !== "") {
        const searchPattern = `%${search}%`;

        // 2. Gabungkan prefix dan field secara dinamis menggunakan sintaks internal postgres.js
        baseWhere = sql`${baseWhere} AND ${sql(tablePrefix)}.${sql(searchField)} ILIKE ${searchPattern}`;
    }

    return baseWhere;
}

/**
 * 3. Buat struktur output respons paginasi global
 */
export function formatPaginatedResponse<T>(
    records: T[],
    total: number,
    start: number,
    length: number,
): PaginatedResult<T> {
    const limit = length <= 0 ? 10 : length;
    const pageTotal = Math.ceil(total / limit) || 1;
    const currentPage = Math.floor(start / limit) + 1;

    return {
        recordsFiltered: records.length, // Jumlah data yang dikembalikan pada halaman ini
        recordsTotal: total, // Menggunakan nilai number (bisa dikonversi ke string jika wajib)
        pageTotal,
        currentPage,
        start,
        records,
    };
}
