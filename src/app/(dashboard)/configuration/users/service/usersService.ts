import { UsersModel } from "../models/usersModel";
import type { UserQueryResult } from "../interfaces/users";

// Definisikan interface baru untuk tipe kembalian terpaginasi agar TypeScript aman
export interface PaginatedBranchResult {
  data: UserQueryResult[];
  total: number;
}

export class UsersService {
  /**
   * Mengambil data branch beserta nama port dan kelas kapal terkait dengan fitur pagination.
   * Meneruskan searchParams ke layer Model dan mengembalikan data beserta total barisnya.
   */
  static async getAllList(
    searchParams: URLSearchParams,
  ): Promise<PaginatedBranchResult> {
    // WAJIB menggunakan return await agar data asinkronus dari database diteruskan ke API Route
    return await UsersModel.getAllList(searchParams);
  }
}
