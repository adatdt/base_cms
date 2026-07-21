import { sql } from "@/lib/db";

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

      return result;
    } catch (error) {
      console.error("Error fetching menu data:", error);
      throw new Error(`Failed to fetch menu data: ${error}`);
    }
  }
}
