import { sql } from "@/lib/db";
import { menuFormSchema } from "../schema/menu.schema";
import z from "zod";

type ValidMenuInput = z.infer<typeof menuFormSchema>;

export interface RawMenuActionRow {
    menu_id: string | number;
    action_id: string | number;
}

export type MasterActionMap = Record<
    string | number,
    Array<{ id: string | number; name: string }>
>;

export class MenuService {
    static async getMenu() {
        try {
            const result = await sql`
        select 
            id,
            NULLIF(parent_id, 0) AS parent_id,
            "name" ,
            slug ,
            "order" 
            from core.t_mtr_menu_web tmmw 
            where status =1
        ORDER BY parent_id , "order" asc 
      `;
            if (!result || result.length === 0) {
                return [];
            }
            return result;
        } catch (error) {
            console.error("Error fetching menu data:", error);
            throw new Error(`Failed to fetch menu data: ${error}`);
        }
    }
    static async getMenuAction() {
        try {
            const result = await sql`
            select 
            tmmdw.action_id ,
            tmmdw.menu_id  ,
            a.action_name as name
            from core.t_mtr_menu_detail_web tmmdw 
            left join  core.t_mtr_menu_action a   on tmmdw.action_id = a.id
            
        `;
            if (!result || !Array.isArray(result)) {
                return {};
            }

            // 2. Perform the declarative reducer transformation loop
            const masterAction = result.reduce<MasterActionMap>(
                (accumulator, row) => {
                    // 💡 Ekstrak menu_id, action_id, dan properti name dari baris data (row)
                    const { menu_id, action_id, name } = row;

                    // Initialize structural arrays dynamically per key if undefined
                    if (!accumulator[menu_id]) {
                        accumulator[menu_id] = [];
                    }

                    // 💡 Ubah push primitive menjadi push objek yang berisi id dan name
                    accumulator[menu_id].push({
                        id: action_id,
                        name: name, // Menyimpan teks nama aksinya (misal: "Create", "Edit", "Delete")
                    });

                    return accumulator;
                },
                {},
            );

            return masterAction;
        } catch (error) {
            console.error("Error fetching menu data:", error);
            throw new Error(`Failed to fetch menu data: ${error}`);
        }
    }
    static async getMasterAction() {
        try {
            const result = await sql`
            select 
            a.id,
            a.action_name
            from core.t_mtr_menu_action a 
        `;
            if (!result || !Array.isArray(result)) {
                return {};
            }

            return result;
        } catch (error) {
            console.error("Error fetching menu data:", error);
            throw new Error(`Failed to fetch menu data: ${error}`);
        }
    }
    static async edit(searchParams: URLSearchParams) {
        try {
            const id = searchParams.get("id");
            const result = await sql`
            select 
                tmmw.id,
                NULLIF(tmmw.parent_id, 0) AS parent_id,
                tmmw.name ,
                tmmw.slug ,
                tmmw."order",
                mn2.name as parent_name
                from core.t_mtr_menu_web tmmw 
                left join core.t_mtr_menu_web  mn2 on tmmw.parent_id = mn2.id
                where tmmw.id = ${id}
        `;

            // 💡 JIKA DATA TIDAK DITEMUKAN: Kembalikan null (bukan array kosong [])
            if (!result || result.length === 0) {
                return null;
            }

            // Ambil baris pertama dari query SQL Anda
            const row = result[0];
            const masterAction = await this.getMenuAction();

            // 💡 SOLUSI: Langsung return satu objek murni (Single Object)
            return {
                id: Number(row.id),
                parent_id:
                    row.parent_id !== null ? Number(row.parent_id) : null,
                parent_name: row.parent_name || null,
                name: String(row.name || "").trim(),
                slug: String(row.slug || "").toLowerCase(),
                order: Number(row.order || 0),
                action_id: masterAction[row.id]?.map((item) => item.id) || null,
                action_name:
                    masterAction[row.id]?.map((item) => item.name) || null,
            };
        } catch (error) {
            console.error("Error fetching menu data:", error);
            throw new Error(`Failed to fetch menu data: ${error}`);
        }
    }
    static async add(searchParams: URLSearchParams) {
        try {
            const masterAction = await this.getMasterAction();
            const menu = await this.getMenu();

            return {
                action: masterAction || null,
                menu: menu || null,
            };
        } catch (error) {
            console.error("Error fetching menu data:", error);
            throw new Error(`Failed to fetch menu data: ${error}`);
        }
    }
    static async createMenu(data: ValidMenuInput) {
        try {
            console.log("[Service] Menerima data tervalidasi:", data);
        } catch (error) {
            console.error(
                "[MenuService Error] Gagal menyimpan ke database:",
                error,
            );
            throw new Error(`Database Error: ${error}`);
        }
    }
}
