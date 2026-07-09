import { sql } from "@/lib/db";
import type { UserQueryResult } from "../interfaces/users";
import {
  parsePagination,
  buildWhereClause,
  formatPaginatedResponse,
  PaginatedResult,
} from "@/utils/queryHelper";

export class UsersModel {
  /**
   * Mengambil data branch terpaginasi menggunakan parameter halaman dan batasan data.
   * Menggunakan Tagged Template Literal agar parameter terikat dinamis dan aman dari SQL Injection.
   */
  static async getAllList(
    searchParams: URLSearchParams,
  ): Promise<PaginatedResult<UserQueryResult>> {
    try {
      // 1. SOLUSI SONARQUBE: Ekstraksi parameter via global helper
      const { search, page, limit, offset } = parsePagination(searchParams);

      // 2. SOLUSI SONARQUBE: Pembuatan filter WHERE via global helper
      const baseWhere = buildWhereClause(search, "u", "username");

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

      const total = Number(countResult[0]?.total || 0);

      // 5. SOLUSI SONARQUBE: Return response terformat via global helper
      return formatPaginatedResponse(data, total, page, limit);
    } catch (error) {
      console.error("Error pada UserModel.getAllList:", error);
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
