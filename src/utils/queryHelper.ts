import { sql } from "@/lib/db";

export interface PaginationParams {
  search: string;
  page: number;
  limit: number;
  offset: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_data: number;
  total_page: number;
}

/**
 * 1. Parse parameter pagination dari URLSearchParams secara seragam
 */
export function parsePagination(
  searchParams: URLSearchParams,
): PaginationParams {
  const search = (searchParams.get("search") || "").trim();
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const limit = Math.max(
    1,
    Math.min(100, Number(searchParams.get("limit") || 10)),
  );
  const offset = (page - 1) * limit;

  return { search, page, limit, offset };
}

/**
 * 2. Bangun klausa WHERE dinamis untuk pencarian
 */
export function buildWhereClause(
  search: string,
  tablePrefix = "u",
  searchField = "username",
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
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  return {
    data,
    total,
    page,
    limit,
    total_data: total,
    total_page: Math.ceil(total / limit) || 1,
  };
}
