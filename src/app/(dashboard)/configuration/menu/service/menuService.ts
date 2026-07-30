import { sql } from "@/lib/db";
import { menuFormSchema } from "../schema/menu.schema";
import z from "zod";

type ValidMenuInput = z.infer<typeof menuFormSchema>;

export interface RawMenuActionRow {
    menu_id: string | number;
    action_id: string | number;
}

export type MasterActionMap = Record<string | number, (string | number)[]>;

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
            const masterAction = await this.getMenuAction();
            return result.map((row) => ({
                id: Number(row.id),
                parent_id:
                    row.parent_id !== null ? Number(row.parent_id) : null,
                name: String(row.name || "").trim(),
                slug: String(row.slug || "").toLowerCase(),
                order: Number(row.order || 0),
                action_id: masterAction[row.id],
            }));
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
            tmmdw.menu_id  
            from core.t_mtr_menu_detail_web tmmdw 
        `;
            if (!result || !Array.isArray(result)) {
                return {};
            }

            // 2. Perform the declarative reducer transformation loop
            const masterAction = result.reduce<MasterActionMap>(
                (accumulator, row) => {
                    const { menu_id, action_id } = row;

                    // Initialize structural arrays dynamically per key if undefined
                    if (!accumulator[menu_id]) {
                        accumulator[menu_id] = [];
                    }

                    // Append the target action_id primitive to the matching bucket
                    accumulator[menu_id].push(action_id);

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
