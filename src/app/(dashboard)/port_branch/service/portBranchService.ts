import { PortBranchModel } from "../models/portBranchModel";

export interface BranchDetail {
  ship_class_name: string | null;
  port_name: string | null;
  id: string;
  port_id: string;
  ship_class: string;
  name: string;
  [key: string]: any;
}

// Definisikan interface baru untuk tipe kembalian terpaginasi agar TypeScript aman
export interface PaginatedBranchResult {
  data: BranchDetail[];
  total: number;
}

export class PortBranchService {
  /**
   * Mengambil data branch beserta nama port dan kelas kapal terkait dengan fitur pagination.
   * Meneruskan searchParams ke layer Model dan mengembalikan data beserta total barisnya.
   */
  static async getAllBranchesWithDetails(
    searchParams: URLSearchParams,
  ): Promise<PaginatedBranchResult> {
    console.log(searchParams);
    // WAJIB menggunakan return await agar data asinkronus dari database diteruskan ke API Route
    return await PortBranchModel.getAllBranchesWithDetails(searchParams);
  }
}
