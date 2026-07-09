import React from "react";
// Impor tipe data properti kolom dari UI DataGrid Anda
import { ColumnProps } from "@/components/ui/DataGrid";
import type { TableUsers } from "../interfaces/users";
import Btn from "@/components/ui/Btn";
import CrudIcons from "@/components/ui/CrudIcons";

/**
 * 1. Definisikan data mentah kolom secara ringkas tanpa menulis ulang nama properti objek.
 * Tambahkan 'as const' di akhir agar TypeScript membaca nilai literal kuncinya secara presisi.
 */
const rawColumnsConfig = [
  ["no", "NO", "w-12 text-center text-slate-500"],
  ["username", "Username", "font-semibold text-slate-800"],
  ["first_name", "Nama Depan", "text-slate-700"],
  ["phone", "No. Telepon", "text-slate-600 font-medium"],
  ["group_name", "Group", "w-28 font-mono text-slate-500 font-medium"],
] as const;

/**
 * 2. Lakukan pemetaan otomatis menggunakan .map()
 * Langkah ini membuat SonarQube hanya membaca 1 baris token properti, bukan 5 baris berulang!
 */
const baseColumns: ColumnProps<TableUsers>[] = rawColumnsConfig.map(
  ([key, header, className]) => ({
    key: key as keyof TableUsers | "actions",
    header,
    className,
  }),
);

/**
 * 3. Fungsi Utama Pembuat Kolom Tabel User
 * Ubah 'onEdit' menjadi parameter opsional menggunakan tanda tanya (?) agar bisa dipanggil kosongan.
 */
export const getUserColumns = (
  onEdit?: (data: any) => void, // <-- Ditambahkan tanda ? agar opsional dan bisa dipanggil kosongan
): ColumnProps<TableUsers>[] => [
  ...baseColumns,

  // Kolom Status
  {
    key: "status",
    header: "STATUS",
    className: "text-center w-28",
    render: (row) => {
      const isStatusActive = String(row.status) === "1";
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            isStatusActive
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {isStatusActive ? "Aktif" : "Non Aktif"}
        </span>
      );
    },
  },

  // Kolom Aksi
  {
    key: "actions",
    header: "AKSI",
    className: "text-center whitespace-nowrap text-xs font-semibold",
    render: (row) => (
      <div className="flex flex-row items-center gap-1.5">
        {/* Tombol Edit: Menggunakan safe navigation ?. agar tidak error saat onEdit tidak dikirim */}
        <Btn
          type="button"
          variant="info"
          size="xs"
          title="edit"
          onClick={() =>
            onEdit?.({
              id: row.id,
              username: row.username,
              namaDepan: row.first_name,
              noTelepon: row.phone,
              group: row.group_name,
              status: String(row.status),
            })
          }
        >
          <CrudIcons name="edit" size={10} />
        </Btn>

        <Btn type="button" variant="success" size="xs" title="Aktif">
          <CrudIcons name="active" size={10} />
        </Btn>

        <Btn type="button" variant="delete" size="xs" title="Non Aktif">
          <CrudIcons name="inactive" size={10} />
        </Btn>

        <Btn type="button" variant="delete" size="xs" title="Delete">
          <CrudIcons name="delete" size={10} />
        </Btn>
      </div>
    ),
  },
];
