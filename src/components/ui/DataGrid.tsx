"use client";

import React, { useEffect } from "react";

export interface ColumnProps<T> {
  key: keyof T | "actions";
  header: string;
  className?: string;
  headerClassName?: string;
  render?: (row: T) => React.ReactNode;
}

interface DataGridProps<T> {
  data: T[]; // Data bersih yang sudah dipaginasi oleh Backend PostgreSQL
  columns: ColumnProps<T>[];

  // PROPERTI UNTUK MENGONTROL SERVER-SIDE PAGINATION
  currentPage: number;
  rowsPerPage: number;
  totalData: number; // Mengambil total_data dari metadata PostgreSQL backend
  onPageChange: (newPage: number) => void; // Fungsi callback untuk mengubah halaman di luar
  onRowsPerPageChange: (newLimit: number) => void; // Fungsi callback untuk mengubah limit di luar
}

export default function DataGrid<T extends { id: string }>({
  data,
  columns,
  currentPage,
  rowsPerPage,
  totalData,
  onPageChange,
  onRowsPerPageChange,
}: Readonly<DataGridProps<T>>) {
  // Hitung total halaman berdasarkan data COUNT asli dari database
  const totalPages = Math.ceil(totalData / rowsPerPage) || 1;
  const indexOfFirstRow = (currentPage - 1) * rowsPerPage;
  const indexOfLastRow = Math.min(indexOfFirstRow + rowsPerPage, totalData);

  // Auto-reset ke halaman 1 secara aman jika user memperkecil pilihan limit data
  useEffect(() => {
    if (currentPage > totalPages) {
      onPageChange(1);
    }
  }, [rowsPerPage, currentPage, totalPages, onPageChange]);

  // Hitung rentang halaman dinamis (Maksimal 5 angka tombol)
  const getPaginationNumbers = (): number[] => {
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = startPage + maxButtons - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    const pages: number[] = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="space-y-4 w-full">
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {columns.map((col) => (
                    <th
                        key={col.header}
                        className={`p-4 ${col.headerClassName || ""}`}
                        >
                        {col.header}
                    </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {data.length > 0 ? (
                data.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.header}
                        className={`p-4 ${col.className || ""}`}
                      >
                        {col.render
                          ? col.render(row)
                          : (row[col.key as keyof T] as React.ReactNode)}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="p-12 text-center text-slate-400 font-normal"
                  >
                    ⚠️ Tidak ada data yang ditemukan dari database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* GRID FOOTER / PAGINATION CONTROL */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center text-xs text-slate-600 w-full">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto text-center sm:text-left">
            <div>
              Menampilkan{" "}
              <span className="text-slate-900 font-bold">
                {totalData === 0 ? 0 : indexOfFirstRow + 1}
              </span>{" "}
              sampai{" "}
              <span className="text-slate-900 font-bold">{indexOfLastRow}</span>{" "}
              dari <span className="text-slate-900 font-bold">{totalData}</span>{" "}
              entri data
            </div>

            <div className="flex items-center gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
              <span className="text-slate-400 text-[11px]">Tampilkan:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
                className="bg-white border border-slate-300 rounded-md px-2 py-1 text-slate-700 font-medium focus:outline-none focus:border-blue-500 cursor-pointer text-[11px] shadow-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Navigasi Tombol Angka */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => onPageChange(1)}
                className="px-2.5 py-1 rounded border border-slate-200 bg-white disabled:opacity-50 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors disabled:hover:bg-white"
                title="Halaman Pertama"
              >
                &lt;&lt;
              </button>

              <button
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="px-2.5 py-1 rounded border border-slate-200 bg-white disabled:opacity-50 text-slate-700 text-sm hover:bg-slate-50 transition-colors disabled:hover:bg-white"
                title="Sebelumnya"
              >
                &lt;
              </button>

              {getPaginationNumbers().map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => onPageChange(pageNumber)}
                  className={`px-3 py-1 rounded border text-sm font-medium transition-colors ${
                    currentPage === pageNumber
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="px-2.5 py-1 rounded border border-slate-200 bg-white disabled:opacity-50 text-slate-700 text-sm hover:bg-slate-50 transition-colors disabled:hover:bg-white"
                title="Selanjutnya"
              >
                &gt;
              </button>

              <button
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(totalPages)}
                className="px-2.5 py-1 rounded border border-slate-200 bg-white disabled:opacity-50 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors disabled:hover:bg-white"
                title="Halaman Terakhir"
              >
                &gt;&gt;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
