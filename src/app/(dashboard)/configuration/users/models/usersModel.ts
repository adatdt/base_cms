import { sql } from "@/lib/db";
import type { UserQueryResult } from "../interfaces/users";

export class UsersModel {
  /**
   * Mengambil data branch terpaginasi menggunakan parameter halaman dan batasan data.
   * Menggunakan Tagged Template Literal agar parameter terikat dinamis dan aman dari SQL Injection.
   */
  static async getAllList(searchParams: URLSearchParams): Promise<{
    data: UserQueryResult[];
    total: number;
    page: number;
    limit: number;
    total_data: number;
    total_page: number;
  }> {
    try {
      const search = (searchParams.get("search") || "").trim();
      const page = Math.max(1, Number(searchParams.get("page") || 1));
      const limit = Math.max(
        1,
        Math.min(100, Number(searchParams.get("limit") || 10)),
      );
      const offset = (page - 1) * limit;

      // 1. Kondisi dasar (Base condition) menggunakan tag sql biasa
      let baseWhere = sql`WHERE u.status <> '-5'`; // Pastikan prefix tabel benar (misal 'u.status' jika status ada di tabel user)

      // 2. Filter pencarian dinamis (Otomatis Parameterized Query & Anti SQL Injection)
      if (search !== "") {
        const searchPattern = `%${search}%`;
        baseWhere = sql`${baseWhere} AND u.username ILIKE ${searchPattern}`;
      }

      // Ambil kerangka kueri utama langsung dari method (tidak perlu dibungkus sql`${}` ganda)
      const qry = this.qry();
      const qryCount = this.qryCount();

      // 3. Eksekusi Query Data Utama dengan aman
      const data = await sql<UserQueryResult[]>`
        ${qry}
        ${baseWhere}
        ORDER BY u.id DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;

      // 4. Eksekusi Query Count dengan filter yang sama persis
      const countResult = await sql<{ total: string | number }[]>`
        ${qryCount}
        ${baseWhere}
      `;

      // Database PostgreSQL sering mengembalikan COUNT(*) sebagai string/BigInt, konversi ke Number agar aman
      const total = Number(countResult[0]?.total || 0);

      return {
        data,
        total,
        page,
        limit,
        total_data: total,
        total_page: Math.ceil(total / limit) || 1,
      };
    } catch (error) {
      // 5. Catat log error asli di terminal server (Aman dari pengguna luar)
      console.error("Error pada UserModel.getAllList:", error);

      // 6. Lempar error dengan pesan yang aman untuk dikonsumsi API / UI Client
      throw new Error("Gagal mengambil daftar pengguna dari sistem.");
    }
  }

  static qry() {
    const qry = sql`
     SELECT 
        p.name as port_name, 
        ug.name AS group_name ,
        u.locking,
        u.phone,
        u.id,
        u.first_name,
        u.last_name,
        u.username,
        u.username_phone,
        u.extension_phone,
        u.admin_pannel_login,
        u.validator_login,
        u.e_ktp_reader_login,
        u.cs_login,
        u.pos_login,
        u.verifier_login,
        u.command_center_login,
        u.status
        FROM core.t_mtr_user u
        LEFT JOIN core.t_mtr_user_group ug ON ug.id = u.user_group_id 
        LEFT JOIN app.t_mtr_port p on u.port_id=p.id 
    `;
    return qry;
  }
  static qryCount() {
    const qry = sql`
        SELECT 
            COUNT(u.id)::INT AS total 
        FROM core.t_mtr_user u
        LEFT JOIN core.t_mtr_user_group ug ON ug.id = u.user_group_id 
        LEFT JOIN app.t_mtr_port p on u.port_id=p.id 
    `;
    return qry;
  }
}
