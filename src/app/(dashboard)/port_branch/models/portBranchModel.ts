import { sql } from "@/lib/db";

export interface BranchDetail {
  ship_class_name: string | null;
  port_name: string | null;
  id: string;
  port_id: string;
  ship_class: string;
  name: string;
  // Tambahkan field dari tabel app.t_mtr_branch secara eksplisit jika diperlukan
  [key: string]: any;
}

export class PortBranchModel {
  /**
   * Mengambil data branch terpaginasi menggunakan parameter halaman dan batasan data.
   * Menggunakan Tagged Template Literal agar parameter terikat dinamis dan aman dari SQL Injection.
   */
  static async getAllBranchesWithDetails(
    searchParams: URLSearchParams,
  ): Promise<{
    data: BranchDetail[];
    total: number;
    page: number;
    limit: number;
    total_data: number;
    total_page: number;
  }> {
    const search = (searchParams.get("search") || "").trim();
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.max(
      1,
      Math.min(100, Number(searchParams.get("limit") || 10)),
    );
    const offset = (page - 1) * limit;

    // 1. Definisikan kondisi dasar (Base condition)
    let baseWhere = sql`WHERE a.status <> '-5'`;

    // 2. Tambahkan filter search secara dinamis dan AMAN menggunakan placeholder bawaan library postgres
    if (search !== "") {
      const searchPattern = `%${search}%`;
      baseWhere = sql`${baseWhere} AND b.name ILIKE ${searchPattern}`;
    }

    // 3. Eksekusi Query Data Utama dengan aman
    const data = await sql<BranchDetail[]>`
      SELECT 
        c.name AS ship_class_name, 
        b.name AS port_name, 
        a.* 
      FROM app.t_mtr_branch a
      LEFT JOIN app.t_mtr_port b ON a.port_id = b.id
      LEFT JOIN app.t_mtr_ship_class c ON a.ship_class = c.id
      ${baseWhere}
      ORDER BY a.id DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    // 4. Eksekusi Query Count dengan filter yang sama persis
    const countResult = await sql<{ total: number }[]>`
      SELECT COUNT(a.id)::INT AS total 
      FROM app.t_mtr_branch a
      LEFT JOIN app.t_mtr_port b ON a.port_id = b.id
      LEFT JOIN app.t_mtr_ship_class c ON a.ship_class = c.id
      ${baseWhere}
    `;

    const total = countResult[0]?.total || 0;

    return {
      data,
      total,
      page,
      limit,
      total_data: total,
      total_page: Math.ceil(total / limit) || 1,
    };
  }
}
