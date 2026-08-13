import { UsersModel } from "../models/usersModel";

export interface PaginatedResult<T> {
    recordsFiltered: number;
    recordsTotal: string | number;
    pageTotal: number;
    currentPage: number;
    start: number;
    records: T[];
}

export class UsersService {
    /**
     * Mengambil data branch beserta nama port dan kelas kapal terkait dengan fitur pagination.
     * Menggunakan <any> agar type-safe global pagination tetap terjaga tanpa mengikat tipe internal model.
     */
    static async getAllList(
        // 👈 FIX: REMOVE `<T>` from here. Do not make the method signature generic.
        searchParams: URLSearchParams,
    ): Promise<PaginatedResult<any>> {
        // 👈 FIX: Set this to `any` to match the model payload seamlessly
        // WAJIB menggunakan return await agar data asinkronus dari database diteruskan ke API Route
        return await UsersModel.getAllList(searchParams);
    }
}
