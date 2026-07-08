import { sql } from "@/lib/db"; // Sesuaikan lokasi impor instance sql Anda

// 1. Interface untuk baris data mentah dari database
export interface RawMenuItem {
  id: string;
  parent_id: string | null;
  name: string;
  icon: string | null;
  href: string | null;
  order: number;
}

// 2. Interface untuk hasil pohon menu yang sudah bersarang (Nested)
export interface NestedMenuItem extends RawMenuItem {
  children: NestedMenuItem[];
}

export class MenuService {
  /**
   * Mengambil data menu dari database berdasarkan ID Group User
   * dan menyusunnya langsung menjadi struktur pohon (Parent-Child)
   *
   * @param groupId ID atau kode grup pengguna (misal: 1, 2, 'ADMIN')
   * @returns Array dari objek pohon menu yang sudah terurut bersarang
   */
  public static async getMenu(
    groupId: string | number,
  ): Promise<NestedMenuItem[]> {
    try {
      // Proteksi awal jika groupId tidak valid
      if (!groupId) {
        console.warn(
          "MenuRepository.getMenu dipanggil tanpa groupId yang valid.",
        );
        return [];
      }

      // Eksekusi query aman dengan parameterized otomatis dari library postgres
      const flatMenus = await sql<RawMenuItem[]>`
        SELECT 
          cc.id, 
          cc.parent_id, 
          cc.name, 
          --cc.icon,
          '' as icon, 
          cc.slug as href, 
          cc.order 
        FROM core.t_mtr_privilege_web aa
        JOIN core.t_mtr_user_group bb ON bb.id = aa.user_group_id AND bb.status = 1 AND bb.id = ${groupId}
        JOIN core.t_mtr_menu_web cc ON cc.id = aa.menu_id AND cc.status = 1
        JOIN core.t_mtr_menu_detail_web dd ON dd.id = aa.menu_detail_id AND dd.status = 1
        JOIN core.t_mtr_menu_action ee ON ee.id = dd.action_id AND ee.status = 1 AND LOWER(ee.action_name) = 'view'
        WHERE aa.status = 1 
        ORDER BY cc.order ASC
      `;
      // Jika data kosong, langsung kembalikan array kosong
      if (!flatMenus || flatMenus.length === 0) {
        return [];
      }

      // Transformasikan hasil query datar menjadi struktur pohon hierarki
      return this.buildMenuTree(flatMenus);
    } catch (error) {
      console.error("Error pada MenuRepository.getMenu:", error);
      throw error || ` Silahkan Hubungi Administrator`;
    }
  }

  /**
   * Helper internal untuk memproses flat array menjadi struktur objek pohon secara efisien O(n)
   */
  private static buildMenuTree(items: RawMenuItem[]): NestedMenuItem[] {
    const menuMap: Record<string, NestedMenuItem> = {};
    const rootMenus: NestedMenuItem[] = [];

    // Langkah A: Daftarkan semua item ke dalam Map objek dengan array children kosong
    items.forEach((item: RawMenuItem) => {
      const isInvalidHref = !item.href || item.href === "#";

      item.href = isInvalidHref
        ? `/${item.id}` // Menghasilkan rute valid seperti "/12" bukan "null12" atau "#12"
        : item.href;

      menuMap[item.id] = { ...item, children: [] };
    });

    // Langkah B: Hubungkan menu anak ke induknya secara referensial
    items.forEach((item) => {
      const mappedItem = menuMap[item.id];

      if (item.parent_id && menuMap[item.parent_id]) {
        // Jika memiliki parent_id dan induknya ada di daftar, masukkan ke array children induknya
        menuMap[item.parent_id].children.push(mappedItem);
      } else {
        // Jika tidak punya parent_id atau induknya tidak ditemukan, anggap sebagai menu utama (root)
        rootMenus.push(mappedItem);
      }
    });

    return rootMenus;
  }
}
